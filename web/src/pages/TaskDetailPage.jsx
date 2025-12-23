import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import { useTranslatedContent } from '../hooks/useTranslatedContent'
import Icon from '../components/Icon'

function TaskDetailPage() {
  const { t } = useLanguage()
  const { taskId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}`)
      return res.data
    },
  })

  const task = data?.task

  const { translatedText: translatedTitle } = useTranslatedContent(task?.title || '', !!task?.title)
  const { translatedText: translatedDescription } = useTranslatedContent(task?.description || '', !!task?.description)

  const { data: familyData } = useQuery({
    queryKey: ['family', task?.familyId],
    queryFn: async () => {
      if (!task?.familyId) return null
      const res = await api.get(`/families/${task.familyId}`)
      return res.data
    },
    enabled: !!task?.familyId,
  })

  const members = familyData?.family?.members || []
  const currentUserMember = members.find((m) => m.user.id === user?.id)
  const isOwner = currentUserMember?.role === 'owner'
  const isAdmin = currentUserMember?.role === 'admin'
  const canDeleteTask = isOwner || isAdmin
  const isAssignedToCurrentUser = task?.assignees?.some((assignee) => assignee.user.id === user?.id) || false

  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Chuyển ISO date sang dạng local phù hợp với input datetime-local (YYYY-MM-DDTHH:mm)
  const toLocalInputValue = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const pad = (n) => String(n).padStart(2, '0')
    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setStatus(task.status)
      setDueDate(task.dueDate ? toLocalInputValue(task.dueDate) : '')
    }
  }, [task])

  const updateMutation = useMutation({
    mutationFn: async () => {
      setSaving(true)
      const res = await api.put(`/tasks/${taskId}`, {
        title,
        dueDate: dueDate || null,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      if (task?.familyId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', String(task.familyId)] })
      }
      setToast({ message: 'Đã lưu thay đổi thành công!', type: 'success' })
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || 'Lưu thay đổi thất bại', type: 'error' })
    },
    onSettled: () => setSaving(false),
  })

  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus })
      return res.data
    },
    onSuccess: (_, newStatus) => {
      setStatus(newStatus)
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      if (task?.familyId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', String(task.familyId)] })
      }
      const statusLabels = {
        'todo': t('notStarted'),
        'in-progress': t('inProgress'),
        'done': t('completed'),
      }
      setToast({ message: `${t('update')} ${t('status')}: "${statusLabels[newStatus] || newStatus}"`, type: 'success' })
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || t('updateFailed'), type: 'error' })
    },
  })

  const handleDelete = async () => {
    if (!task) return
    if (!window.confirm(t('confirmDelete'))) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setToast({ message: t('deleteSuccess'), type: 'success' })
      setTimeout(() => {
        if (task.familyId) {
          queryClient.invalidateQueries({ queryKey: ['tasks', String(task.familyId)] })
          navigate(`/families/${task.familyId}/tasks`)
        } else {
          navigate('/')
        }
      }, 1000)
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Xóa công việc thất bại', type: 'error' })
    }
  }

  const formatDueFull = (dateStr) => {
    if (!dateStr) return 'Chưa đặt hạn'
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-500 p-12">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 animate-spin"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Đang tải thông tin công việc...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!task) {
    return (
      <AppLayout>
        <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-500 p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Không tìm thấy công việc</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Có thể công việc đã bị xóa hoặc đường dẫn không chính xác.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
              >
                <Icon name="arrowLeft" className="text-white" size="sm" />
                <span>Về trang chủ</span>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('taskDetails') || 'Chi tiết công việc'}</h1>
          <p className="text-slate-900 dark:text-slate-300">
            {task.description || 'Chi tiết tiến độ công việc trong gia đình.'}
          </p>
        </div>
        <Link
          to={isAssignedToCurrentUser ? '/my-tasks' : `/families/${task.familyId}/tasks`}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#1F2937] px-4 py-2 text-sm text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition shadow-sm hover:shadow font-medium"
        >
          <Icon name="arrowLeft" className="text-slate-900 dark:text-slate-200" size="sm" />
          <span>{t('goBack')}</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Header với image và thông tin */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image bên trái */}
          <div className="w-full md:w-64 h-64 md:h-auto flex-shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100">
              {task.imageUrl ? (
                <img
                  src={task.imageUrl}
                  alt={task.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : (
                <img
                  src={`https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&id=${task.id}`}
                  alt={task.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              )}
              <div className="w-full h-full hidden items-center justify-center text-6xl text-slate-400">
                {task.title[0]?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Thông tin bên phải */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{translatedTitle || task.title}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-900 dark:text-slate-300">{t('priorityLabel')}</span>
                <span 
                  className={`px-3 py-1 rounded font-medium text-sm ${
                    task.priority === 'high' || task.priority === 'extreme'
                      ? 'bg-red-100'
                      : task.priority === 'low'
                      ? 'bg-green-100'
                      : 'bg-blue-100'
                  }`}
                  style={{ 
                    color: task.priority === 'high' || task.priority === 'extreme' 
                      ? '#991b1b' 
                      : task.priority === 'low' 
                      ? '#166534' 
                      : '#1e40af',
                    fontWeight: '600'
                  }}
                >
                  {task.priority === 'high' ? t('high') : task.priority === 'moderate' ? t('moderate') : task.priority === 'low' ? t('low') : task.priority || t('moderate')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Trạng thái:</span>
                <StatusBadge status={status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-900 dark:text-slate-300">{t('createdDateLabel')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900 dark:text-slate-300">Hạn:</span>
                  <span className="text-sm text-slate-900 dark:text-slate-100">
                    {formatDueFull(task.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('taskDescription')}</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {translatedDescription || task.description}
            </p>
          </div>
        )}

        {/* Form chỉnh sửa */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
          className="space-y-5 rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#25292D] px-6 py-5 shadow-sm"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <span>📝</span>
              <span>{t('taskTitle')}</span>
            </label>
            <input
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Icon name="calendar" className="text-slate-900 dark:text-slate-100" size="sm" />
              <span>{t('dueDateLabel')}</span>
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span>🔄</span>
              <span>{t('status')}</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'todo', label: t('notStarted'), iconName: 'pause', color: 'from-slate-400 to-slate-500' },
                { value: 'in-progress', label: t('inProgress'), iconName: 'refresh', color: 'from-amber-400 to-orange-500' },
                { value: 'done', label: t('completed'), iconName: 'check', color: 'from-emerald-400 to-teal-500' },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => statusMutation.mutate(s.value)}
                  className={`rounded-xl px-5 py-3 border-2 font-medium text-sm transition-all ${
                    status === s.value
                      ? `bg-gradient-to-r ${s.color} border-transparent text-white shadow-md scale-105`
                      : 'bg-white dark:bg-[#1F2937] border-slate-200 dark:border-slate-500 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name={s.iconName} className={status === s.value ? 'text-white' : 'text-slate-900 dark:text-slate-200'} size="sm" />
                    <span>{s.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-between pt-4 border-t-2 border-slate-200 dark:border-slate-500">
            {canDeleteTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all"
              >
                <Icon name="trash" className="text-white" size="sm" />
                <span>{t('deleteTask')}</span>
              </button>
            ) : (
              <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>🔒</span>
                <span>{t('onlyOwnerCanDelete')}</span>
              </div>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white hover:from-sky-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              disabled={saving}
            >
              <Icon name={saving ? 'hourglass' : 'save'} className="text-white" size="sm" />
              <span>{saving ? t('saving') : t('saveChanges')}</span>
            </button>
          </div>
        </form>

        {/* Placeholder cho timeline & bình luận sau này */}
        <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1F2937] px-6 py-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-slate-600 dark:to-slate-500 flex items-center justify-center">
              <Icon name="chart" className="text-slate-700 dark:text-white" size="xl" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Tính năng sắp ra mắt</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md">
                Timeline tiến độ, biểu đồ và bình luận sẽ được hiển thị chi tiết hơn trong giai đoạn sau.
              </p>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}

export default TaskDetailPage

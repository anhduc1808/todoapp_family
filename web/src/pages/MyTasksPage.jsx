import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import AddTaskModal from '../components/AddTaskModal'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import Icon from '../components/Icon'

function MyTasksPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('today') // today, week, month, all
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState(null)

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const res = await api.get('/tasks/my')
      return res.data
    },
  })

  const { data: familiesData } = useQuery({
    queryKey: ['myFamilies'],
    queryFn: async () => {
      const res = await api.get('/families')
      return res.data
    },
  })

  const allTasks = tasksData?.tasks || []
  const families = familiesData?.families || []
  
  // Tự động chọn family đầu tiên nếu chỉ có 1 family
  const defaultFamilyId = families.length === 1 ? families[0].id : null
  
  // Lấy members của family được chọn (sử dụng selectedFamilyId hoặc defaultFamilyId)
  const familyIdToQuery = selectedFamilyId || defaultFamilyId
  const { data: selectedFamilyData } = useQuery({
    queryKey: ['family', familyIdToQuery],
    queryFn: async () => {
      if (!familyIdToQuery) return null
      const res = await api.get(`/families/${familyIdToQuery}`)
      return res.data
    },
    enabled: !!familyIdToQuery,
  })
  
  const selectedFamilyMembers = selectedFamilyData?.family?.members || []

  // Lọc tasks theo thời gian và search
  const { todoTasks, completedTasks, stats } = useMemo(() => {
    let filtered = [...allTasks]

    // Lọc theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.family?.name?.toLowerCase().includes(query)
      )
    }

    // Lọc theo thời gian
    if (timeFilter !== 'all') {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      filtered = filtered.filter((t) => {
        if (!t.dueDate) return false

        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        if (timeFilter === 'today') {
          return dueDate.getTime() === now.getTime()
        } else if (timeFilter === 'week') {
          const startOfWeek = new Date(now)
          const day = startOfWeek.getDay()
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
          startOfWeek.setDate(diff)
          startOfWeek.setHours(0, 0, 0, 0)

          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          endOfWeek.setHours(23, 59, 59, 999)

          return dueDate >= startOfWeek && dueDate <= endOfWeek
        } else if (timeFilter === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          return dueDate >= startOfMonth && dueDate <= endOfMonth
        }
        return true
      })
    }

    // Phân loại tasks
    const todo = filtered.filter((t) => {
      const status = t.status?.toLowerCase()
      return status !== 'done'
    })

    const completed = filtered.filter((t) => {
      const status = t.status?.toLowerCase()
      return status === 'done'
    })

    const total = filtered.length || 1
    const completedCount = completed.length
    const inProgressCount = filtered.filter(
      (t) => t.status?.toLowerCase() === 'in-progress' || t.status?.toLowerCase() === 'doing'
    ).length
    const notStartedCount = filtered.filter((t) => t.status?.toLowerCase() === 'todo').length

    return {
      todoTasks: todo,
      completedTasks: completed,
      stats: {
        total,
        completed: completedCount,
        inProgress: inProgressCount,
      },
    }
  }, [allTasks, searchQuery, timeFilter])

  // Cập nhật trạng thái task
  const statusMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      await api.patch(`/tasks/${taskId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      setToast({ message: 'Cập nhật trạng thái thành công!', type: 'success' })
    },
    onError: () => {
      setToast({ message: 'Cập nhật trạng thái thất bại', type: 'error' })
    },
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase()
    if (p === 'high' || p === 'extreme') return 'text-red-600 dark:text-red-400'
    if (p === 'low') return 'text-green-600 dark:text-green-400'
    return 'text-blue-600 dark:text-blue-400' // Moderate
  }

  const getPriorityBgColor = (priority) => {
    const p = priority?.toLowerCase()
    if (p === 'high' || p === 'extreme') return 'bg-red-100'
    if (p === 'low') return 'bg-green-100'
    return 'bg-blue-100' // Moderate
  }

  const getPriorityTextColor = (priority) => {
    const p = priority?.toLowerCase()
    if (p === 'high' || p === 'extreme') return '#991b1b' // red-800
    if (p === 'low') return '#166534' // green-800
    return '#1e40af' // blue-800
  }

  const getStatusBgColor = (status) => {
    const s = status?.toLowerCase()
    if (s === 'done' || s === 'completed') return 'bg-green-100'
    if (s === 'in-progress' || s === 'doing') return 'bg-blue-100'
    return 'bg-red-100' // Not Started
  }

  const getStatusTextColor = (status) => {
    const s = status?.toLowerCase()
    if (s === 'done' || s === 'completed') return '#166534' // green-800
    if (s === 'in-progress' || s === 'doing') return '#1e40af' // blue-800
    return '#991b1b' // red-800
  }

  // Generate placeholder image based on task
  const getTaskImage = (task) => {
    // Ưu tiên ảnh thật từ database
    if (task.imageUrl) {
      return task.imageUrl
    }
    // Placeholder images based on task content
    const images = [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
    ]
    return images[task.id % images.length] || images[0]
  }

  const DonutChart = ({ percentage, color, label }) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={color}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${color}`}>{percentage}%</span>
          </div>
        </div>
        <span className="text-xs text-slate-700 dark:text-slate-300 mt-2">{label}</span>
      </div>
    )
  }

  return (
    <AppLayout
      showSearch={true}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('welcomeBack')}, {user?.name || t('user')}
        </h1>
      </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - To-Do */}
            <div className="lg:col-span-2 space-y-6">
              {/* To-Do Section */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {t('toDo')}
                      </h2>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {new Date().toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'long',
                        })}{' '}
                        • {t('today')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (families.length === 0) {
                        setToast({ message: 'Bạn chưa tham gia gia đình nào. Vui lòng tạo hoặc tham gia gia đình trước.', type: 'error' })
                        return
                      }
                      // Chọn family (mặc định hoặc đầu tiên) và tự động assign cho chính user
                      const familyToUse = defaultFamilyId || families[0]?.id
                      if (familyToUse) {
                        setSelectedFamilyId(familyToUse)
                        setOpenAddTaskModal(true)
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-orange-600 hover:border-orange-600 transition-all"
                  >
                    <Icon name="plus" className="text-white" size="sm" />
                    <span>{t('addTask')}</span>
                  </button>
                </div>

                {/* Time Filter */}
                <div className="flex gap-2 mb-4">
                  {[
                    { value: 'today', label: t('today') },
                    { value: 'week', label: t('thisWeek') },
                    { value: 'month', label: t('thisMonth') },
                    { value: 'all', label: t('all') },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setTimeFilter(f.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        timeFilter === f.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Task List */}
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  </div>
                ) : todoTasks.length > 0 ? (
                  <div className="space-y-4">
                    {todoTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group relative bg-white dark:bg-[#1E1E1E] rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-4 overflow-visible">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={(e) => {
                              e.stopPropagation()
                              statusMutation.mutate({ taskId: task.id, status: 'done' })
                            }}
                            className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 overflow-visible" style={{ minWidth: 0, overflow: 'visible' }}>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm font-normal text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-2 overflow-visible">
                              <span 
                                className={`px-2.5 py-1 rounded ${getPriorityBgColor(task.priority)} font-medium whitespace-nowrap inline-block flex-shrink-0`}
                                style={{ color: getPriorityTextColor(task.priority), fontWeight: '600' }}
                              >
                                {t('priorityLabel')} {task.priority === 'high' ? t('high') : task.priority === 'moderate' ? t('moderate') : task.priority === 'low' ? t('low') : task.priority || t('moderate')}
                              </span>
                              <span 
                                className={`px-2.5 py-1 rounded ${getStatusBgColor(task.status)} font-medium whitespace-nowrap inline-block flex-shrink-0`}
                                style={{ color: getStatusTextColor(task.status), fontWeight: '600' }}
                              >
                                {t('statusLabel')} {task.status === 'in-progress' ? t('inProgress') : task.status === 'done' ? t('completed') : task.status === 'todo' ? t('notStarted') : task.status || t('notStarted')}
                              </span>
                              {task.createdAt && (
                                <span className="text-slate-500 dark:text-slate-300">
                                  {t('createdDateLabel')} {formatDate(task.createdAt)}
                                </span>
                              )}
                            </div>
                            {task.dueDate && (
                              <div className="text-xs text-slate-500 dark:text-slate-300">
                                {formatDateTime(task.dueDate)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-start gap-2">
                            {/* Image Thumbnail */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#25292D] flex-shrink-0">
                              <img
                                src={getTaskImage(task)}
                                alt={task.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-full hidden items-center justify-center text-2xl">
                                {task.title[0]?.toUpperCase()}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 text-lg"
                            >
                              ⋮
                            </button>
                          </div>
                        </div>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="absolute inset-0"
                          aria-label={`Xem công việc ${task.title}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-700 dark:text-slate-300">
                    <p>Không có công việc nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Completed Tasks */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✓</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('completedTasks')}</h2>
                </div>
                {completedTasks.length > 0 ? (
                  <div className="space-y-3">
                    {completedTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="group relative bg-white dark:bg-[#1E1E1E] rounded-lg p-3 border border-slate-200 dark:border-slate-600 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-green-600"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs font-normal text-slate-700 dark:text-slate-300 mb-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                              {t('statusLabel')} {t('completed')}
                            </p>
                            {task.updatedAt && (
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                                {t('completed')} {formatDate(task.updatedAt)}
                              </p>
                            )}
                          </div>
                          {/* Image Thumbnail */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#25292D] flex-shrink-0">
                            <img
                              src={getTaskImage(task)}
                              alt={task.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                            <div className="w-full h-full hidden items-center justify-center text-lg">
                              {task.title[0]?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="absolute inset-0"
                          aria-label={`Xem công việc ${task.title}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-700 dark:text-slate-300 text-sm">
                    <p>{t('noCompletedTasks')}</p>
                  </div>
                )}
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
      {familyIdToQuery && (
        <AddTaskModal
          isOpen={openAddTaskModal}
          onClose={() => {
            setOpenAddTaskModal(false)
            setSelectedFamilyId(null)
          }}
          familyId={familyIdToQuery}
          members={selectedFamilyMembers}
          autoAssignToCurrentUser={true}
          onSuccess={() => {
            setToast({ message: t('createSuccess') || 'Tạo công việc thành công!', type: 'success' })
            queryClient.invalidateQueries({ queryKey: ['myTasks'] })
          }}
        />
      )}
    </AppLayout>
  )
}

export default MyTasksPage

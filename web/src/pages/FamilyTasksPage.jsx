import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import socket from '../realtime/socket'
import AppLayout from '../components/AppLayout'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import AddTaskModal from '../components/AddTaskModal'
import InviteMemberModal from '../components/InviteMemberModal'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import Icon from '../components/Icon'

function FamilyTasksPage() {
  const { t } = useLanguage()
  const { familyId } = useParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false)
  const [openInviteMemberModal, setOpenInviteMemberModal] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('all')
  const [toast, setToast] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState('asc')

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', familyId, selectedMemberId],
    queryFn: async () => {
      const params =
        selectedMemberId && selectedMemberId !== 'all'
          ? `?memberId=${selectedMemberId}`
          : ''
      const res = await api.get(`/families/${familyId}/tasks${params}`)
      return res.data
    },
  })

  const { data: familyData } = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}`)
      return res.data
    },
  })

  const members = familyData?.family?.members || []
  const currentUserMember = members.find((m) => m.user.id === user?.id)
  const isOwner = currentUserMember?.role === 'owner'
  const isAdmin = currentUserMember?.role === 'admin'
  const canManageTasks = isOwner || isAdmin

  useEffect(() => {
    socket.connect()
    socket.emit('join_family', familyId)

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', familyId, selectedMemberId] })
    }

    socket.on('task_created', handler)
    socket.on('task_updated', handler)
    socket.on('task_deleted', handler)

    return () => {
      socket.off('task_created', handler)
      socket.off('task_updated', handler)
      socket.off('task_deleted', handler)
      socket.disconnect()
    }
  }, [familyId, selectedMemberId, queryClient])


  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }) => {
      const res = await api.patch(`/families/${familyId}/members/${memberId}/role`, { role })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId] })
    },
  })



  const allTasks = tasksData?.tasks || []

  // Lọc và sắp xếp tasks
  const tasks = useMemo(() => {
    let filtered = [...allTasks]

    // Lọc theo thời gian (deadline)
    if (timeFilter !== 'all') {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter((t) => {
        if (!t.dueDate) return false // Bỏ qua task không có deadline
        
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        
        if (timeFilter === 'today') {
          // Hôm nay
          return dueDate.getTime() === now.getTime()
        } else if (timeFilter === 'week') {
          // Tuần này (từ thứ 2 đến chủ nhật)
          const startOfWeek = new Date(now)
          const day = startOfWeek.getDay()
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Thứ 2
          startOfWeek.setDate(diff)
          startOfWeek.setHours(0, 0, 0, 0)
          
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          endOfWeek.setHours(23, 59, 59, 999)
          
          return dueDate >= startOfWeek && dueDate <= endOfWeek
        } else if (timeFilter === 'month') {
          // Tháng này
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          
          return dueDate >= startOfMonth && dueDate <= endOfMonth
        }
        return true
      })
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => {
        const status = t.status?.toLowerCase()
        if (statusFilter === 'todo') return status === 'todo'
        if (statusFilter === 'in-progress') return status === 'in-progress' || status === 'doing'
        if (statusFilter === 'done') return status === 'done'
        return true
      })
    }

    // Sắp xếp
    filtered.sort((a, b) => {
      let result = 0
      
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) result = 0
        else if (!a.dueDate) result = 1
        else if (!b.dueDate) result = -1
        else result = new Date(a.dueDate) - new Date(b.dueDate)
      } else if (sortBy === 'title') {
        result = a.title.localeCompare(b.title, 'vi')
      } else if (sortBy === 'status') {
        const statusOrder = { done: 0, 'in-progress': 1, doing: 1, todo: 2 }
        const aStatus = statusOrder[a.status?.toLowerCase()] ?? 3
        const bStatus = statusOrder[b.status?.toLowerCase()] ?? 3
        result = aStatus - bStatus
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, normal: 1, low: 2 }
        const aPriority = priorityOrder[a.priority?.toLowerCase()] ?? 3
        const bPriority = priorityOrder[b.priority?.toLowerCase()] ?? 3
        result = aPriority - bPriority
      } else if (sortBy === 'createdAt') {
        if (!a.createdAt && !b.createdAt) result = 0
        else if (!a.createdAt) result = 1
        else if (!b.createdAt) result = -1
        else result = new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === 'assignees') {
        const aCount = a.assignees?.length || 0
        const bCount = b.assignees?.length || 0
        result = aCount - bCount
      }
      
      // Áp dụng thứ tự sắp xếp (tăng/giảm dần)
      return sortOrder === 'desc' ? -result : result
    })

    return filtered
  }, [allTasks, statusFilter, timeFilter, sortBy, sortOrder])

  // Tính thống kê cho danh sách task hiện tại (dựa trên filter)
  const stats = useMemo(() => {
    const base = { todo: 0, 'in-progress': 0, done: 0 }
    for (const t of tasks) {
      const s = t.status?.toLowerCase()
      if (s === 'done') base.done += 1
      else if (s === 'in-progress' || s === 'doing') base['in-progress'] += 1
      else base.todo += 1
    }
    const total = tasks.length || 1
    const donePercent = Math.round((base.done / total) * 100)
    return { ...base, total: tasks.length, donePercent }
  }, [tasks])

  const upcomingWarnings = useMemo(() => {
    const now = new Date()
    return allTasks.filter((t) => {
      if (!t.dueDate || t.status === 'done') return false
      const due = new Date(t.dueDate)
      const diffMinutes = (due - now) / (1000 * 60)
      return diffMinutes > 0 && diffMinutes <= 60
    })
  }, [allTasks])

  const currentMemberName = useMemo(() => {
    if (selectedMemberId === 'all') return t('allMembers')
    const m = members.find((x) => String(x.user.id) === String(selectedMemberId))
    return m ? m.user.name : t('members')
  }, [selectedMemberId, members])

  const formatShortDue = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('familyTasksTitle')}: {familyData?.family?.name || `#${familyId}`}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {t('trackAndAssign')}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E1E] px-4 py-2 text-sm text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm hover:shadow"
        >
          <Icon name="arrowLeft" className="text-slate-900 dark:text-slate-300" size="sm" />
          <span>{t('backToHome')}</span>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Danh sách thành viên */}
        {members.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Icon name="users" className="text-slate-700 dark:text-slate-300" size="sm" />
                {t('membersInFamily')}:
              </span>
              {members.map((m) => (
                <div
                  key={m.user.id}
                  className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-slate-600 px-3 py-1.5 shadow-sm group"
                >
                  <Link
                    to={`/families/${familyId}/members/progress?memberId=${m.user.id}`}
                    className="flex items-center gap-2 hover:text-sky-600 dark:hover:text-sky-400 transition"
                  >
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm group-hover:scale-110 transition">
                      {m.user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                      {m.user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-300">({t(m.role)})</span>
                    <Icon name="chart" className="text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition" size="sm" />
                  </Link>
                  {isOwner && m.role !== 'owner' && (
                    <select
                      value={m.role}
                      onChange={(e) => {
                        const newRole = e.target.value
                        updateRoleMutation.mutate(
                          { memberId: m.id, role: newRole },
                          {
                            onSuccess: () => {
                              const roleName = newRole === 'admin' ? t('admin') : t('member')
                              setToast({ message: t('roleUpdatedFor').replace('{name}', m.user.name).replace('{role}', roleName), type: 'success' })
                            },
                            onError: (err) => {
                              setToast({ message: err.response?.data?.message || t('roleUpdateFailedGeneric'), type: 'error' })
                            },
                          }
                        )
                      }}
                      className="ml-2 text-[10px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                      disabled={updateRoleMutation.isPending}
                    >
                      <option value="member">{t('member')}</option>
                      <option value="admin">{t('admin')}</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bộ lọc theo thành viên + thống kê tiến độ */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span>🔍</span>
              <span>{t('filterByMember')}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMemberId('all')}
                className={`rounded-full px-4 py-2 border text-xs font-medium transition-all ${
                  selectedMemberId === 'all'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 border-sky-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t('all')}
              </button>
              {members.map((m) => (
                <button
                  key={m.user.id}
                  type="button"
                  onClick={() => setSelectedMemberId(String(m.user.id))}
                  className={`rounded-full px-4 py-2 border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    String(selectedMemberId) === String(m.user.id)
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 border-sky-600 text-white shadow-md'
                      : 'bg-white dark:bg-[#1F2937] border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{m.user.name}</span>
                  <span className="text-[10px] text-slate-700 dark:text-slate-400">({t(m.role)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress statistics card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-100 mb-1 flex items-center gap-2 min-w-0">
              <Icon name="chart" className="text-slate-600 dark:text-slate-100 flex-shrink-0" size="sm" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{t('progressStats')}</span>
            </p>
            {/* Chip hiển thị All Members / tên thành viên - đổi màu theo chế độ */}
            <p className="text-sm font-semibold text-white mb-3 min-w-0 overflow-hidden text-ellipsis bg-slate-800 dark:bg-slate-600 px-3 py-1.5 rounded-lg border border-slate-600 dark:border-slate-500">
              {currentMemberName}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white dark:bg-[#1F2937] rounded-lg p-2 text-center">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('total')}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
              </div>
              <div className="bg-white dark:bg-[#1F2937] rounded-lg p-2 text-center">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('completed')}</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.done}</div>
              </div>
              <div className="bg-white dark:bg-[#1F2937] rounded-lg p-2 text-center">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('inProgress')}</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats['in-progress']}</div>
              </div>
              <div className="bg-white dark:bg-[#1F2937] rounded-lg p-2 text-center">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('notStarted')}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-300">{stats.todo}</div>
              </div>
            </div>
            {/* Thanh tiến độ */}
            <div className="mt-3 h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden shadow-inner border border-slate-300/70 dark:border-slate-600/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${stats.donePercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-900 dark:text-slate-200 text-center bg-white dark:bg-[#111827] px-2 py-1 rounded shadow-sm">
              {stats.donePercent}% {t('tasksCompleted')}
            </p>
          </div>
        </div>

        {/* Khối nhắc việc sắp đến hạn */}
        {upcomingWarnings.length > 0 && (
          <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 shadow-md">
            <div className="font-semibold mb-2 text-amber-800 flex items-center gap-2" style={{ color: '#92400e' }}>
              <Icon name="clock" className="text-amber-800" size="lg" style={{ color: '#92400e' }} />
              <span>{t('upcomingDeadline')}</span>
            </div>
            <ul className="space-y-1.5">
              {upcomingWarnings.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm text-amber-900" style={{ color: '#78350f' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  <span className="font-medium">{t.title}</span>
                  {t.dueDate && (
                    <span className="text-xs opacity-75">
                      – {t('deadlinePrefix')} {formatShortDue(t.dueDate)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hàng trên: button tạo task + khối mã mời */}
        {canManageTasks ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm flex items-center justify-center">
            <button
              onClick={() => setOpenAddTaskModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              <Icon name="plus" className="text-white" size="sm" />
              <span>{t('addNewTask')}</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm flex items-center justify-center">
            <button
              onClick={() => setOpenInviteMemberModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              <Icon name="users" className="text-white" size="sm" />
              <span>{t('inviteMember')}</span>
            </button>
          </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-600 text-center">
              <span className="flex items-center gap-2">
                <Icon name="lock" className="text-slate-600" size="sm" />
                {t('onlyOwnerCanManage')}
              </span>
            </p>
          </div>
        )}

        {/* Bộ lọc và sắp xếp */}
        <div className="rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#1F2937] px-5 py-4 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Bộ lọc theo thời gian */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Icon name="calendar" className="text-slate-700 dark:text-slate-300" size="sm" />
                <span>{t('time')}:</span>
              </span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: t('all'), iconName: 'list' },
                  { value: 'today', label: t('today'), iconName: 'calendar' },
                  { value: 'week', label: t('thisWeek'), iconName: 'chart' },
                  { value: 'month', label: t('thisMonth'), iconName: 'calendar' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTimeFilter(f.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      timeFilter === f.value
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'bg-white dark:bg-[#25292D] border-2 border-slate-200 dark:border-slate-500 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon name={f.iconName} className={timeFilter === f.value ? 'text-white' : 'text-slate-900 dark:text-slate-200'} size="sm" />
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Bộ lọc theo trạng thái */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 flex items-center gap-2">
                <Icon name="search" className="text-slate-500 dark:text-slate-300" size="sm" />
                <span>{t('status')}:</span>
              </span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: t('all'), iconName: 'list' },
                  { value: 'todo', label: t('notStarted'), iconName: 'pause' },
                  { value: 'in-progress', label: t('inProgress'), iconName: 'refresh' },
                  { value: 'done', label: t('completed'), iconName: 'check' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      statusFilter === f.value
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-[#25292D] border-2 border-slate-200 dark:border-slate-500 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon name={f.iconName} className={statusFilter === f.value ? 'text-white' : 'text-slate-900 dark:text-slate-200'} size="sm" />
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Sắp xếp */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>↑↓</span>
                <span>{t('sortByLabel')}:</span>
              </span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'dueDate', label: t('dueDateLabel'), iconName: 'calendar' },
                  { value: 'title', label: t('taskName'), iconName: 'note' },
                  { value: 'status', label: t('status'), iconName: 'refresh' },
                  { value: 'priority', label: t('priority'), iconName: 'star' },
                  { value: 'createdAt', label: t('createdAt'), iconName: 'new' },
                  { value: 'assignees', label: t('numberOfAssignees'), iconName: 'users' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      // Nếu click vào cùng một option, đảo ngược thứ tự
                      if (sortBy === s.value) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy(s.value)
                        setSortOrder('asc')
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      sortBy === s.value
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-[#25292D] border-2 border-slate-200 dark:border-slate-500 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon name={s.iconName} className={sortBy === s.value ? 'text-white' : 'text-slate-900 dark:text-slate-200'} size="sm" />
                    <span>{s.label}</span>
                    {sortBy === s.value && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {sortBy && (
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                title={`${t('sortBy')} ${sortOrder === 'asc' ? t('descending') : t('ascending')}`}
              >
                <span>{sortOrder === 'asc' ? `↑ ${t('ascending')}` : `↓ ${t('descending')}`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Danh sách công việc */}
        {tasksLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{t('loadingTaskList')}</p>
            </div>
          </div>
        ) : tasks.length ? (
          <div>
            <div className="mb-3 text-xs text-slate-700 dark:text-slate-300">
              {t('showingTasks').replace('{count}', tasks.length)}
            </div>
            <div className="space-y-3">
              {tasks.map((task) => {
              const statusColors = {
                'todo': 'from-slate-400 to-slate-500',
                'in-progress': 'from-amber-400 to-orange-500',
                'doing': 'from-amber-400 to-orange-500',
                'done': 'from-emerald-400 to-teal-500',
              }
              const statusColor = statusColors[task.status?.toLowerCase()] || statusColors.todo
              
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] px-5 py-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition mb-1">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {task.dueDate ? (
                        <>
                          <Icon name="calendar" className="text-slate-700 dark:text-slate-300" size="sm" />
                          <span>{t('deadline')}: {formatShortDue(task.dueDate)}</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Icon name="hourglass" className="text-slate-700 dark:text-slate-300" size="sm" />
                          {t('noDeadline')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${statusColor} shadow-sm`}></div>
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              )
              })}
            </div>
          </div>
        ) : allTasks.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
              <Icon name="search" className="text-slate-700 dark:text-slate-300" size="xl" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('noTasksFound')}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {t('tryChangeFilter')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
              <Icon name="note" className="text-slate-700 dark:text-slate-300" size="xl" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('noTasksYet')}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {t('createFirstTask')}
              </p>
            </div>
          </div>
        )}
      </div>
      <AddTaskModal
        isOpen={openAddTaskModal}
        onClose={() => setOpenAddTaskModal(false)}
        familyId={familyId}
        members={members}
        onSuccess={() => {
          setToast({ message: t('createSuccess'), type: 'success' })
        }}
      />
      <InviteMemberModal
        isOpen={openInviteMemberModal}
        onClose={() => setOpenInviteMemberModal(false)}
        familyId={familyId}
        members={members}
        currentUserRole={currentUserMember?.role}
      />
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

export default FamilyTasksPage

import { useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import StatusBadge from '../components/StatusBadge'
import { useLanguage } from '../language/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import Icon from '../components/Icon'

function MemberProgressPage() {
  const { t, language } = useLanguage()
  const { isDark } = useTheme()
  const { familyId } = useParams()
  const [searchParams] = useSearchParams()
  const memberId = searchParams.get('memberId')
  
  const darkCardTextStyle = isDark ? { color: '#FFFFFF !important' } : {}

  const { data: familyData } = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}`)
      return res.data
    },
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', familyId, memberId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/tasks?memberId=${memberId}`)
      return res.data
    },
    enabled: !!memberId,
  })

  const members = familyData?.family?.members || []
  const tasks = tasksData?.tasks || []
  const member = members.find((m) => String(m.user.id) === String(memberId))

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

  const formatDueFull = (dateStr) => {
    if (!dateStr) return t('noDeadline')
    const d = new Date(dateStr)
    return d.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (!memberId || !member) {
    return (
      <AppLayout title={t('memberProgress')} description={t('viewMemberProgress')}>
            <div className="text-center py-12">
          <p className="text-slate-700 dark:text-slate-300">{t('pleaseSelectMember')}</p>
          <Link
            to={`/families/${familyId}/tasks`}
            className="mt-4 inline-block text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t('backToTaskList')}
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={`Tiến độ: ${member.user.name}`}
      description={`Xem chi tiết công việc và tiến độ hoàn thành của ${member.user.name}`}
      actions={
        <Link
          to={`/families/${familyId}/tasks`}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#1F2937] px-4 py-2 text-sm text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition shadow-sm hover:shadow font-medium"
        >
          <Icon name="arrowLeft" className="text-slate-900 dark:text-slate-200" size="sm" />
          <span>Quay lại</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Thông tin thành viên và thống kê */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card thông tin thành viên */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {member.user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{member.user.name}</div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{member.role}</div>
              </div>
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {member.user.email}
            </div>
          </div>

          {/* Card phần trăm hoàn thành */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] px-5 py-4 shadow-sm">
            <div className="text-xs mb-2 font-bold text-slate-800 dark:text-slate-100">Tỷ lệ hoàn thành</div>
            <div className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
              {stats.donePercent}%
            </div>
            {/* Thanh tiến độ */}
            <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden shadow-inner border border-slate-300/70 dark:border-slate-600/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${stats.donePercent}%` }}
              />
            </div>
          </div>

          {/* Card tổng quan */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-800 dark:text-slate-100 mb-3 font-medium">{t('overview')}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-800 dark:text-slate-200">{t('totalTasks')}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-600 dark:text-emerald-400">{t('completed')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.done}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-600 dark:text-amber-400">{t('inProgress')}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{stats['in-progress']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-800 dark:text-slate-200">{t('notStarted')}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.todo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách công việc */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Icon name="list" className="text-slate-900 dark:text-slate-100" size="sm" />
            <span>{t('taskList')} ({tasks.length})</span>
          </h2>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border-4 border-sky-200 border-t-sky-600 dark:border-t-sky-400 animate-spin"></div>
                <p className="text-sm text-slate-500 dark:text-slate-300">{t('loadingTasks')}</p>
              </div>
            </div>
          ) : tasks.length ? (
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
                    className="group flex items-center justify-between gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#1F2937] px-5 py-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${statusColor} shadow-sm`}></div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                          {task.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                        {task.dueDate ? (
                          <>
                            <Icon name="calendar" className="text-slate-700 dark:text-slate-300" size="sm" />
                            <span>{t('deadline')}: {formatDueFull(task.dueDate)}</span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Icon name="hourglass" className="text-slate-700 dark:text-slate-300" size="sm" />
                            {t('noDeadline')}
                          </span>
                        )}
                        <span className="text-slate-500 dark:text-slate-500">•</span>
                        <span>{t('priority')}: {task.priority?.toUpperCase() || 'NORMAL'}</span>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-500 bg-slate-50/50 dark:bg-[#1F2937]">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                <Icon name="check" className="text-slate-700 dark:text-slate-300" size="xl" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('noTasksForMember')}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {t('noTasksForMemberDesc').replace('{name}', member.user.name)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default MemberProgressPage

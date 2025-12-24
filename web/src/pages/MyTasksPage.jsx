import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import Toast from '../components/Toast'
import AddTaskModal from '../components/AddTaskModal'
import Pagination from '../components/Pagination'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import Icon from '../components/Icon'
import TaskImage from '../components/tasks/TaskImage'
import TaskBadge from '../components/tasks/TaskBadge'
import { 
  TIME_FILTERS, 
  DEFAULT_ITEMS_PER_PAGE 
} from '../utils'
import {
  formatDate,
  formatDateTime,
  filterTasksBySearch,
  filterTasksByTime,
  categorizeTasks
} from '../utils'

// ==================== Constants ====================
const MAX_COMPLETED_TASKS_DISPLAY = 5

// Map TIME_FILTERS to format expected by component
const TIME_FILTER_OPTIONS = TIME_FILTERS.map(filter => ({
  value: filter.value,
  labelKey: filter.labelKey
}))

// ==================== Sub-Components ====================

const TodoTaskItem = ({ task, onStatusChange, t }) => {
  const handleCheckboxChange = (e) => {
    e.stopPropagation()
    onStatusChange(task.id)
  }

  return (
    <div className="group relative bg-white dark:bg-[#1E1E1E] rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition">
      <div className="flex items-start gap-4 overflow-visible">
        <input
          type="checkbox"
          checked={false}
          onChange={handleCheckboxChange}
          className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 overflow-visible" style={{ minWidth: 0, overflow: 'visible' }}>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm font-normal text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2 overflow-visible">
            <TaskBadge type="priority" value={task.priority} t={t} />
            <TaskBadge type="status" value={task.status} t={t} />
            {task.createdAt && (
              <span className="text-slate-500 dark:text-slate-300">
                {t('createdDateLabel')} {formatDate(task.createdAt)}
              </span>
            )}
            {task.family?.name && (
              <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-500 text-[11px] font-medium whitespace-nowrap inline-flex items-center gap-1">
                <span>{t('family')}:</span>
                <span className="font-semibold">{task.family.name}</span>
              </span>
            )}
          </div>
          {task.dueDate && (
            <div className="text-xs text-slate-500 dark:text-slate-300">{formatDateTime(task.dueDate)}</div>
          )}
        </div>
        <div className="flex items-start gap-2">
          <TaskImage task={task} size="md" />
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 text-lg"
            aria-label="More options"
          >
            ⋮
          </button>
        </div>
      </div>
      <Link to={`/tasks/${task.id}`} className="absolute inset-0" aria-label={`Xem công việc ${task.title}`} />
    </div>
  )
}

const CompletedTaskItem = ({ task, t }) => (
  <div className="group relative bg-white dark:bg-[#1E1E1E] rounded-lg p-3 border border-slate-200 dark:border-slate-600 hover:shadow-md transition">
    <div className="flex items-start gap-3">
      <input type="checkbox" checked={true} readOnly className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-green-600" />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{task.title}</h3>
        {task.description && (
          <p className="text-xs font-normal text-slate-700 dark:text-slate-300 mb-1 line-clamp-2">{task.description}</p>
        )}
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          {t('statusLabel')} {t('completed')}
        </p>
        {task.family?.name && (
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
            {t('family')}: {task.family.name}
          </p>
        )}
        {task.updatedAt && (
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
            {t('completed')} {formatDate(task.updatedAt)}
          </p>
        )}
      </div>
      <TaskImage task={task} size="sm" />
    </div>
    <Link to={`/tasks/${task.id}`} className="absolute inset-0" aria-label={`Xem công việc ${task.title}`} />
  </div>
)

// ==================== Main Component ====================
function MyTasksPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)

  // ==================== Data Fetching ====================
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
  const defaultFamilyId = families.length === 1 ? families[0]?.id : null
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

  // ==================== Mutations ====================
  const createPersonalFamilyMutation = useMutation({
    mutationFn: async () => {
      const name = `${user?.name ? `Công việc cá nhân của ${user.name}` : 'Công việc cá nhân'} (Personal)`
      const res = await api.post('/families', { name })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myFamilies'] })
      const newFamilyId = data?.family?.id
      if (newFamilyId) {
        setSelectedFamilyId(newFamilyId)
        setOpenAddTaskModal(true)
        setToast({
          message: t('personalFamilyCreated') || 'Đã tạo nhóm công việc cá nhân cho bạn. Bạn có thể thêm công việc ngay bây giờ.',
          type: 'success',
        })
      }
    },
    onError: (err) => {
      if (import.meta.env.DEV) {
        console.error('Error creating personal family:', err)
      }
      setToast({
        message: err.response?.data?.message || t('personalFamilyCreateFailed') || 'Không thể tạo nhóm công việc cá nhân. Vui lòng thử lại.',
        type: 'error',
      })
    },
  })

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

  // ==================== Task Filtering & Categorization ====================
  const { todoTasks, completedTasks } = useMemo(() => {
    if (!Array.isArray(allTasks)) {
      return { todoTasks: [], completedTasks: [] }
    }
    let filtered = filterTasksBySearch(allTasks, searchQuery)
    filtered = filterTasksByTime(filtered, timeFilter)
    const result = categorizeTasks(filtered)
    // Đảm bảo luôn trả về arrays hợp lệ
    return {
      todoTasks: Array.isArray(result?.todo) ? result.todo : [],
      completedTasks: Array.isArray(result?.completed) ? result.completed : []
    }
  }, [allTasks, searchQuery, timeFilter])

  // ==================== Pagination ====================
  const paginationData = useMemo(() => {
    const safeTodoTasks = todoTasks || []
    const totalItems = safeTodoTasks.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedTasks = safeTodoTasks.slice(startIndex, endIndex)

    return { totalItems, totalPages, paginatedTasks }
  }, [todoTasks, currentPage, itemsPerPage])

  const { totalItems: todoTotalItems, totalPages: todoTotalPages, paginatedTasks: paginatedTodoTasks } = paginationData || { totalItems: 0, totalPages: 0, paginatedTasks: [] }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, timeFilter])

  // ==================== Handlers ====================
  const handleAddTask = useCallback(async () => {
    if (families.length === 0) {
      if (createPersonalFamilyMutation.isPending) return
      await createPersonalFamilyMutation.mutateAsync()
      return
    }

    const familyToUse = defaultFamilyId || families[0]?.id
    if (familyToUse) {
      setSelectedFamilyId(familyToUse)
      setOpenAddTaskModal(true)
    }
  }, [families, defaultFamilyId, createPersonalFamilyMutation])

  const handleTaskStatusChange = useCallback(
    (taskId) => {
      statusMutation.mutate({ taskId, status: 'done' })
    },
    [statusMutation]
  )

  const handleItemsPerPageChange = useCallback(
    (value) => {
      setItemsPerPage(value)
      setCurrentPage(1)
    },
    []
  )

  const handleCloseModal = useCallback(() => {
    setOpenAddTaskModal(false)
    setSelectedFamilyId(null)
  }, [])

  const handleTaskCreateSuccess = useCallback(() => {
    setToast({ message: t('createSuccess') || 'Tạo công việc thành công!', type: 'success' })
    queryClient.invalidateQueries({ queryKey: ['myTasks'] })
  }, [t, queryClient])

  // ==================== Render ====================
  const todayDateString = useMemo(
    () =>
      new Date().toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
      }),
    []
  )

  return (
    <AppLayout showSearch={true} searchValue={searchQuery} onSearchChange={setSearchQuery}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('welcomeBack')}, {user?.name || t('user')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - To-Do */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('toDo')}</h2>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {todayDateString} • {t('today')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddTask}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-orange-600 hover:border-orange-600 transition-all"
              >
                <Icon name="plus" className="text-white" size="sm" />
                <span>{t('addTask')}</span>
              </button>
            </div>

            {/* Time Filter */}
            <div className="flex gap-2 mb-4">
              {TIME_FILTER_OPTIONS.map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setTimeFilter(filterOption.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    timeFilter === filterOption.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(filterOption.labelKey)}
                </button>
              ))}
            </div>

            {/* Task List */}
            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
            ) : (todoTasks?.length || 0) > 0 ? (
              <div className="space-y-4">
                {(paginatedTodoTasks || []).map((task) => (
                  <TodoTaskItem key={task.id} task={task} onStatusChange={handleTaskStatusChange} t={t} />
                ))}
                {(todoTasks?.length || 0) > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={todoTotalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={todoTotalItems}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-700 dark:text-slate-300">
                <p>Không có công việc nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Completed Tasks */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✓</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('completedTasks')}</h2>
            </div>
            {(completedTasks?.length || 0) > 0 ? (
              <div className="space-y-3">
                {(completedTasks || []).slice(0, MAX_COMPLETED_TASKS_DISPLAY).map((task) => (
                  <CompletedTaskItem key={task.id} task={task} t={t} />
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {familyIdToQuery && (
        <AddTaskModal
          isOpen={openAddTaskModal}
          onClose={handleCloseModal}
          familyId={familyIdToQuery}
          members={selectedFamilyMembers}
          autoAssignToCurrentUser={true}
          onSuccess={handleTaskCreateSuccess}
        />
      )}
    </AppLayout>
  )
}

export default MyTasksPage

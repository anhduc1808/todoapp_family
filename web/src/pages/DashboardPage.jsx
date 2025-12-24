import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import { CreateFamilyForm, JoinFamilyForm } from '../components/FamilyForms'
import { useLanguage } from '../language/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import Icon from '../components/Icon'
import Toast from '../components/Toast'
import Pagination from '../components/Pagination'

function DashboardPage() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      try {
        const res = await api.get('/families')
        return res.data
      } catch (err) {
        console.error('Error fetching families:', err)
        return { families: [] }
      }
    },
    retry: 1,
  })

  const families = data?.families || []

  // Fetch all tasks for all families
  const { data: allTasksData } = useQuery({
    queryKey: ['allFamilyTasks', families.map(f => f.id).join(',')],
    queryFn: async () => {
      if (families.length === 0) return {}
      const tasksPromises = families.map(async (family) => {
        try {
          const res = await api.get(`/families/${family.id}/tasks`)
          return { familyId: family.id, tasks: res.data.tasks || [] }
        } catch (err) {
          return { familyId: family.id, tasks: [] }
        }
      })
      const results = await Promise.all(tasksPromises)
      const tasksMap = {}
      results.forEach(({ familyId, tasks }) => {
        tasksMap[familyId] = tasks
      })
      return tasksMap
    },
    enabled: families.length > 0,
  })

  const tasksByFamily = allTasksData || {}

  // Get today's tasks for a family (only tasks with dueDate = today)
  const getTodayTasks = (familyId) => {
    const tasks = tasksByFamily[familyId] || []
    if (!tasks || !Array.isArray(tasks)) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return tasks.filter((task) => {
      // Filter by status (todo or in-progress)
      const isActive = task.status === 'todo' || task.status === 'in-progress'
      if (!isActive) return false
      
      // Only include tasks with dueDate
      if (!task.dueDate) return false
      
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      
      // Only include tasks due today (not overdue, not future)
      return dueDate.getTime() === today.getTime()
    })
  }

  // Get today's tasks count for a family
  const getTodayTasksCount = (familyId) => {
    return getTodayTasks(familyId).length
  }

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t('welcomeBack')}, {families.length > 0 ? t('family') : t('user')} 
        </h1>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm border border-orange-400/30 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Icon name="sun" className="text-white" size="lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">{t('familyDay')}</h1>
                <p className="text-xs text-white/90 mt-0.5">
                  {t('todayComma')}{' '}
                  {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowCreateForm(true)
                setShowJoinForm(false)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              <Icon name="plus" className="text-white" size="sm" />
              <span>{t('createNewGroup')}</span>
            </button>
            <button
              onClick={() => {
                setShowJoinForm(true)
                setShowCreateForm(false)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1F2937] border-2 border-white/40 dark:border-white/20 text-orange-600 dark:text-orange-400 text-sm font-semibold hover:bg-white/30 dark:hover:bg-white/10 transition shadow-md"
            >
              <Icon name="link" className="text-orange-600 dark:text-orange-400" size="sm" />
              <span>{t('joinGroup')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách nhóm gia đình */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-500 animate-spin"></div>
              <p className="text-sm text-slate-900 dark:text-slate-300">{t('loadingFamilies')}</p>
            </div>
          </div>
        </div>
      ) : queryError ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border-2 border-red-200 dark:border-red-800 p-12">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 dark:from-red-600 dark:to-red-800 flex items-center justify-center mb-2 shadow-lg">
              <Icon name="alert" className="text-white" size="xl" />
            </div>
            <div>
              <p className="font-bold text-2xl text-slate-800 dark:text-slate-200 mb-3">Lỗi tải dữ liệu</p>
              <p className="text-base text-slate-900 dark:text-slate-300 max-w-md mb-6">
                Không thể tải danh sách nhóm gia đình. Vui lòng thử lại sau.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <Icon name="refresh" className="text-white" size="sm" />
                <span>Tải lại</span>
              </button>
            </div>
          </div>
        </div>
      ) : families.length > 0 ? (
        <>
          {/* Forms tạo/tham gia nhóm */}
          {(showCreateForm || showJoinForm) && (
            <div className="mb-6 p-5 rounded-xl bg-[#1E1E1E] border border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  {showCreateForm ? t('createFamilyForm') : t('joinFamilyForm')}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setShowJoinForm(false)
                  }}
                  className="text-white hover:text-slate-200 text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              {showCreateForm && (
                <CreateFamilyForm
                  onSuccess={() => {
                    setShowCreateForm(false)
                  }}
                />
              )}
              {showJoinForm && (
                <JoinFamilyForm
                  onSuccess={() => {
                    setShowJoinForm(false)
                  }}
                />
              )}
            </div>
          )}

          {/* Pagination for families */}
          {(() => {
            const totalItems = families.length
            const totalPages = Math.ceil(totalItems / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedFamilies = families.slice(startIndex, endIndex)

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  {paginatedFamilies.map((family, index) => {
              const colors = [
                { bg: 'from-orange-400 to-orange-600', hover: 'hover:from-orange-500 hover:to-orange-700' },
                { bg: 'from-orange-500 to-orange-700', hover: 'hover:from-orange-600 hover:to-orange-800' },
                { bg: 'from-orange-300 to-orange-500', hover: 'hover:from-orange-400 hover:to-orange-600' },
                { bg: 'from-orange-600 to-orange-800', hover: 'hover:from-orange-700 hover:to-orange-900' },
                { bg: 'from-orange-400 to-orange-600', hover: 'hover:from-orange-500 hover:to-orange-700' },
              ]
              const color = colors[index % colors.length]
              const todayTasksCount = getTodayTasksCount(family.id)
              
              const todayTasks = getTodayTasks(family.id)
              
              return (
                <div
                  key={family.id}
                  onClick={() => navigate(`/families/${family.id}/tasks`)}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${color.bg} ${color.hover} px-3 pt-3 ${todayTasksCount > 0 ? 'pb-3' : 'pb-2'} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer self-start`}
                >
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md flex-shrink-0">
                          <Icon name="home" className="text-white" size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white mb-0.5 group-hover:scale-105 transition-transform line-clamp-1">
                            {family.name}
                          </h3>
                          <p className="text-xs text-white/80">
                            {todayTasksCount > 0 
                              ? `Hôm nay có ${todayTasksCount} việc cần làm`
                              : 'Nhấp để xem công việc trong gia đình này'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Icon name="arrowRight" className="text-white" size="sm" />
                      </div>
                    </div>
                    
                 
                    {todayTasksCount > 0 && (
                      <div className="mt-2 transition-all duration-300 ease-in-out">
                        <div className="space-y-1">
                          {todayTasks.map((task) => (
                          <Link
                            key={task.id}
                            to={`/tasks/${task.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block px-2.5 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/15 transition cursor-pointer relative z-20"
                          >
                            <div className="flex items-start gap-1.5">
                              <div className="mt-1 w-1 h-1 rounded-full bg-white/80 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white line-clamp-2">
                                  {task.title}
                                </p>
                                {task.assignees && task.assignees.length > 0 && (
                                  <p className="text-[10px] text-white/70 mt-0.5">
                                    {task.assignees.map(a => a.user?.name || '').filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              )
            })}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(value)
                      setCurrentPage(1)
                    }}
                  />
                )}
              </>
            )
          })()}
        </>
      ) : (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border-2 border-orange-200 dark:border-orange-800 p-12">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-800 flex items-center justify-center mb-2 shadow-lg">
              <Icon name="home" className="text-white" size="xl" />
            </div>
            <div>
              <p className="font-bold text-2xl text-slate-800 dark:text-slate-200 mb-3">{t('noFamilies')}</p>
              <p className="text-base text-slate-900 dark:text-slate-300 max-w-md mb-6">
                {t('noFamiliesDesc')}
              </p>
              
              {(showCreateForm || showJoinForm) ? (
                <div className="max-w-md mx-auto p-6 rounded-xl bg-[#1E1E1E] border border-slate-700 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      {showCreateForm ? t('createFamilyForm') : t('joinFamilyForm')}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setShowJoinForm(false)
                      }}
                      className="text-white hover:text-slate-200 text-2xl font-bold leading-none"
                    >
                      ×
                    </button>
                  </div>
                  {showCreateForm && (
                    <CreateFamilyForm
                      onSuccess={() => {
                        setShowCreateForm(false)
                      }}
                    />
                  )}
                  {showJoinForm && (
                    <JoinFamilyForm
                      onSuccess={() => {
                        setShowJoinForm(false)
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowCreateForm(true)
                      setShowJoinForm(false)
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                  >
                    <Icon name="plus" className="text-white" size="sm" />
                    <span>{t('createNewGroup')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinForm(true)
                      setShowCreateForm(false)
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-orange-500 text-orange-600 text-base font-semibold hover:bg-orange-50 transition shadow-sm"
                  >
                    <Icon name="link" className="text-orange-600" size="sm" />
                    <span>{t('joinGroup')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

export default DashboardPage

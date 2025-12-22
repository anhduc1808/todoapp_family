import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import { CreateFamilyForm, JoinFamilyForm } from '../components/FamilyForms'
import { useLanguage } from '../language/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import Icon from '../components/Icon'
import Toast from '../components/Toast'

function DashboardPage() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [toast, setToast] = useState(null)
  
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

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t('welcomeBack')}, {families.length > 0 ? t('family') : t('user')} 
        </h1>
      </div>

      {/* Thanh header kiểu Microsoft To Do */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.map((family, index) => {
              const colors = [
                { bg: 'from-orange-400 to-orange-600', hover: 'hover:from-orange-500 hover:to-orange-700' },
                { bg: 'from-orange-500 to-orange-700', hover: 'hover:from-orange-600 hover:to-orange-800' },
                { bg: 'from-orange-300 to-orange-500', hover: 'hover:from-orange-400 hover:to-orange-600' },
                { bg: 'from-orange-600 to-orange-800', hover: 'hover:from-orange-700 hover:to-orange-900' },
                { bg: 'from-orange-400 to-orange-600', hover: 'hover:from-orange-500 hover:to-orange-700' },
              ]
              const color = colors[index % colors.length]
              return (
                <Link
                  key={family.id}
                  to={`/families/${family.id}/tasks`}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${color.bg} ${color.hover} p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                        <Icon name="home" className="text-white" size="lg" />
                      </div>
                      <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon name="arrowRight" className="text-white" size="sm" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:scale-105 transition-transform">
                      {family.name}
                    </h3>
                    <p className="text-xs text-white/80">
                      {t('clickToViewTasks')}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              )
            })}
          </div>
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
              
              {/* Forms tạo/tham gia nhóm - hiển thị trực tiếp khi không có families */}
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

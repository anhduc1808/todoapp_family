import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import ChangePasswordModal from './ChangePasswordModal'
import CalendarModal from './CalendarModal'
import LanguageSwitcher from './LanguageSwitcher'
import Icon from './Icon'
import socket from '../realtime/socket'

function AppLayout({ children, title, description, actions, showSearch = false, searchValue = '', onSearchChange }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [openBell, setOpenBell] = useState(false)
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = window.localStorage.getItem('sidebar_collapsed')
    return saved === 'true'
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications')
      return res.data
    },
    enabled: !!user,
  })

  const notifications = notifData?.notifications || []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Socket.IO: Lắng nghe thông báo mới
  useEffect(() => {
    if (!user) {
      // Disconnect socket khi user logout
      if (socket.connected) {
        socket.disconnect()
      }
      return
    }

    // Kết nối socket nếu chưa kết nối
    if (!socket.connected) {
      try {
        socket.connect()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Socket connection failed, will retry:', error)
        }
      }
    }

    const handleNewNotification = () => {
      // Refresh notifications khi có thông báo mới
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }

    const handleConnect = () => {
      if (import.meta.env.DEV) {
        console.log('Socket connected')
      }
    }

    const handleDisconnect = () => {
      if (import.meta.env.DEV) {
        console.log('Socket disconnected')
      }
    }

    // Lắng nghe events
    socket.on('notification_new', handleNewNotification)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('notification_new', handleNewNotification)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [user, queryClient])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openBell && !e.target.closest('.notification-dropdown')) {
        setOpenBell(false)
      }
      if (openCalendar && !e.target.closest('.calendar-dropdown')) {
        setOpenCalendar(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openBell, openCalendar])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getTodayDate = () => {
    const now = new Date()
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const dayName = days[now.getDay()]
    return `${dayName} ${now.toLocaleDateString('vi-VN')}`
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#111827] flex transition-colors duration-200" style={{ position: 'relative', zIndex: 0 }}>
   
        <aside
          className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-[#e45a1a] to-[#d74f14] text-white flex flex-col shadow-lg transition-all duration-200`}
          style={{
            backgroundColor: '#e45a1a',
            backgroundImage: 'linear-gradient(to bottom, #e45a1a, #d74f14)',
          }}
        >
       
          <div className="p-4 flex items-center justify-between gap-2">
            {!collapsed ? (
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                <img
                  src="/logo-icon-white.svg"
                  alt="Family TodoApp"
                  className="w-8 h-8"
                />
                <h2 className="text-xl font-bold">{t('home')}</h2>
              </Link>
            ) : (
              <Link to="/" className="mx-auto hover:opacity-80 transition">
                <img
                  src="/logo-icon-white.svg"
                  alt="Family TodoApp"
                  className="w-8 h-8"
                />
              </Link>
            )}
            <button
              onClick={() => {
                setCollapsed((v) => {
                  const next = !v
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('sidebar_collapsed', String(next))
                  }
                  return next
                })
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/30 hover:bg-white/40 shadow-sm transition text-white border border-white/60"
              title="Mở / thu gọn sidebar"
              aria-label="Mở / thu gọn sidebar"
            >
           
              <svg className="w-4 h-4 text-[#e45a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-orange-400/30">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || user?.email || 'Avatar'}
                  className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover border-2 border-white/70 shadow-sm`}
                  onError={(e) => {
                    console.error('Avatar image failed to load:', user.avatarUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-white/20 flex items-center justify-center text-lg font-bold`}>
                  {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{user?.name || user?.email?.split('@')[0] || 'Người dùng'}</div>
                  <div className="text-xs text-orange-100 truncate">{user?.email || ''}</div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { to: '/', label: t('dashboard'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              ), active: isActive('/') && location.pathname !== '/my-tasks' },
              { to: '/my-tasks', label: t('myTasks'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ), active: isActive('/my-tasks') },
              { to: '/task-categories', label: t('taskCategories'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ), active: isActive('/task-categories') },
              { to: '/settings', label: t('settings'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ), active: isActive('/settings') },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  item.active
                    ? 'bg-white text-orange-600 font-medium shadow-md'
                    : 'hover:bg-orange-500/50'
                }`}
              >
                <span className={item.active ? '' : 'text-white/90 group-hover:text-white'}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-orange-400/30">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-500/50 transition-all w-full text-left group"
            >
              <span className="text-white/90 group-hover:text-white">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              {!collapsed && <span>{t('logout')}</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header
            className="bg-gradient-to-r from-[#e45a1a] to-[#d74f14] text-white border-b border-orange-400/30 px-6 py-4"
            style={{
              backgroundColor: '#e45a1a',
              backgroundImage: 'linear-gradient(to right, #e45a1a, #d74f14)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              {showSearch ? (
                <div className="flex-1 max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm công việc của bạn..."
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#25292D] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  {title && (
                    <h1 className="text-xl font-bold text-white">{title}</h1>
                  )}
                </div>
              )}

              {/* Icons */}
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <div className="relative notification-dropdown">
                  <button
                    className="relative w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition hover:scale-105 group"
                    title="Thông báo"
                    onClick={() => setOpenBell((v) => !v)}
                  >
                    <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-[11px] text-white flex items-center justify-center px-1.5 font-bold shadow-md border-2 border-orange-500">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {openBell && (
                    <div className="absolute right-0 top-full mt-2 z-30 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A202C] shadow-lg text-xs">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 font-medium text-slate-900 dark:text-white">
                        Thông báo
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-3 py-3 text-slate-700 dark:text-slate-300">Chưa có thông báo nào.</div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                markReadMutation.mutate(n.id)
                                // Navigate to task detail page if task exists
                                if (n.taskId) {
                                  navigate(`/tasks/${n.taskId}`)
                                  setOpenBell(false)
                                }
                              }}
                              className={`w-full text-left px-3 py-2 border-b border-slate-100 dark:border-slate-800 transition ${
                                !n.isRead
                                  ? 'bg-orange-50 dark:bg-orange-900/40 border-l-4 border-orange-400'
                                  : 'bg-white dark:bg-slate-800'
                              } hover:bg-slate-50 dark:hover:bg-slate-700`}
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {n.type === 'assigned' && t('notificationAssigned')}
                                  {n.type === 'overdue' && t('notificationOverdue')}
                                  {n.type === 'comment' && t('notificationComment')}
                                  {n.type === 'reaction' && t('notificationReaction')}
                                </span>
                                {!n.isRead && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-100 border border-orange-200 dark:border-orange-700">
                                    Mới
                                  </span>
                                )}
                              </div>
                              {n.task && (
                                <div className="text-slate-900 dark:text-white font-medium">{n.task.title}</div>
                              )}
                              <div className="text-[10px] text-slate-900 dark:text-slate-100 mt-0.5 font-semibold">
                                {new Date(n.createdAt).toLocaleString('vi-VN')}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative calendar-dropdown">
                  <button
                    onClick={() => setOpenCalendar((v) => !v)}
                    className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition hover:scale-105 cursor-pointer group"
                    title="Lịch"
                  >
                    <Icon name="calendar" className="transition-colors" style={{ color: 'rgba(255, 255, 255, 0.9)' }} size="md" onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 1)'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'} />
                  </button>
                </div>
                <div className="text-sm font-medium text-white" style={{ color: '#ffffff' }}>
                  {getTodayDate()}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleTheme()
                  }}
                  className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition hover:scale-105 cursor-pointer focus:outline-none relative z-10 group"
                  title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                >
                  <Icon name={isDark ? 'sun' : 'moon'} className="text-white/90 group-hover:text-white transition-colors" size="md" />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#F9FAFB] dark:bg-[#111827] transition-colors" style={{ position: 'relative', zIndex: 1, minHeight: 0, backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#F9FAFB' }}>
            {title && !showSearch && (
              <div className="mb-6" style={{ position: 'relative', zIndex: 2 }}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h1>
                {description && (
                  <p className="text-slate-900 dark:text-slate-400">{description}</p>
                )}
                {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
              </div>
            )}
            <div style={{ color: '#0f172a', position: 'relative', zIndex: 2 }}>
              {children}
            </div>
          </main>
        </div>
      </div>
      <ChangePasswordModal isOpen={openChangePassword} onClose={() => setOpenChangePassword(false)} />
      <CalendarModal isOpen={openCalendar} onClose={() => setOpenCalendar(false)} />
    </>
  )
}

export default AppLayout

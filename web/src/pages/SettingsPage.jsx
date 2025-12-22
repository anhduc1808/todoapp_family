import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import Toast from '../components/Toast'
import ChangePasswordModal from '../components/ChangePasswordModal'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'

function SettingsPage() {
  const { user, refreshUser, updateUser } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState(null)
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    contactNumber: '',
    position: '',
  })

  // Cập nhật formData khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        contactNumber: '',
        position: '',
      })
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch('/auth/me', data)
      return res.data
    },
    onSuccess: async (data) => {
      setToast({ message: t('updateSuccess'), type: 'success' })
      // Cập nhật user trực tiếp từ response nếu có
      if (data?.user && updateUser) {
        updateUser(data.user)
      } else if (refreshUser) {
        // Nếu không có user trong response, gọi refreshUser
        await refreshUser()
      }
      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t('updateFailed')
      setToast({ message: errorMessage, type: 'error' })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      contactNumber: formData.contactNumber,
      position: formData.position,
    })
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('accountInfo')}</h1>
        <Link
          to="/"
          className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400"
        >
          {t('goBack')}
        </Link>
      </div>

      <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-500 p-6">
        {/* Profile Summary */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-200 dark:border-slate-500">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
            {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email || ''}</p>
          </div>
        </div>

        {/* Account Details Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('firstName')}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('lastName')}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('emailAddress')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('phoneNumber')}
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('position')}
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {updateMutation.isPending ? t('updating') : t('updateInfo')}
            </button>
            <button
              type="button"
              onClick={() => setOpenChangePassword(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
            >
              {t('changePassword')}
            </button>
          </div>
        </form>
      </div>

      <ChangePasswordModal
        isOpen={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
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

export default SettingsPage

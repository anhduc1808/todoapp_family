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
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
  const [avatarBase64, setAvatarBase64] = useState('')

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
      setAvatarPreview(user.avatarUrl || '')
    }
  }, [user])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast({ message: t('invalidImage') || 'Vui lòng chọn file hình ảnh', type: 'error' })
      return
    }
    try {
      const maxSize = 512
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          const base64 = canvas.toDataURL('image/jpeg', 0.8)
          setAvatarPreview(base64)
          setAvatarBase64(base64)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error processing avatar:', err)
      setToast({ message: t('invalidImage') || 'Không thể xử lý ảnh đại diện', type: 'error' })
    }
  }

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch('/auth/me', data)
      return res.data
    },
    onSuccess: async (data) => {
      setToast({ message: t('updateSuccess'), type: 'success' })
      if (data?.user && updateUser) {
        updateUser(data.user)
        if (data.user.avatarUrl) {
          setAvatarPreview(data.user.avatarUrl)
        }
        setAvatarBase64('')
      } else if (refreshUser) {
        const refreshed = await refreshUser()
        if (refreshed?.avatarUrl) setAvatarPreview(refreshed.avatarUrl)
      }
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || t('updateFailed')
      setToast({ message: errorMessage, type: 'error' })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      contactNumber: formData.contactNumber,
      position: formData.position,
    }
    if (avatarBase64 && avatarBase64.trim() !== '') {
      payload.avatarBase64 = avatarBase64
    }
    updateMutation.mutate(payload)
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
          <label className="relative cursor-pointer">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user?.name || user?.email || 'Avatar'}
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-400 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center border-2 border-white shadow">
              ✏️
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
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

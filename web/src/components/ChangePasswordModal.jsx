import { useState } from 'react'
import api from '../api/client'
import { useLanguage } from '../language/LanguageContext'

function ChangePasswordModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch') || 'Mật khẩu mới không khớp')
      return
    }

    if (newPassword.length < 6) {
      setError(t('passwordMinLength') || 'Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      await api.patch('/auth/change-password', {
        oldPassword,
        newPassword,
      })
      alert(t('changePasswordSuccess') || 'Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('changePasswordFailed') || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{t('changePassword')}</h2>
        {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-900 dark:text-slate-300 mb-1">{t('currentPassword') || 'Mật khẩu hiện tại'}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-900 dark:text-slate-300 mb-1">{t('newPassword') || 'Mật khẩu mới'}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{t('confirmPassword')}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? t('updating') : t('changePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordModal

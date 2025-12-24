import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../language/LanguageContext'
import Toast from '../components/Toast'
import Icon from '../components/Icon'

function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    document.documentElement.style.colorScheme = 'light'
    document.body.style.backgroundColor = '#fff7ed'
    document.body.style.color = '#0f172a'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setToast(null)

    if (!email || !email.includes('@')) {
      setToast({
        type: 'error',
        message: t('pleaseEnterEmail') || 'Vui lòng nhập email hợp lệ',
      })
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setToast({
        type: 'success',
        message:
          t('resetLinkSent') ||
          'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi (demo).',
      })
    } catch (err) {
      setToast({
        type: 'error',
        message:
          t('resetLinkFailed') ||
          'Không thể gửi link đặt lại mật khẩu. Vui lòng thử lại.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#fff7ed' }}
    >
      <div className="w-full max-w-md">
        <h2 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          {t('forgotPassword') || 'Forgot Password'}
        </h2>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {t('forgotPassword') || 'Forgot Password'}
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            {t('forgotPasswordDesc') ||
              "Enter your registered email address and we'll send you a link to reset your password."}
          </p>

          {toast && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm border ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              {toast.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Icon
                name="mail"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size="sm"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterEmail') || 'Enter Email Address'}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400 text-slate-900 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? t('processing') || 'Processing...'
                : t('sendResetLink') || 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-slate-900">
            {t('rememberPassword') || 'Remember your password?'}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-orange-600 hover:underline font-medium"
            >
              {t('backToSignIn') || 'Back to Sign In'}
            </button>
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-3">
              {t('orContactSupport') || 'Or, contact support'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <span className="text-xl">🎧</span>
              </button>
              <button
                type="button"
                className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <span className="text-xl">💬</span>
              </button>
            </div>
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
    </div>
  )
}

export default ForgotPasswordPage


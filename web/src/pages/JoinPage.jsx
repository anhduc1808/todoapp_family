import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../language/LanguageContext'
import Icon from '../components/Icon'
import Toast from '../components/Toast'

function JoinPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const queryClient = useQueryClient()
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  const joinMutation = useMutation({
    mutationFn: async (inviteCode) => {
      const res = await api.post('/families/join', { code: inviteCode })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      setToast({ message: t('joinGroupSuccess') || 'Đã tham gia gia đình thành công!', type: 'success' })
      setTimeout(() => {
        if (data?.family?.id) {
          navigate(`/families/${data.family.id}/tasks`)
        } else {
          navigate('/')
        }
      }, 1500)
    },
    onError: (err) => {
      console.error('Join family error:', err)
      if (err.response?.status === 404) {
        setToast({ message: 'Mã mời không hợp lệ hoặc đã hết hạn.', type: 'error' })
      } else {
        setToast({ message: err.response?.data?.message || t('joinGroupFailed') || 'Không thể tham gia gia đình', type: 'error' })
      }
      setLoading(false)
    },
  })

  useEffect(() => {
    if (!user) {
      // Nếu chưa đăng nhập, lưu code và redirect về login
      if (code) {
        localStorage.setItem('pendingJoinCode', code)
        localStorage.setItem('redirectAfterLogin', '/join?code=' + code)
      }
      navigate('/login')
      return
    }

    // Nếu đã đăng nhập và có code, tự động join
    if (code) {
      setLoading(true)
      joinMutation.mutate(code)
    } else {
      // Kiểm tra xem có pending code từ localStorage không (sau khi login)
      const pendingCode = localStorage.getItem('pendingJoinCode')
      if (pendingCode) {
        localStorage.removeItem('pendingJoinCode')
        setLoading(true)
        joinMutation.mutate(pendingCode)
      } else {
        setToast({ message: t('invalidInviteLinkDesc') || 'Không tìm thấy mã mời trong link.', type: 'error' })
      }
    }
  }, [code, user])

  if (!user) {
    return null // Đang redirect về login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl p-8 text-center">
          {loading ? (
            <>
              <div className="h-16 w-16 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-500 animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t('joining') || 'Đang tham gia...'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                {t('pleaseWait') || 'Vui lòng đợi...'}
              </p>
            </>
          ) : code ? (
            <>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <Icon name="check" className="text-white" size="xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t('joinGroup') || 'Tham gia nhóm'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Mã mời: <span className="font-mono font-bold text-slate-900 dark:text-white">{code}</span>
              </p>
              <button
                onClick={() => {
                  setLoading(true)
                  joinMutation.mutate(code)
                }}
                disabled={loading || joinMutation.isPending}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all disabled:opacity-60"
              >
                {joinMutation.isPending ? (t('joining') || 'Đang tham gia...') : (t('joinGroup') || 'Tham gia')}
              </button>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Icon name="alert" className="text-white" size="xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t('invalidInviteLink') || 'Link mời không hợp lệ'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {t('invalidInviteLinkDesc') || 'Link mời không chứa mã mời hợp lệ.'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
              >
                {t('goBack') || 'Quay lại'}
              </button>
            </>
          )}
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

export default JoinPage

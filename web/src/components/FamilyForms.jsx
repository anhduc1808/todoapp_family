import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import { useLanguage } from '../language/LanguageContext'

export function CreateFamilyForm({ onSuccess }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true)
      setError('')
      const res = await api.post('/families', { name })
      return res.data
    },
    onSuccess: () => {
      setName('')
      queryClient.invalidateQueries({ queryKey: ['families'] })
      if (onSuccess) onSuccess()
    },
    onError: (err) => {
      setError(err.response?.data?.message || t('createGroupFailed'))
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim() || loading) return
        mutation.mutate()
      }}
      className="space-y-2"
    >
      <label className="block text-sm font-bold text-white mb-2">
        {t('familyGroupName')}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder={t('familyGroupNameExample')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg hover:from-sky-700 hover:to-blue-700 transition-all disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t('creating') : t('createGroup')}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </form>
  )
}

export function JoinFamilyForm({ onSuccess }) {
  const { t } = useLanguage()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true)
      setError('')
      console.log('Joining family with code:', code)
      const res = await api.post('/families/join', { code: code.trim().toUpperCase() })
      return res.data
    },
    onSuccess: () => {
      setCode('')
      queryClient.invalidateQueries({ queryKey: ['families'] })
      if (onSuccess) onSuccess()
    },
    onError: (err) => {
      console.error('Join family error:', err)
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        url: err.config?.url,
        method: err.config?.method
      })
      if (err.response?.status === 404) {
        // Kiểm tra xem có phải là "Invalid code" không
        const errorMessage = err.response?.data?.message || ''
        if (errorMessage === 'Invalid code' || errorMessage.includes('Invalid code')) {
          setError(t('invalidInviteCode') || 'Mã mời không hợp lệ. Vui lòng kiểm tra lại mã mời.')
        } else {
          setError(t('routeNotFound') || 'Route not found. Backend may not be deployed with latest code.')
        }
      } else if (err.response?.status === 401) {
        setError(t('unauthorized') || 'Please login first')
      } else {
        setError(err.response?.data?.message || t('joinGroupFailed') || 'Failed to join family')
      }
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!code.trim() || loading) return
        mutation.mutate()
      }}
      className="space-y-2"
    >
      <label className="block text-sm font-bold text-white mb-2">
        {t('joinByCode') || 'Tham gia bằng mã code'}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 rounded-xl border-2 border-slate-200 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-2.5 text-sm uppercase tracking-[0.18em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder={t('inviteCodePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t('joining') : t('joinGroup')}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </form>
  )
}

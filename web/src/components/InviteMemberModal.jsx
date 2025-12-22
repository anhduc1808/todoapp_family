import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import Toast from './Toast'
import { useLanguage } from '../language/LanguageContext'
import { useTheme } from '../theme/ThemeContext'

function InviteMemberModal({ isOpen, onClose, familyId, members, currentUserRole }) {
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [toast, setToast] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const { data: familyData } = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}`)
      return res.data
    },
    enabled: isOpen && !!familyId,
  })

  useEffect(() => {
    if (familyData?.family?.inviteCode) {
      setInviteCode(familyData.family.inviteCode)
    }
  }, [familyData])

  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/families/${familyId}/invite`)
      return res.data
    },
    onSuccess: (data) => {
      setInviteCode(data.inviteCode)
      queryClient.invalidateQueries({ queryKey: ['family', familyId] })
      setToast({ message: t('inviteCodeCreated'), type: 'success' })
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || t('inviteCodeFailed') || 'Không tạo được mã mời', type: 'error' })
    },
  })

  const sendInviteMutation = useMutation({
    mutationFn: async () => {
      if (!inviteCode && !familyData?.family?.inviteCode) {
        throw new Error('Invite code is required')
      }
      const code = inviteCode || familyData?.family?.inviteCode
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
      const link = `${frontendUrl}/join?code=${code}`
      
      try {
        const res = await api.post(`/families/${familyId}/invite/send`, {
          email: email.trim(),
          inviteCode: code,
          inviteLink: link
        })
        return res.data
      } catch (err) {
        if (err.response?.status === 404) {
          await navigator.clipboard.writeText(link)
          return { success: true, copied: true, link }
        }
        throw err
      }
    },
    onSuccess: (data) => {
      if (data?.copied) {
        setToast({ 
          message: t('linkCopiedMessage') || 'Đã copy link mời! Gửi link này cho người bạn muốn mời.', 
          type: 'success' 
        })
      } else {
        setToast({ message: t('inviteEmailSent') || 'Đã gửi email mời thành công!', type: 'success' })
      }
      setEmail('')
    },
    onError: (err) => {
      console.error('Send invite error:', err)
      const code = inviteCode || familyData?.family?.inviteCode
      if (code) {
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
        const link = `${frontendUrl}/join?code=${code}`
        navigator.clipboard.writeText(link).then(() => {
          setToast({ 
            message: t('linkCopiedMessage') || 'Đã copy link mời! Gửi link này cho người bạn muốn mời.', 
            type: 'success' 
          })
          setEmail('')
        }).catch(() => {
          setToast({ message: err.response?.data?.message || t('inviteFailed') || 'Không thể gửi email mời', type: 'error' })
        })
      } else {
        setToast({ message: err.response?.data?.message || t('inviteFailed') || 'Không thể gửi email mời', type: 'error' })
      }
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }) => {
      const res = await api.patch(`/families/${familyId}/members/${memberId}/role`, { role })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId] })
      setToast({ message: 'Đã cập nhật quyền thành công!', type: 'success' })
    },
    onError: (err) => {
      setToast({ message: err.response?.data?.message || t('roleUpdateFailed'), type: 'error' })
    },
  })

  const handleSendInvite = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setToast({ message: t('pleaseEnterEmail'), type: 'error' })
      return
    }

    let code = inviteCode || familyData?.family?.inviteCode
    if (!code) {
      try {
        const result = await generateInviteMutation.mutateAsync()
        code = result.inviteCode || inviteCode
      } catch (err) {
        setToast({ message: t('inviteCodeFailed') || 'Không thể tạo mã mời', type: 'error' })
        return
      }
    }

    sendInviteMutation.mutate()
  }

  const handleCopyLink = async () => {
    if (!inviteCode) {
      // Tạo invite code trước
      await generateInviteMutation.mutateAsync()
    }

    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
    const link = `${frontendUrl}/join?code=${inviteCode || familyData?.family?.inviteCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setToast({ message: t('linkCopied'), type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setToast({ message: t('cannotCopyLink'), type: 'error' })
    }
  }

  const handleCopyCode = async () => {
    if (!inviteCode) {
      await generateInviteMutation.mutateAsync()
    }

    const code = inviteCode || familyData?.family?.inviteCode
    if (code) {
      try {
        await navigator.clipboard.writeText(code)
        setCopiedCode(true)
        setToast({ message: t('inviteCodeCopied') || 'Đã copy mã mời!', type: 'success' })
        setTimeout(() => setCopiedCode(false), 2000)
      } catch (err) {
        setToast({ message: t('cannotCopyCode') || 'Không thể copy mã mời', type: 'error' })
      }
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      owner: t('owner'),
      admin: t('admin'),
      member: t('member'),
    }
    return labels[role] || t('member')
  }

  const canChangeRole = (memberRole) => {
    if (currentUserRole === 'owner') return true
    if (currentUserRole === 'admin' && memberRole !== 'owner') return true
    return false
  }

  if (!isOpen) return null

  // Tự động dùng window.location.origin (domain thực tế khi deploy)
  // - Development: http://localhost:5173
  // - Production: https://your-app.vercel.app (tự động từ Vercel)
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
  const projectLink = inviteCode || familyData?.family?.inviteCode
    ? `${frontendUrl}/join?code=${inviteCode || familyData?.family?.inviteCode}`
    : ''

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('sendInvite')}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 text-lg font-medium"
            >
              {t('goBack')}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Invite by Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('inviteByEmail')}
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="neerajgurung99@gmail.com"
                />
                <button
                  onClick={handleSendInvite}
                  disabled={sendInviteMutation.isPending || generateInviteMutation.isPending}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {sendInviteMutation.isPending ? t('updating') : t('sendInviteBtn')}
                </button>
              </div>
            </div>

            {/* Members List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {t('members')}
              </h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-[#25292D] dark:bg-[#25292D]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                        {member.user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm dark-card-text">
                          {member.user.name}
                        </p>
                        <p className="text-xs dark-card-text">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    {canChangeRole(member.role) ? (
                      <select
                        value={member.role}
                        onChange={(e) => {
                          updateRoleMutation.mutate({
                            memberId: member.id,
                            role: e.target.value,
                          })
                        }}
                        className="px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-[#1F2937] dark:bg-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark-card-text"
                      >
                        {member.role === 'owner' ? (
                          <option value="owner">{t('owner')}</option>
                        ) : (
                          <>
                            <option value="admin">{t('admin')}</option>
                            <option value="member">{t('member')}</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <span className="px-3 py-2 text-sm text-slate-900 dark:text-white" style={isDark ? { color: '#FFFFFF' } : {}}>
                        {getRoleLabel(member.role)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Code */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('inviteCode')}
              </h3>
              {inviteCode || familyData?.family?.inviteCode ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inviteCode || familyData?.family?.inviteCode || ''}
                    readOnly
                    className="flex-1 rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-[#25292D] dark:bg-[#25292D] px-4 py-3 text-sm font-mono font-bold uppercase tracking-wider dark-card-text"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    {copiedCode ? (t('copied') || 'Đã copy') : (t('copy') || 'Copy')}
                  </button>
                  <button
                    onClick={() => generateInviteMutation.mutate()}
                    disabled={generateInviteMutation.isPending}
                    className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    {generateInviteMutation.isPending ? t('creating') : t('createInviteCode')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => generateInviteMutation.mutate()}
                    disabled={generateInviteMutation.isPending}
                    className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    {generateInviteMutation.isPending ? t('creating') : t('createInviteCode')}
                  </button>
                </div>
              )}
            </div>

            {/* Project Link */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('projectLink')}
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={projectLink}
                  readOnly
                  className="flex-1 rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-[#25292D] dark:bg-[#25292D] px-4 py-3 text-sm dark-card-text"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
                >
                  {copied ? t('linkCopied') : t('copyLink')}
                </button>
              </div>
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
    </>
  )
}

export default InviteMemberModal

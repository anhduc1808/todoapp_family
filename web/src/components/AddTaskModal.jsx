import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import Toast from './Toast'
import { useLanguage } from '../language/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import Icon from './Icon'

function AddTaskModal({ isOpen, onClose, familyId, members, onSuccess, autoAssignToCurrentUser = false }) {
  const { t } = useLanguage()
  // Hàm resize và compress ảnh
  const resizeImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Resize nếu ảnh quá lớn
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert sang base64 với quality
          const base64 = canvas.toDataURL('image/jpeg', quality)
          resolve(base64)
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('extreme')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedAssignees, setSelectedAssignees] = useState([])
  const [toast, setToast] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // Tự động assign cho user hiện tại nếu là personal task
  useEffect(() => {
    if (isOpen && autoAssignToCurrentUser && user?.id) {
      setSelectedAssignees([user.id])
    } else if (isOpen && !autoAssignToCurrentUser) {
      setSelectedAssignees([])
    }
  }, [isOpen, autoAssignToCurrentUser, user?.id])

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/families/${familyId}/tasks`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', String(familyId)] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
      setToast({ message: 'Tạo công việc thành công!', type: 'success' })
      setTimeout(() => {
        handleClose()
        onSuccess?.()
      }, 1000)
    },
    onError: (err) => {
      console.error('Error creating task:', err)
      const errorMessage = err.response?.data?.message || err.message || t('createFailed')
      setToast({ message: errorMessage, type: 'error' })
    },
  })

  const handleClose = () => {
    setTitle('')
    setDate('')
    setPriority('extreme')
    setDescription('')
    setImage(null)
    setImagePreview(null)
    setSelectedAssignees([])
    setToast(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setToast({ message: t('pleaseEnterTitle'), type: 'error' })
      return
    }

    let imageUrlToSend = null
    if (image) {
      try {
        // Resize và compress ảnh trước khi convert sang base64
        imageUrlToSend = await resizeImage(image, 800, 0.8) // max width 800px, quality 80%
      } catch (err) {
        console.error('Error processing image:', err)
        setToast({ message: t('imageProcessingError'), type: 'error' })
        return
      }
    }

    createMutation.mutate({
      title,
      description: description || null,
      priority: priority === 'extreme' ? 'high' : priority,
      dueDate: date || null,
      imageUrl: imageUrlToSend,
      assigneeIds: selectedAssignees,
    })
  }

  const handleImageChange = (file) => {
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }


  const toggleAssignee = (userId) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file && file.type && file.type.startsWith('image/')) {
        handleImageChange(file)
      } else {
        setToast({ message: 'Vui lòng chọn file ảnh (JPG, PNG, GIF, etc.)', type: 'error' })
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Thêm công việc mới
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 text-lg font-medium"
            >
              Quay lại
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('taskTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t('taskTitle')}
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('dueDate')}
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon name="calendar" className="text-slate-700 dark:text-slate-300" size="md" />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Độ ưu tiên
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'extreme', label: 'Cao', color: 'bg-red-500' },
                  { value: 'moderate', label: 'Trung bình', color: 'bg-blue-500' },
                  { value: 'low', label: 'Thấp', color: 'bg-green-500' },
                ].map((p) => (
                  <label
                    key={p.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      checked={priority === p.value}
                      onChange={(e) => setPriority(e.target.value)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full ${p.color} ${
                        priority === p.value ? 'ring-2 ring-offset-2 ring-orange-500' : ''
                      }`}
                    />
                    <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('taskDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px] resize-y"
                placeholder="Bắt đầu viết ở đây....."
              />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t('uploadImage')}
              </label>
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mx-auto border-2 border-slate-200 dark:border-slate-500"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null)
                        setImagePreview(null)
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition min-h-[120px] flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-300 dark:border-slate-500 hover:border-orange-400 dark:hover:border-orange-500'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    Duyệt
                  </button>
                  <p className="text-xs text-slate-900 dark:text-slate-300 mt-3">
                    Hoặc kéo thả ảnh vào đây
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageChange(file)
                }}
                className="hidden"
              />
            </div>

            {/* Assignees - Ẩn nếu là personal task */}
            {!autoAssignToCurrentUser && members && members.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  {t('assignTo')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <label
                      key={m.user.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium cursor-pointer transition-all ${
                        selectedAssignees.includes(m.user.id)
                          ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                          : 'bg-white dark:bg-[#25292D] border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(m.user.id)}
                        onChange={() => toggleAssignee(m.user.id)}
                        className="hidden"
                      />
                      <span>{m.user.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error message */}
            {toast && toast.type === 'error' && (
              <div className="text-sm text-red-600 dark:text-red-400">{toast.message}</div>
            )}

            {/* Done Button */}
            <div className="flex justify-start pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
              >
                {createMutation.isPending ? t('creating') : t('done')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && toast.type === 'success' && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export default AddTaskModal

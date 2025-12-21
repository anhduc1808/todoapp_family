import { useState, useEffect } from 'react'
import { useLanguage } from '../language/LanguageContext'

function EditTaskStatusModal({ isOpen, onClose, statusName, onUpdate, onCancel, type = 'status' }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen && statusName) {
      setName(statusName)
    }
  }, [isOpen, statusName])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onUpdate(name.trim())
    }
  }

  const handleCancel = () => {
    setName('')
    onCancel()
  }

  const title = type === 'priority' ? t('taskPriority') : t('taskStatus')
  const labelName = type === 'priority' ? t('taskPriorityName') : t('taskStatusName')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-2xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-slate-200 dark:border-slate-500">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={handleCancel}
            className="text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 text-lg font-medium"
          >
            {t('goBack')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {labelName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-[#25292D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={labelName}
              autoFocus
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
            >
              {t('update')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskStatusModal

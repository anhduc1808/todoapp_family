import { useEffect } from 'react'
import Icon from './Icon'

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const bgColors = {
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600',
    info: 'bg-gradient-to-r from-sky-500 to-blue-600',
  }

  const iconNames = {
    success: 'check',
    error: 'x',
    info: 'info',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColors[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        <Icon name={iconNames[type]} className="text-white" size="md" />
        <span className="flex-1 font-medium text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast

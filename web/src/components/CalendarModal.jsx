import { useState } from 'react'
import { useLanguage } from '../language/LanguageContext'
import Icon from './Icon'

function CalendarModal({ isOpen, onClose }) {
  const { t, language } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  if (!isOpen) return null

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const monthNames = language === 'vi' 
    ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = language === 'vi'
    ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    if (!date) return false
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-4 top-20 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Icon name="calendar" className="text-orange-500" size="md" />
            <h3 className="text-lg font-bold text-slate-900">
              {t('calendar') || 'Lịch'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Icon name="x" className="text-slate-700 dark:text-slate-300" size="sm" />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Icon name="arrowLeft" className="text-slate-600" size="sm" />
            </button>
            <div className="text-center">
              <div className="font-semibold text-slate-900">
                {monthNames[month]} {year}
              </div>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Icon name="arrowRight" className="text-slate-900 dark:text-slate-300" size="sm" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!date}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition
                  ${!date ? 'cursor-default' : 'cursor-pointer hover:bg-slate-100'}
                  ${isToday(date) ? 'bg-orange-500 text-white font-bold' : ''}
                  ${isSelected(date) && !isToday(date) ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold' : ''}
                  ${!isToday(date) && !isSelected(date) ? 'text-slate-700' : ''}
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            className="w-full mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition text-sm"
          >
            {t('today') || 'Hôm nay'}
          </button>

          {/* Selected Date Info */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              {t('selectedDate') || 'Ngày đã chọn'}
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {selectedDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CalendarModal

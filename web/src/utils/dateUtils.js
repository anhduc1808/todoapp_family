import { DATE_LOCALE, DATE_FORMAT_OPTIONS, DATETIME_FORMAT_OPTIONS } from './constants'

/**
 * Format date to Vietnamese locale string
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(DATE_LOCALE, DATE_FORMAT_OPTIONS)
  } catch {
    return ''
  }
}

/**
 * Format date and time to Vietnamese locale string
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Formatted datetime string or empty string if invalid
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleString(DATE_LOCALE, DATETIME_FORMAT_OPTIONS)
  } catch {
    return ''
  }
}

/**
 * Format short date (day/month)
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Formatted short date string
 */
export const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(DATE_LOCALE, {
      day: '2-digit',
      month: '2-digit',
    })
  } catch {
    return ''
  }
}

/**
 * Format short due date with time (hh:mm dd/mm)
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string|null} Formatted short due date string or null
 */
export const formatShortDue = (dateStr) => {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleString(DATE_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  } catch {
    return null
  }
}

/**
 * Get today's date at midnight
 * @returns {Date} Today's date with time set to 00:00:00
 */
export const getTodayDate = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

/**
 * Get start of current week (Monday)
 * @returns {Date} Start of week date
 */
export const getStartOfWeek = () => {
  const now = getTodayDate()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek
}

/**
 * Get end of current week (Sunday)
 * @returns {Date} End of week date
 */
export const getEndOfWeek = () => {
  const startOfWeek = getStartOfWeek()
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

/**
 * Get start of current month
 * @returns {Date} Start of month date
 */
export const getStartOfMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Get end of current month
 * @returns {Date} End of month date
 */
export const getEndOfMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Check if task due date is within specified time range
 * @param {Object} task - Task object with dueDate property
 * @param {string} timeFilter - Time filter: 'today', 'week', 'month', or 'all'
 * @returns {boolean} True if task is in range
 */
export const isTaskInTimeRange = (task, timeFilter) => {
  if (timeFilter === 'all' || !task.dueDate) return true

  try {
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    switch (timeFilter) {
      case 'today': {
        const today = getTodayDate()
        return dueDate.getTime() === today.getTime()
      }
      case 'week': {
        const startOfWeek = getStartOfWeek()
        const endOfWeek = getEndOfWeek()
        return dueDate >= startOfWeek && dueDate <= endOfWeek
      }
      case 'month': {
        const startOfMonth = getStartOfMonth()
        const endOfMonth = getEndOfMonth()
        return dueDate >= startOfMonth && dueDate <= endOfMonth
      }
      default:
        return true
    }
  } catch {
    return false
  }
}

/**
 * Filter tasks by time range
 * @param {Array} tasks - Array of task objects
 * @param {string} timeFilter - Time filter value
 * @returns {Array} Filtered tasks
 */
export const filterTasksByTime = (tasks, timeFilter) => {
  if (!Array.isArray(tasks)) return []
  if (timeFilter === 'all') return tasks
  return tasks.filter((task) => isTaskInTimeRange(task, timeFilter))
}

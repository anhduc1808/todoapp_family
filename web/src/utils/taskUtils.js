import { PLACEHOLDER_IMAGES, TASK_PRIORITY, TASK_STATUS } from './constants'

/**
 * Normalize status string to lowercase
 * @param {string} status - Status string
 * @returns {string} Normalized status
 */
export const normalizeStatus = (status) => (status?.toLowerCase() || '').trim()

/**
 * Normalize priority string to lowercase
 * @param {string} priority - Priority string
 * @returns {string} Normalized priority
 */
export const normalizePriority = (priority) => (priority?.toLowerCase() || '').trim()

/**
 * Get priority styles (background, text color, label)
 * @param {string} priority - Priority value
 * @returns {Object} Style object with bg, text, and label
 */
export const getPriorityStyles = (priority) => {
  const normalized = normalizePriority(priority)
  
  if (normalized === TASK_PRIORITY.HIGH || normalized === TASK_PRIORITY.EXTREME) {
    return {
      bg: 'bg-red-100',
      text: '#991b1b',
      label: 'high',
    }
  }
  
  if (normalized === TASK_PRIORITY.LOW) {
    return {
      bg: 'bg-green-100',
      text: '#166534',
      label: 'low',
    }
  }
  
  return {
    bg: 'bg-blue-100',
    text: '#1e40af',
    label: 'moderate',
  }
}

/**
 * Get status styles (background, text color, label)
 * @param {string} status - Status value
 * @returns {Object} Style object with bg, text, and label
 */
export const getStatusStyles = (status) => {
  const normalized = normalizeStatus(status)
  
  if (normalized === TASK_STATUS.DONE || normalized === TASK_STATUS.COMPLETED) {
    return {
      bg: 'bg-green-100',
      text: '#166534',
      label: 'completed',
    }
  }
  
  if (normalized === TASK_STATUS.IN_PROGRESS || normalized === TASK_STATUS.DOING) {
    return {
      bg: 'bg-blue-100',
      text: '#1e40af',
      label: 'inProgress',
    }
  }
  
  return {
    bg: 'bg-red-100',
    text: '#991b1b',
    label: 'notStarted',
  }
}

/**
 * Get task image URL (prioritize real image, fallback to placeholder)
 * @param {Object} task - Task object with imageUrl and id
 * @returns {string} Image URL
 */
export const getTaskImage = (task) => {
  if (task?.imageUrl) return task.imageUrl
  const taskId = task?.id || 0
  return PLACEHOLDER_IMAGES[taskId % PLACEHOLDER_IMAGES.length] || PLACEHOLDER_IMAGES[0]
}

/**
 * Filter tasks by search query
 * @param {Array} tasks - Array of task objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered tasks
 */
export const filterTasksBySearch = (tasks, searchQuery) => {
  if (!Array.isArray(tasks)) return []
  if (!searchQuery?.trim()) return tasks

  const query = searchQuery.toLowerCase().trim()
  return tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.family?.name?.toLowerCase().includes(query)
  )
}

/**
 * Categorize tasks into todo and completed
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Object with todo and completed arrays
 */
export const categorizeTasks = (tasks) => {
  if (!Array.isArray(tasks)) {
    return { todo: [], completed: [] }
  }
  const todo = tasks.filter((task) => normalizeStatus(task.status) !== TASK_STATUS.DONE)
  const completed = tasks.filter((task) => normalizeStatus(task.status) === TASK_STATUS.DONE)
  return { todo, completed }
}

/**
 * Check if task is completed
 * @param {Object} task - Task object
 * @returns {boolean} True if task is completed
 */
export const isTaskCompleted = (task) => {
  const status = normalizeStatus(task?.status)
  return status === TASK_STATUS.DONE || status === TASK_STATUS.COMPLETED
}

/**
 * Check if task is in progress
 * @param {Object} task - Task object
 * @returns {boolean} True if task is in progress
 */
export const isTaskInProgress = (task) => {
  const status = normalizeStatus(task?.status)
  return status === TASK_STATUS.IN_PROGRESS || status === TASK_STATUS.DOING
}

// ==================== Time Filter Constants ====================
export const TIME_FILTERS = [
  { value: 'today', labelKey: 'today' },
  { value: 'week', labelKey: 'thisWeek' },
  { value: 'month', labelKey: 'thisMonth' },
  { value: 'all', labelKey: 'all' },
]

// ==================== Task Status Constants ====================
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DOING: 'doing',
  DONE: 'done',
  COMPLETED: 'completed',
}

// ==================== Task Priority Constants ====================
export const TASK_PRIORITY = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  EXTREME: 'extreme',
}

// ==================== Placeholder Images ====================
export const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
]

// ==================== Pagination Constants ====================
export const DEFAULT_ITEMS_PER_PAGE = 5
export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50]

// ==================== Date Format Constants ====================
export const DATE_LOCALE = 'vi-VN'
export const DATE_FORMAT_OPTIONS = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}
export const DATETIME_FORMAT_OPTIONS = {
  ...DATE_FORMAT_OPTIONS,
  hour: '2-digit',
  minute: '2-digit',
}

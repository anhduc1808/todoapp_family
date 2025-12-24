/**
 * Application Constants
 * Centralized constants to avoid magic strings/numbers
 */

// Task Status
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DOING: 'doing',
  DONE: 'done',
  COMPLETED: 'completed',
}

// Task Priority
const TASK_PRIORITY = {
  LOW: 'low',
  MODERATE: 'moderate',
  NORMAL: 'normal',
  HIGH: 'high',
  EXTREME: 'extreme',
}

// Member Role
const MEMBER_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
}

// Member Status
const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

// Notification Types
const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  COMMENT_ADDED: 'comment_added',
  FAMILY_INVITE: 'family_invite',
}

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  MEMBER_ROLE,
  MEMBER_STATUS,
  NOTIFICATION_TYPE,
  HTTP_STATUS,
  PAGINATION,
}


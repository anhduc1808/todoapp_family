import { getPriorityStyles, getStatusStyles } from '../../utils/taskUtils'

/**
 * TaskBadge component - Displays priority or status badge
 * @param {Object} props
 * @param {string} props.type - Badge type: 'priority' | 'status'
 * @param {string} props.value - Priority or status value
 * @param {Function} props.t - Translation function
 * @param {string} props.className - Additional CSS classes
 */
function TaskBadge({ type, value, t, className = '' }) {
  const styles = type === 'priority' ? getPriorityStyles(value) : getStatusStyles(value)
  const labelKey = type === 'priority' ? 'priorityLabel' : 'statusLabel'

  return (
    <span
      className={`px-2.5 py-1 rounded ${styles.bg} font-medium whitespace-nowrap inline-block flex-shrink-0 ${className}`}
      style={{ color: styles.text, fontWeight: '600' }}
    >
      {t(labelKey)} {t(styles.label)}
    </span>
  )
}

export default TaskBadge

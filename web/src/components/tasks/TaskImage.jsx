import { getTaskImage } from '../../utils/taskUtils'

/**
 * TaskImage component - Displays task image with fallback
 * @param {Object} props
 * @param {Object} props.task - Task object
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 */
function TaskImage({ task, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  }

  const handleImageError = (e) => {
    e.target.style.display = 'none'
    const fallback = e.target.nextElementSibling
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-slate-100 dark:bg-[#25292D] flex-shrink-0 ${className}`}>
      <img
        src={getTaskImage(task)}
        alt={task?.title || 'Task image'}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
      <div className={`w-full h-full hidden items-center justify-center ${sizeClasses[size].split(' ')[1]}`}>
        {task?.title?.[0]?.toUpperCase() || '?'}
      </div>
    </div>
  )
}

export default TaskImage

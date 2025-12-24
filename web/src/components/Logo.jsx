import { useTheme } from '../theme/ThemeContext'

function Logo({ size = 'md', showText = false, className = '' }) {
  const { isDark } = useTheme()
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }
  
  const logoSize = sizeClasses[size] || sizeClasses.md
  const textSize = textSizeClasses[size] || textSizeClasses.md
  
  if (showText) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/logo-icon-light.svg"
          alt="Family TodoApp"
          className={logoSize}
        />
        <div className="flex flex-col">
          <span className={`${textSize} font-bold text-orange-600 dark:text-orange-400`}>
            Family
          </span>
          <span className={`${textSize === 'text-xs' ? 'text-[10px]' : 'text-xs'} text-slate-600 dark:text-slate-400`}>
            TodoApp
          </span>
        </div>
      </div>
    )
  }
  
  return (
    <img
      src={isDark ? '/logo-dark.svg' : '/logo.svg'}
      alt="Family TodoApp"
      className={`${logoSize} ${className}`}
    />
  )
}

export default Logo


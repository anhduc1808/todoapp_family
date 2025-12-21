import { useLanguage } from '../language/LanguageContext'

const STATUS_STYLES = {
  todo: 'bg-slate-100 border-slate-200',
  'in-progress': 'bg-amber-50 border-amber-200',
  done: 'bg-emerald-50 border-emerald-200',
}

const STATUS_TEXT_COLORS = {
  todo: '#475569', // slate-700
  'in-progress': '#b45309', // amber-800
  done: '#166534', // green-800
}

function StatusBadge({ status }) {
  const { t } = useLanguage()
  const key = status?.toLowerCase()
  const style = STATUS_STYLES[key] || STATUS_STYLES.todo
  const textColor = STATUS_TEXT_COLORS[key] || STATUS_TEXT_COLORS.todo

  const formatLabel = (status) => {
    if (!status) return ''
    const s = status.toLowerCase()
    if (s === 'todo') return t('notStarted')
    if (s === 'in-progress' || s === 'doing') return t('inProgress')
    if (s === 'done') return t('completed')
    return status
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
      style={{ color: textColor, fontWeight: '600' }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatLabel(status)}
    </span>
  )
}

export default StatusBadge

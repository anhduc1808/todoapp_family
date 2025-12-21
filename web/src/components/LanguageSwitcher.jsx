import { useLanguage } from '../language/LanguageContext'

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('vi')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
          language === 'vi'
            ? 'bg-orange-500 text-white'
            : 'bg-slate-100 text-slate-900 dark:text-slate-300 hover:bg-slate-200'
        }`}
      >
        🇻🇳 VI
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
          language === 'en'
            ? 'bg-orange-500 text-white'
            : 'bg-slate-100 text-slate-900 dark:text-slate-300 hover:bg-slate-200'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  )
}

export default LanguageSwitcher

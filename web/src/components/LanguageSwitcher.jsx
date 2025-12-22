import { useLanguage } from '../language/LanguageContext'

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('vi')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
          language === 'vi'
            ? 'bg-white text-orange-600 dark:bg-orange-500 dark:text-white'
            : 'bg-white/20 text-white hover:bg-white/30 dark:bg-white/20 dark:text-white'
        }`}
      >
        🇻🇳 VI
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
          language === 'en'
            ? 'bg-white text-orange-600 dark:bg-orange-500 dark:text-white'
            : 'bg-white/20 text-white hover:bg-white/30 dark:bg-white/20 dark:text-white'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  )
}

export default LanguageSwitcher

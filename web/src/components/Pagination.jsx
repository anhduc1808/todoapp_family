import { useLanguage } from '../language/LanguageContext'

function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) {
  const { t } = useLanguage()
  
  // Không return null nữa, luôn hiển thị số trang

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 3 // Giới hạn chỉ hiển thị tối đa 3 số trang
    
    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= 3, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Luôn hiển thị trang đầu và trang cuối
      pages.push(1)
      
      if (currentPage <= 2) {
        // Nếu đang ở trang 1-2, hiển thị: 1, 2, 3, ..., totalPages
        for (let i = 2; i <= 3; i++) {
          pages.push(i)
        }
        if (totalPages > 3) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 1) {
        // Nếu đang ở trang cuối, hiển thị: 1, ..., totalPages-2, totalPages-1, totalPages
        if (totalPages > 3) {
          pages.push('...')
        }
        for (let i = totalPages - 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Ở giữa: hiển thị: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {t('itemsPerPage') || 'Hiển thị:'}
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}

      {/* Page navigation */}
      {totalPages > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="text-slate-400 dark:text-slate-500 text-sm">
                    ...
                  </span>
                )
              }
              const isActive = currentPage === page
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2 text-sm font-medium transition ${
                    isActive
                      ? 'text-orange-600 dark:text-orange-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Page info badge and showing info - grouped together */}
      <div className="flex items-center gap-3">
        {totalPages > 0 && (
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
            Trang <span className="text-orange-600 dark:text-orange-400">{currentPage}</span> / <span className="text-slate-900 dark:text-slate-100">{totalPages}</span>
          </div>
        )}
        
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {totalItems > 0 ? (
            <>
              {t('showing') || 'Hiển thị'} <span className="font-semibold text-slate-900 dark:text-slate-100">{startItem}</span> - <span className="font-semibold text-slate-900 dark:text-slate-100">{endItem}</span> {t('of') || 'của'} <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</span>
            </>
          ) : (
            <span>{t('noItems') || 'Không có mục nào'}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pagination




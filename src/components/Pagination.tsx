type PaginationProps = {
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (nextPage: number) => void
  windowSize?: number
}

const buildPages = (
  page: number,
  totalPages: number,
  windowSize: number,
) => {
  const pages: Array<number | 'ellipsis'> = []

  if (totalPages <= 1) {
    return pages
  }

  const start = Math.max(2, page - windowSize)
  const end = Math.min(totalPages - 1, page + windowSize)

  pages.push(1)

  if (start > 2) {
    pages.push('ellipsis')
  }

  for (let current = start; current <= end; current += 1) {
    pages.push(current)
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis')
  }

  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

const Pagination = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
  windowSize = 2,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) {
    if (totalItems <= 0) {
      return null
    }
    return (
      <div className="pagination-container pagination-container--single">
        <span className="pagination-total text-muted">Total: {totalItems}</span>
      </div>
    )
  }

  const pages = buildPages(page, totalPages, windowSize)
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <div className="pagination-container">
      <span className="pagination-total text-muted">Total: {totalItems}</span>
      <nav className="pagination-nav" aria-label="Paginacao">
        <ul className="pagination mb-0">
          <li className={`page-item ${canGoPrevious ? '' : 'disabled'}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page - 1)}
              disabled={!canGoPrevious}
            >
              &lt;
            </button>
          </li>
          {pages.map((item, index) =>
            item === 'ellipsis' ? (
              <li
                key={`ellipsis-${index}`}
                className="page-item disabled"
                aria-hidden="true"
              >
                <span className="page-link">...</span>
              </li>
            ) : (
              <li
                key={item}
                className={`page-item ${item === page ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                >
                  {item}
                </button>
              </li>
            ),
          )}
          <li className={`page-item ${canGoNext ? '' : 'disabled'}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={!canGoNext}
            >
              &gt;
            </button>
          </li>
        </ul>
      </nav>
      <span className="pagination-spacer" aria-hidden="true" />
    </div>
  )
}

export default Pagination

type PaginationFooterProps = {
  total: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

const PaginationFooter = ({
  total,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: PaginationFooterProps) => (
  <div className="pagination-footer">
    <span className="text-muted">Total: {total}</span>
    <div className="btn-group">
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        Anterior
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onNext}
        disabled={!hasNext}
      >
        Proxima
      </button>
    </div>
  </div>
)

export default PaginationFooter

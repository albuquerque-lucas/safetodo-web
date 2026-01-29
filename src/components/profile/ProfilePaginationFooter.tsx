type ProfilePaginationFooterProps = {
  total: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

const ProfilePaginationFooter = ({
  total,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: ProfilePaginationFooterProps) => (
  <div className="profile-logs-footer">
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

export default ProfilePaginationFooter

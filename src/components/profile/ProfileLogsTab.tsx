import type { AuditLog } from '../../types/api'
import AuditLogsTable from './AuditLogsTable'
import ProfilePaginationFooter from './ProfilePaginationFooter'

type ProfileLogsTabProps = {
  logs: AuditLog[]
  isLoading: boolean
  isError: boolean
  errorStatus?: number
  canClearLogs: boolean
  isClearing: boolean
  isClearDisabled: boolean
  onClear: () => void
  canDeleteLogs: boolean
  isDeleting: boolean
  onDeleteLog: (id: number) => void
  total: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  showMutationError: boolean
}

const ProfileLogsTab = ({
  logs,
  isLoading,
  isError,
  errorStatus,
  canClearLogs,
  isClearing,
  isClearDisabled,
  onClear,
  canDeleteLogs,
  isDeleting,
  onDeleteLog,
  total,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  showMutationError,
}: ProfileLogsTabProps) => (
  <div className="profile-logs" style={{ minHeight: 420 }}>
    <div className="profile-logs-header">
      <div>
        <h2 className="h5 mb-1">Logs de auditoria</h2>
        <p className="text-muted mb-0">Registros de acoes deste usuario.</p>
      </div>
      {canClearLogs ? (
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={onClear}
          disabled={isClearing || isClearDisabled}
        >
          {isClearing ? 'Limpando...' : 'Deletar tudo'}
        </button>
      ) : null}
    </div>

    {isLoading ? (
      <div className="text-muted">Carregando logs...</div>
    ) : isError ? (
      <div className="text-danger">
        {errorStatus === 403
          ? 'Permissao insuficiente para ver os logs.'
          : 'Erro ao carregar logs.'}
      </div>
    ) : (
      <>
        <AuditLogsTable
          logs={logs}
          canDeleteItems={canDeleteLogs}
          isDeleting={isDeleting}
          onDeleteLog={onDeleteLog}
        />
        <ProfilePaginationFooter
          total={total}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious}
          onNext={onNext}
        />
        {showMutationError ? (
          <div className="text-danger mt-3">
            Permissao insuficiente ou erro ao remover logs.
          </div>
        ) : null}
      </>
    )}
  </div>
)

export default ProfileLogsTab

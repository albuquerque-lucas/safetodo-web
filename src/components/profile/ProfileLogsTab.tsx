import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { AuditLog } from '../../types/api'
import Pagination from '../Pagination'
import AuditLogsTable from './AuditLogsTable'

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
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
  total: number
  onPageChange: (nextPage: number) => void
  showMutationError: boolean
  searchInput: string
  onSearchChange: (value: string) => void
  isSearching: boolean
  isSearchActive: boolean
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
  page,
  pageSize,
  sortBy,
  sortDir,
  onSort,
  total,
  onPageChange,
  showMutationError,
  searchInput,
  onSearchChange,
  isSearching,
  isSearchActive,
}: ProfileLogsTabProps) => (
  <div className="profile-logs" style={{ minHeight: 420 }}>
    <div className="profile-logs-header">
      <div>
        <h2 className="h5 mb-1">Logs de auditoria</h2>
        <p className="text-muted mb-0">Registros de acoes deste usuario.</p>
      </div>
      <div className="list-toolbar-actions d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
        <div className="list-toolbar-search input-group">
          <span className="input-group-text text-muted">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por acao, entidade, usuario"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Buscar logs"
          />
        </div>
        <div className="d-flex align-items-center gap-2">
          {isSearching && searchInput.trim() ? (
            <span className="text-muted small">Buscando...</span>
          ) : null}
          {canClearLogs ? (
            <button
              type="button"
              className="btn btn-outline-danger text-nowrap flex-shrink-0"
              onClick={onClear}
              disabled={isClearing || isClearDisabled}
            >
              {isClearing ? 'Limpando...' : 'Deletar tudo'}
            </button>
          ) : null}
        </div>
      </div>
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
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          emptyMessage={
            isSearchActive
              ? 'Nenhum log encontrado para a busca.'
              : 'Nenhum log encontrado.'
          }
        />
        <Pagination
          page={page}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
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

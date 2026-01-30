import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import type { AuditLog } from '../../types/api'
import { compactMetadata, formatDate } from '../../utils/profileUtils'

type AuditLogsTableProps = {
  logs: AuditLog[]
  canDeleteItems: boolean
  isDeleting: boolean
  onDeleteLog: (id: number) => void
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
  emptyMessage?: string
}

const AuditLogsTable = ({
  logs,
  canDeleteItems,
  isDeleting,
  onDeleteLog,
  sortBy,
  sortDir,
  onSort,
  emptyMessage = 'Nenhum log encontrado.',
}: AuditLogsTableProps) => (
  <DataTable
    columns={[
      {
        header: 'Data/Hora',
        sortKey: 'timestamp',
        render: (log: AuditLog) => formatDate(log.timestamp),
      },
      { header: 'Acao', sortKey: 'action', render: (log: AuditLog) => log.action },
      { header: 'Entidade', sortKey: 'entity_type', render: (log: AuditLog) => log.entity_type },
      { header: 'ID', sortKey: 'entity_id', render: (log: AuditLog) => log.entity_id || '-' },
      {
        header: 'Resumo',
        render: (log: AuditLog) => compactMetadata(log.metadata),
      },
      ...(canDeleteItems
        ? [
            {
              header: 'Opcoes',
              headerClassName: 'text-end',
              className: 'text-end',
              render: (log: AuditLog) => (
                <RowActionsMenu
                  items={[
                    {
                      label: 'Deletar',
                      onClick: () => onDeleteLog(log.id),
                      className: 'dropdown-item text-danger',
                      disabled: isDeleting,
                    },
                  ]}
                />
              ),
            },
          ]
        : []),
    ]}
    data={logs}
    emptyMessage={emptyMessage}
    rowKey={(log: AuditLog) => log.id}
    sortBy={sortBy}
    sortDir={sortDir}
    onSort={onSort}
  />
)

export default AuditLogsTable

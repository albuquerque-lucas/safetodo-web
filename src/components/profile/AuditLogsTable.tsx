import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import type { AuditLog } from '../../types/api'
import { compactMetadata, formatDate } from '../../utils/profileUtils'

type AuditLogsTableProps = {
  logs: AuditLog[]
  canDeleteItems: boolean
  isDeleting: boolean
  onDeleteLog: (id: number) => void
}

const AuditLogsTable = ({
  logs,
  canDeleteItems,
  isDeleting,
  onDeleteLog,
}: AuditLogsTableProps) => (
  <DataTable
    columns={[
      {
        header: 'Data/Hora',
        render: (log: AuditLog) => formatDate(log.timestamp),
      },
      { header: 'Acao', render: (log: AuditLog) => log.action },
      { header: 'Entidade', render: (log: AuditLog) => log.entity_type },
      { header: 'ID', render: (log: AuditLog) => log.entity_id || '-' },
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
    emptyMessage="Nenhum log encontrado."
    rowKey={(log: AuditLog) => log.id}
  />
)

export default AuditLogsTable

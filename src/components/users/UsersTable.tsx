import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import type { User } from '../../types/api'

type UsersTableProps = {
  users: User[]
  isLoading: boolean
  isError: boolean
  isDeleting: boolean
  onView: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
  emptyMessage?: string
}

const UsersTable = ({
  users,
  isLoading,
  isError,
  isDeleting,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortDir,
  onSort,
  emptyMessage = 'Nenhum usuario encontrado.',
}: UsersTableProps) => {
  if (isLoading) {
    return <div className="text-muted">Carregando usuarios...</div>
  }

  if (isError) {
    return <div className="text-danger">Erro ao carregar usuarios.</div>
  }

  return (
    <DataTable
      columns={[
        { header: 'ID', sortKey: 'id', render: (user) => user.id },
        { header: 'Username', sortKey: 'username', render: (user) => user.username },
        { header: 'Email', sortKey: 'email', render: (user) => user.email },
        {
          header: 'Nome',
          sortKey: 'first_name',
          render: (user) =>
            [user.first_name, user.last_name].filter(Boolean).join(' ') || '-',
        },
        { header: 'Telefone', sortKey: 'phone', render: (user) => user.phone || '-' },
        {
          header: 'Opcoes',
          headerClassName: 'text-end',
          className: 'text-end',
          render: (user) => (
            <RowActionsMenu
              items={[
                {
                  label: 'Visualizar',
                  onClick: () => onView(user.id),
                },
                {
                  label: 'Editar',
                  onClick: () => onEdit(user.id),
                },
                {
                  label: 'Deletar',
                  onClick: () => onDelete(user.id),
                  className: 'dropdown-item text-danger',
                  disabled: isDeleting,
                },
              ]}
            />
          ),
        },
      ]}
      data={users}
      emptyMessage={emptyMessage}
      rowKey={(user) => user.id}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
    />
  )
}

export default UsersTable

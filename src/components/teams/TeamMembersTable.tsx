import DataTable from '../DataTable'
import type { User } from '../../types/api'

type TeamMembersTableProps = {
  members: User[]
  isLoading: boolean
  isError: boolean
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
  emptyMessage?: string
}

const TeamMembersTable = ({
  members,
  isLoading,
  isError,
  sortBy,
  sortDir,
  onSort,
  emptyMessage = 'Nenhum membro encontrado.',
}: TeamMembersTableProps) => {
  if (isLoading) {
    return <div className="text-muted">Carregando membros...</div>
  }

  if (isError) {
    return <div className="text-danger">Erro ao carregar membros.</div>
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
      ]}
      data={members}
      emptyMessage={emptyMessage}
      rowKey={(user) => user.id}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
    />
  )
}

export default TeamMembersTable

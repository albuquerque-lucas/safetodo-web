import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import type { Team } from '../../types/api'

type TeamsTableProps = {
  teams: Team[]
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

const TeamsTable = ({
  teams,
  isLoading,
  isError,
  isDeleting,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortDir,
  onSort,
  emptyMessage = 'Nenhuma equipe encontrada.',
}: TeamsTableProps) => {
  if (isLoading) {
    return <div className="text-muted">Carregando equipes...</div>
  }

  if (isError) {
    return <div className="text-danger">Erro ao carregar equipes.</div>
  }

  return (
    <DataTable
      columns={[
        { header: 'ID', sortKey: 'id', render: (team) => team.id },
        { header: 'Nome', sortKey: 'name', render: (team) => team.name },
        {
          header: 'Membros',
          render: (team) => team.members_display?.length ?? team.members.length ?? 0,
        },
        {
          header: 'Managers',
          render: (team) => team.managers_display?.length ?? team.managers.length ?? 0,
        },
        {
          header: 'Opcoes',
          headerClassName: 'text-end',
          className: 'text-end',
          render: (team) => (
            <RowActionsMenu
              items={[
                {
                  label: 'Visualizar',
                  onClick: () => onView(team.id),
                },
                {
                  label: 'Editar',
                  onClick: () => onEdit(team.id),
                },
                {
                  label: 'Deletar',
                  onClick: () => onDelete(team.id),
                  className: 'dropdown-item text-danger',
                  disabled: isDeleting,
                },
              ]}
            />
          ),
        },
      ]}
      data={teams}
      emptyMessage={emptyMessage}
      rowKey={(team) => team.id}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
    />
  )
}

export default TeamsTable

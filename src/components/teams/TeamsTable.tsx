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
}

const TeamsTable = ({
  teams,
  isLoading,
  isError,
  isDeleting,
  onView,
  onEdit,
  onDelete,
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
        { header: 'ID', render: (team) => team.id },
        { header: 'Nome', render: (team) => team.name },
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
      emptyMessage="Nenhuma equipe encontrada."
      rowKey={(team) => team.id}
    />
  )
}

export default TeamsTable

import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import TaskStatusBadge from '../TaskStatusBadge'
import type { Task } from '../../types/api'
import { formatDate } from '../../utils/taskUtils'

type TasksTableProps = {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  isDeleting: boolean
  onView: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

const TasksTable = ({
  tasks,
  isLoading,
  isError,
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: TasksTableProps) => {
  if (isLoading) {
    return <div className="text-muted">Carregando tarefas...</div>
  }

  if (isError) {
    return <div className="text-danger">Erro ao carregar tarefas.</div>
  }

  return (
    <DataTable
      columns={[
        { header: 'ID', render: (task) => task.id },
        { header: 'Titulo', render: (task) => task.title },
        {
          header: 'Status',
          render: (task) => (
            <TaskStatusBadge status={task.status} dueDate={task.due_date} />
          ),
        },
        { header: 'Usuario', render: (task) => task.user_display },
        {
          header: 'Equipe',
          render: (task) => task.team_display ?? '-',
        },
        {
          header: 'Prioridade',
          render: (task) => task.priority_level_display ?? '-',
        },
        { header: 'Vencimento', render: (task) => formatDate(task.due_date) },
        {
          header: 'Opcoes',
          headerClassName: 'text-end',
          className: 'text-end',
          render: (task) => (
            <RowActionsMenu
              items={[
                {
                  label: 'Visualizar',
                  onClick: () => onView(task.id),
                },
                {
                  label: 'Editar',
                  onClick: () => onEdit(task.id),
                },
                {
                  label: 'Deletar',
                  onClick: () => onDelete(task.id),
                  className: 'dropdown-item text-danger',
                  disabled: isDeleting,
                },
              ]}
            />
          ),
        },
      ]}
      data={tasks}
      emptyMessage="Nenhuma tarefa encontrada."
      rowKey={(task) => task.id}
    />
  )
}

export default TasksTable

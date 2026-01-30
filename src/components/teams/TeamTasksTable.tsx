import DataTable from '../DataTable'
import TaskStatusBadge from '../TaskStatusBadge'
import type { Task } from '../../types/api'
import { formatDate } from '../../utils/taskUtils'

type TeamTasksTableProps = {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
  emptyMessage?: string
}

const TeamTasksTable = ({
  tasks,
  isLoading,
  isError,
  sortBy,
  sortDir,
  onSort,
  emptyMessage = 'Nenhuma tarefa encontrada.',
}: TeamTasksTableProps) => {
  if (isLoading) {
    return <div className="text-muted">Carregando tarefas...</div>
  }

  if (isError) {
    return <div className="text-danger">Erro ao carregar tarefas.</div>
  }

  return (
    <DataTable
      columns={[
        { header: 'ID', sortKey: 'id', render: (task) => task.id },
        { header: 'Titulo', sortKey: 'title', render: (task) => task.title },
        {
          header: 'Status',
          sortKey: 'status',
          render: (task) => (
            <TaskStatusBadge status={task.status} dueDate={task.due_date} />
          ),
        },
        {
          header: 'Usuario',
          sortKey: 'user__username',
          render: (task) => task.user_display,
        },
        {
          header: 'Prioridade',
          sortKey: 'priority_level__level',
          render: (task) => task.priority_level_display ?? '-',
        },
        {
          header: 'Vencimento',
          sortKey: 'due_date',
          render: (task) => formatDate(task.due_date),
        },
      ]}
      data={tasks}
      emptyMessage={emptyMessage}
      rowKey={(task) => task.id}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
    />
  )
}

export default TeamTasksTable

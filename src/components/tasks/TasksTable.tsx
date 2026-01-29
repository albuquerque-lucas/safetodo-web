import { useState } from 'react'
import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import TaskStatusBadge from '../TaskStatusBadge'
import type { Task } from '../../types/api'
import type { TaskStatus } from '../../types/api'
import { formatDate, statusOptions } from '../../utils/taskUtils'

type TasksTableProps = {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  isDeleting: boolean
  isUpdatingStatus: boolean
  onView: (id: number) => void
  onDelete: (id: number) => void
  onStatusUpdate: (id: number, status: TaskStatus) => Promise<void>
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
}

const TasksTable = ({
  tasks,
  isLoading,
  isError,
  isDeleting,
  isUpdatingStatus,
  onView,
  onDelete,
  onStatusUpdate,
  sortBy,
  sortDir,
  onSort,
}: TasksTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingStatus, setEditingStatus] = useState<TaskStatus>('created')
  const [errorId, setErrorId] = useState<number | null>(null)

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditingStatus(task.status)
    setErrorId(null)
  }

  const handleStatusChange = async (task: Task, nextStatus: TaskStatus) => {
    setEditingStatus(nextStatus)
    try {
      await onStatusUpdate(task.id, nextStatus)
      setEditingId(null)
      setErrorId(null)
    } catch {
      setEditingStatus(task.status)
      setErrorId(task.id)
    }
  }

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
          render: (task) => {
            const isEditing = editingId === task.id
            const isSaving = isUpdatingStatus && isEditing
            return (
              <div>
                {isEditing ? (
                  <select
                    className="form-select form-select-sm w-auto"
                    value={editingStatus}
                    onChange={(event) =>
                      handleStatusChange(task, event.target.value as TaskStatus)
                    }
                    disabled={isSaving}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    className="task-status-button"
                    onClick={() => startEdit(task)}
                  >
                    <TaskStatusBadge status={task.status} dueDate={task.due_date} />
                  </button>
                )}
                {errorId === task.id ? (
                  <div className="text-danger small mt-1">
                    Erro ao atualizar status.
                  </div>
                ) : null}
              </div>
            )
          },
        },
        { header: 'Usuario', sortKey: 'user__username', render: (task) => task.user_display },
        {
          header: 'Equipe',
          sortKey: 'team__name',
          render: (task) => task.team_display ?? '-',
        },
        {
          header: 'Prioridade',
          sortKey: 'priority_level__level',
          render: (task) => task.priority_level_display ?? '-',
        },
        { header: 'Vencimento', sortKey: 'due_date', render: (task) => formatDate(task.due_date) },
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
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
    />
  )
}

export default TasksTable

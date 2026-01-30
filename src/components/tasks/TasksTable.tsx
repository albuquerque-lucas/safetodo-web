import { useEffect, useState } from 'react'
import DataTable from '../DataTable'
import RowActionsMenu from '../RowActionsMenu'
import TaskStatusBadge from '../TaskStatusBadge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { PriorityLevel, Task } from '../../types/api'
import type { TaskStatus } from '../../types/api'
import { formatDate, statusOptions, toIsoOrNull } from '../../utils/taskUtils'

type TasksTableProps = {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  isDeleting: boolean
  isUpdatingInline: boolean
  onView: (id: number) => void
  onDelete: (id: number) => void
  onFieldUpdate: (
    id: number,
    payload: {
      status?: TaskStatus
      priority_level?: number | null
      due_date?: string | null
    },
  ) => Promise<void>
  priorityLevels: PriorityLevel[]
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
}

const TasksTable = ({
  tasks,
  isLoading,
  isError,
  isDeleting,
  isUpdatingInline,
  onView,
  onDelete,
  onFieldUpdate,
  priorityLevels,
  sortBy,
  sortDir,
  onSort,
}: TasksTableProps) => {
  const [editingCell, setEditingCell] = useState<{
    taskId: number
    field: 'status' | 'priority_level' | 'due_date'
    original: string
    draft: string
  } | null>(null)
  const [savingCell, setSavingCell] = useState<{
    taskId: number
    field: 'status' | 'priority_level' | 'due_date'
  } | null>(null)
  const [errorCell, setErrorCell] = useState<{
    taskId: number
    field: 'status' | 'priority_level' | 'due_date'
  } | null>(null)

  const getFieldValue = (
    task: Task,
    field: 'status' | 'priority_level' | 'due_date',
  ) => {
    if (field === 'status') {
      return task.status
    }
    if (field === 'priority_level') {
      return task.priority_level ? String(task.priority_level) : ''
    }
    return task.due_date ? task.due_date.slice(0, 16) : ''
  }

  const startEdit = (
    task: Task,
    field: 'status' | 'priority_level' | 'due_date',
  ) => {
    const value = getFieldValue(task, field)
    setEditingCell({
      taskId: task.id,
      field,
      original: value,
      draft: value,
    })
    setErrorCell(null)
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setSavingCell(null)
    setErrorCell(null)
  }

  const handleSelectChange = async (
    task: Task,
    field: 'status' | 'priority_level',
    nextValue: string,
  ) => {
    if (!editingCell) {
      return
    }
    setEditingCell((current) =>
      current ? { ...current, draft: nextValue } : current,
    )
    if (nextValue === editingCell.original) {
      cancelEdit()
      return
    }
    setSavingCell({ taskId: task.id, field })
    try {
      if (field === 'status') {
        await onFieldUpdate(task.id, { status: nextValue as TaskStatus })
      } else {
        await onFieldUpdate(task.id, {
          priority_level: nextValue ? Number(nextValue) : null,
        })
      }
      cancelEdit()
    } catch {
      setEditingCell((current) =>
        current ? { ...current, draft: current.original } : current,
      )
      setSavingCell(null)
      setErrorCell({ taskId: task.id, field })
    }
  }

  const handleDueDateSave = async (task: Task) => {
    if (!editingCell || editingCell.field !== 'due_date') {
      return
    }
    if (editingCell.draft === editingCell.original) {
      cancelEdit()
      return
    }
    setSavingCell({ taskId: task.id, field: 'due_date' })
    try {
      await onFieldUpdate(task.id, {
        due_date: toIsoOrNull(editingCell.draft),
      })
      cancelEdit()
    } catch {
      setSavingCell(null)
      setErrorCell({ taskId: task.id, field: 'due_date' })
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    task: Task,
  ) => {
    if (event.key === 'Enter' && editingCell?.field === 'due_date') {
      event.preventDefault()
      handleDueDateSave(task)
    }
  }

  useEffect(() => {
    if (!editingCell) {
      return undefined
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancelEdit()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [editingCell])

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
            const isEditing =
              editingCell?.taskId === task.id && editingCell.field === 'status'
            const isSaving =
              isUpdatingInline &&
              savingCell?.taskId === task.id &&
              savingCell.field === 'status'
            return (
              <div>
                {isEditing ? (
                  <select
                    className="form-select form-select-sm w-auto"
                    value={editingCell?.draft ?? task.status}
                    onChange={(event) =>
                      handleSelectChange(task, 'status', event.target.value)
                    }
                    onBlur={() => {
                      if (
                        editingCell?.draft === editingCell?.original &&
                        !(
                          errorCell?.taskId === task.id &&
                          errorCell.field === 'status'
                        )
                      ) {
                        cancelEdit()
                      }
                    }}
                    onKeyDown={(event) => handleKeyDown(event, task)}
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
                    onDoubleClick={() => startEdit(task, 'status')}
                  >
                    <TaskStatusBadge status={task.status} dueDate={task.due_date} />
                  </button>
                )}
                {errorCell?.taskId === task.id &&
                errorCell.field === 'status' ? (
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
          render: (task) => {
            const isEditing =
              editingCell?.taskId === task.id &&
              editingCell.field === 'priority_level'
            const isSaving =
              isUpdatingInline &&
              savingCell?.taskId === task.id &&
              savingCell.field === 'priority_level'
            return (
              <div>
                {isEditing ? (
                  <select
                    className="form-select form-select-sm w-auto"
                    value={editingCell?.draft ?? ''}
                    onChange={(event) =>
                      handleSelectChange(task, 'priority_level', event.target.value)
                    }
                    onBlur={() => {
                      if (
                        editingCell?.draft === editingCell?.original &&
                        !(
                          errorCell?.taskId === task.id &&
                          errorCell.field === 'priority_level'
                        )
                      ) {
                        cancelEdit()
                      }
                    }}
                    onKeyDown={(event) => handleKeyDown(event, task)}
                    disabled={isSaving}
                  >
                    <option value="">Sem prioridade</option>
                    {priorityLevels.map((priorityLevel) => (
                      <option key={priorityLevel.id} value={priorityLevel.id}>
                        {priorityLevel.level} - {priorityLevel.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    className="task-status-button"
                    onDoubleClick={() => startEdit(task, 'priority_level')}
                  >
                    {task.priority_level_display ?? '-'}
                  </button>
                )}
                {errorCell?.taskId === task.id &&
                errorCell.field === 'priority_level' ? (
                  <div className="text-danger small mt-1">
                    Erro ao atualizar prioridade.
                  </div>
                ) : null}
              </div>
            )
          },
        },
        {
          header: 'Vencimento',
          sortKey: 'due_date',
          render: (task) => {
            const isEditing =
              editingCell?.taskId === task.id &&
              editingCell.field === 'due_date'
            const isSaving =
              isUpdatingInline &&
              savingCell?.taskId === task.id &&
              savingCell.field === 'due_date'
            return (
              <div>
                {isEditing ? (
                  <div className="d-flex align-items-center gap-2">
                    <input
                      className="form-control form-control-sm"
                      type="datetime-local"
                      value={editingCell?.draft ?? ''}
                      onChange={(event) =>
                        setEditingCell((current) =>
                          current
                            ? { ...current, draft: event.target.value }
                            : current,
                        )
                      }
                      onKeyDown={(event) => handleKeyDown(event, task)}
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleDueDateSave(task)}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={cancelEdit}
                      disabled={isSaving}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="task-status-button"
                    onDoubleClick={() => startEdit(task, 'due_date')}
                  >
                    {formatDate(task.due_date)}
                  </button>
                )}
                {errorCell?.taskId === task.id &&
                errorCell.field === 'due_date' ? (
                  <div className="text-danger small mt-1">
                    Erro ao atualizar vencimento.
                  </div>
                ) : null}
              </div>
            )
          },
        },
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

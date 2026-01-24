import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faPenToSquare,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from '../api/tasks'
import type { TaskStatus } from '../types/api'
import Modal from '../components/Modal'

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: string
  due_date: string
  user: string
}

const defaultTaskForm: TaskFormState = {
  title: '',
  description: '',
  status: 'pending',
  priority: '0',
  due_date: '',
  user: '',
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'completed', label: 'Concluida' },
  { value: 'cancelled', label: 'Cancelada' },
]

const toNumberOrUndefined = (value: string) =>
  value.trim() ? Number(value) : undefined

const toIsoOrNull = (value: string) =>
  value.trim() ? new Date(value).toISOString() : null

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-'

const TasksPage = () => {
  const queryClient = useQueryClient()
  const [createForm, setCreateForm] = useState<TaskFormState>(defaultTaskForm)
  const [editForm, setEditForm] = useState<TaskFormState>(defaultTaskForm)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null)

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  const taskQuery = useQuery({
    queryKey: ['task', selectedTaskId],
    queryFn: () => getTask(selectedTaskId as number),
    enabled: selectedTaskId !== null,
  })

  useEffect(() => {
    if (modalMode === 'edit' && taskQuery.data) {
      const task = taskQuery.data
      setEditForm({
        title: task.title ?? '',
        description: task.description ?? '',
        status: task.status,
        priority: String(task.priority ?? 0),
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        user: String(task.user ?? ''),
      })
    }
  }, [modalMode, taskQuery.data])

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setCreateForm(defaultTaskForm)
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateTask>[1]
    }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      if (selectedTaskId) {
        queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] })
      }
      setModalMode(null)
      setSelectedTaskId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      title: createForm.title.trim(),
      description: createForm.description.trim() || null,
      status: createForm.status,
      priority: Number(createForm.priority || 0),
      due_date: toIsoOrNull(createForm.due_date),
      user: toNumberOrUndefined(createForm.user),
    })
  }

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTaskId) {
      return
    }
    updateMutation.mutate({
      id: selectedTaskId,
      payload: {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        status: editForm.status,
        priority: Number(editForm.priority || 0),
        due_date: toIsoOrNull(editForm.due_date),
        user: toNumberOrUndefined(editForm.user),
      },
    })
  }

  const openModal = (id: number, mode: 'view' | 'edit') => {
    setSelectedTaskId(id)
    setModalMode(mode)
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTaskId(null)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Deseja remover esta tarefa?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="page-card">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Tasks</h1>
          <p className="text-muted mb-0">CRUD simples de tarefas.</p>
        </div>
        <button
          className="btn btn-dark"
          type="button"
          onClick={() => setIsCreateOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Criar tarefa
        </button>
      </div>

      {tasksQuery.isLoading ? (
        <div className="text-muted">Carregando tarefas...</div>
      ) : tasksQuery.isError ? (
        <div className="text-danger">Erro ao carregar tarefas.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Titulo</th>
                <th>Status</th>
                <th>Usuario</th>
                <th>Prioridade</th>
                <th>Vencimento</th>
                <th className="text-end">Opcoes</th>
              </tr>
            </thead>
            <tbody>
              {tasksQuery.data && tasksQuery.data.length > 0 ? (
                tasksQuery.data.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.user_display}</td>
                    <td>{task.priority}</td>
                    <td>{formatDate(task.due_date)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-dark"
                          type="button"
                          onClick={() => openModal(task.id, 'view')}
                          aria-label="Ver"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="btn btn-outline-dark"
                          type="button"
                          onClick={() => openModal(task.id, 'edit')}
                          aria-label="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          disabled={deleteMutation.isPending}
                          aria-label="Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalMode && selectedTaskId ? (
        <Modal
          title={modalMode === 'view' ? 'Detalhes da tarefa' : 'Editar tarefa'}
          onClose={closeModal}
          footer={
            modalMode === 'edit' ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-dark"
                  form="task-edit-form"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeModal}
              >
                Fechar
              </button>
            )
          }
        >
          {taskQuery.isLoading ? (
            <div className="text-muted">Carregando detalhes...</div>
          ) : taskQuery.isError ? (
            <div className="text-danger">Erro ao carregar tarefa.</div>
          ) : modalMode === 'view' && taskQuery.data ? (
            <dl className="row mb-0">
              <dt className="col-sm-3">Titulo</dt>
              <dd className="col-sm-9">{taskQuery.data.title}</dd>
              <dt className="col-sm-3">Descricao</dt>
              <dd className="col-sm-9">
                {taskQuery.data.description || '-'}
              </dd>
              <dt className="col-sm-3">Status</dt>
              <dd className="col-sm-9">{taskQuery.data.status}</dd>
              <dt className="col-sm-3">Usuario</dt>
              <dd className="col-sm-9">{taskQuery.data.user_display}</dd>
              <dt className="col-sm-3">Prioridade</dt>
              <dd className="col-sm-9">{taskQuery.data.priority}</dd>
              <dt className="col-sm-3">Vencimento</dt>
              <dd className="col-sm-9">
                {formatDate(taskQuery.data.due_date)}
              </dd>
            </dl>
          ) : (
            <form id="task-edit-form" onSubmit={handleEditSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Titulo</label>
                  <input
                    className="form-control"
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm({ ...editForm, title: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Descricao</label>
                  <input
                    className="form-control"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        description: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        status: event.target.value as TaskStatus,
                      })
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label">Prioridade</label>
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    max="10"
                    value={editForm.priority}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        priority: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Data de vencimento</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={editForm.due_date}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        due_date: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Usuario (ID)</label>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    value={editForm.user}
                    onChange={(event) =>
                      setEditForm({ ...editForm, user: event.target.value })
                    }
                  />
                </div>
              </div>
              {updateMutation.isError ? (
                <div className="text-danger mt-3">
                  Erro ao salvar tarefa.
                </div>
              ) : null}
            </form>
          )}
        </Modal>
      ) : null}

      {isCreateOpen ? (
        <Modal
          title="Criar tarefa"
          onClose={() => setIsCreateOpen(false)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-dark"
                form="task-create-form"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Salvando...' : 'Criar'}
              </button>
            </>
          }
        >
          <form id="task-create-form" onSubmit={handleCreateSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Titulo</label>
                <input
                  className="form-control"
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm({ ...createForm, title: event.target.value })
                  }
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Descricao</label>
                <input
                  className="form-control"
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      description: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={createForm.status}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      status: event.target.value as TaskStatus,
                    })
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label">Prioridade</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  max="10"
                  value={createForm.priority}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      priority: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Data de vencimento</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={createForm.due_date}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      due_date: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Usuario (ID)</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={createForm.user}
                  onChange={(event) =>
                    setCreateForm({ ...createForm, user: event.target.value })
                  }
                />
              </div>
            </div>
            {createMutation.isError ? (
              <div className="text-danger mt-3">
                Erro ao criar tarefa.
              </div>
            ) : null}
          </form>
        </Modal>
      ) : null}
    </div>
  )
}

export default TasksPage

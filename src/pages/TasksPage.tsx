import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from '../api/tasks'
import { getPriorityLevels } from '../api/priorityLevels'
import { getTeams } from '../api/teams'
import { getUserChoices } from '../api/users'
import type { TaskStatus } from '../types/api'
import AppModal from '../components/AppModal'
import DataTable from '../components/DataTable'
import NewItemButton from '../components/NewItemButton'
import RowActionsMenu from '../components/RowActionsMenu'
import TaskStatusBadge from '../components/TaskStatusBadge'
import { STATUS_LABELS } from '../utils/taskStatus'
import { confirmDeletion } from '../utils/swalMessages'

type TaskCreateFormState = {
  title: string
  description: string
  priority_level: string
  due_date: string
  user: string
  team: string
}

type TaskEditFormState = TaskCreateFormState & {
  status: TaskStatus
}

const defaultCreateForm: TaskCreateFormState = {
  title: '',
  description: '',
  priority_level: '',
  due_date: '',
  user: '',
  team: '',
}

const defaultEditForm: TaskEditFormState = {
  ...defaultCreateForm,
  status: 'pending',
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
]

const toNumberOrUndefined = (value: string) =>
  value.trim() ? Number(value) : undefined

const toIsoOrNull = (value: string) =>
  value.trim() ? new Date(value).toISOString() : null

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-'

const TasksPage = () => {
  const queryClient = useQueryClient()
  const storedUserId = localStorage.getItem('auth_user_id') ?? ''
  const [createForm, setCreateForm] =
    useState<TaskCreateFormState>(defaultCreateForm)
  const [editForm, setEditForm] = useState<TaskEditFormState>(defaultEditForm)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null)

  const tasksQuery = useQuery({
    queryKey: ['tasks', storedUserId],
    queryFn: getTasks,
  })

  const priorityLevelsQuery = useQuery({
    queryKey: ['priority-levels'],
    queryFn: getPriorityLevels,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const activeTeamId =
    modalMode === 'edit'
      ? editForm.team
      : isCreateOpen
        ? createForm.team
        : ''

  const userChoicesQuery = useQuery({
    queryKey: ['user-choices', activeTeamId],
    queryFn: () =>
      getUserChoices({
        teamId: activeTeamId ? Number(activeTeamId) : undefined,
        pageSize: 200,
      }),
    enabled: !!activeTeamId,
  })

  const priorityLevels = (priorityLevelsQuery.data ?? [])
    .slice()
    .sort((leftLevel, rightLevel) => leftLevel.level - rightLevel.level)

  const userChoices = userChoicesQuery.data?.results ?? []

  const taskQuery = useQuery({
    queryKey: ['task', selectedTaskId, storedUserId],
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
        priority_level: task.priority_level ? String(task.priority_level) : '',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        user: String(task.user ?? ''),
        team: task.team ? String(task.team) : '',
      })
    }
  }, [modalMode, taskQuery.data])

  useEffect(() => {
    const teams = teamsQuery.data ?? []
    if (teams.length === 1) {
      const teamId = String(teams[0].id)
      setCreateForm((current) =>
        current.team ? current : { ...current, team: teamId },
      )
      setEditForm((current) =>
        current.team ? current : { ...current, team: teamId },
      )
    }
  }, [teamsQuery.data])

  useEffect(() => {
    if (!createForm.user && userChoices.length > 0) {
      setCreateForm((current) => ({
        ...current,
        user: String(userChoices[0].id),
      }))
    }
  }, [createForm.user, userChoices])

  useEffect(() => {
    if (isCreateOpen) {
      setCreateForm((current) => ({
        ...current,
        user: '',
      }))
    }
  }, [createForm.team, isCreateOpen])


  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setCreateForm(defaultCreateForm)
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
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setModalMode(null)
      setSelectedTaskId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
    },
  })

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      title: createForm.title.trim(),
      description: createForm.description.trim() || null,
      priority_level: toNumberOrUndefined(createForm.priority_level),
      due_date: toIsoOrNull(createForm.due_date),
      user: toNumberOrUndefined(createForm.user),
      team: toNumberOrUndefined(createForm.team),
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
        priority_level: toNumberOrUndefined(editForm.priority_level),
        due_date: toIsoOrNull(editForm.due_date),
        user: toNumberOrUndefined(editForm.user),
        team: toNumberOrUndefined(editForm.team),
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

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDeletion('Essa tarefa sera removida.')
    if (confirmed) {
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
        <NewItemButton
          label="Criar tarefa"
          onClick={() => setIsCreateOpen(true)}
        />
      </div>

      {tasksQuery.isLoading ? (
        <div className="text-muted">Carregando tarefas...</div>
      ) : tasksQuery.isError ? (
        <div className="text-danger">Erro ao carregar tarefas.</div>
      ) : (
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
                      onClick: () => openModal(task.id, 'view'),
                    },
                    {
                      label: 'Editar',
                      onClick: () => openModal(task.id, 'edit'),
                    },
                    {
                      label: 'Deletar',
                      onClick: () => handleDelete(task.id),
                      className: 'dropdown-item text-danger',
                      disabled: deleteMutation.isPending,
                    },
                  ]}
                />
              ),
            },
          ]}
          data={tasksQuery.data ?? []}
          emptyMessage="Nenhuma tarefa encontrada."
          rowKey={(task) => task.id}
        />
      )}

      <AppModal
        isOpen={modalMode !== null && selectedTaskId !== null}
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
          <div className="task-details">
            <div className="task-details-row">
              <span className="task-details-label">Titulo</span>
              <span className="task-details-value">{taskQuery.data.title}</span>
            </div>
            <div className="task-details-row">
              <span className="task-details-label">Status</span>
              <TaskStatusBadge
                status={taskQuery.data.status}
                dueDate={taskQuery.data.due_date}
              />
            </div>
            <div className="task-details-row">
              <span className="task-details-label">Usuario</span>
              <span className="task-details-value">
                {taskQuery.data.user_display}
              </span>
            </div>
            <div className="task-details-row">
              <span className="task-details-label">Equipe</span>
              <span className="task-details-value">
                {taskQuery.data.team_display ?? '-'}
              </span>
            </div>
            <div className="task-details-row">
              <span className="task-details-label">Prioridade</span>
              <span className="task-details-value">
                {taskQuery.data.priority_level_display ?? '-'}
              </span>
            </div>
            <div className="task-details-row">
              <span className="task-details-label">Vencimento</span>
              <span className="task-details-value">
                {formatDate(taskQuery.data.due_date)}
              </span>
            </div>
            <div className="task-details-row task-details-row--full">
              <span className="task-details-label">Descricao</span>
              <div className="task-details-value task-details-description">
                {taskQuery.data.description?.trim() || '-'}
              </div>
            </div>
          </div>
        ) : (
          <form id="task-edit-form" onSubmit={handleEditSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Titulo</label>
                <input
                  className="form-control"
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm({ ...editForm, title: event.target.value })
                  }
                  required
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label fw-semibold">Status</label>
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
                <label className="form-label fw-semibold">Prioridade</label>
                <select
                  className="form-select"
                  value={editForm.priority_level}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      priority_level: event.target.value,
                    })
                  }
                  disabled={priorityLevelsQuery.isLoading}
                >
                  <option value="">
                    {priorityLevelsQuery.isLoading
                      ? 'Carregando niveis...'
                      : 'Sem prioridade'}
                  </option>
                  {priorityLevels.map((priorityLevel) => (
                    <option key={priorityLevel.id} value={priorityLevel.id}>
                      {priorityLevel.level} - {priorityLevel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  Data de vencimento
                </label>
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
                <label className="form-label fw-semibold">Equipe</label>
              <select
                className="form-select"
                value={editForm.team}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    team: event.target.value,
                    user: '',
                  })
                }
                required
              >
                  <option value="">
                    {teamsQuery.isLoading
                      ? 'Carregando equipes...'
                      : 'Selecione uma equipe'}
                  </option>
                  {(teamsQuery.data ?? []).map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Usuario</label>
                <select
                  className="form-select"
                  value={editForm.user}
                  onChange={(event) =>
                    setEditForm({ ...editForm, user: event.target.value })
                  }
                  disabled={!editForm.team || userChoicesQuery.isLoading}
                >
                  <option value="">
                    {userChoicesQuery.isLoading
                      ? 'Carregando usuarios...'
                      : 'Selecione um usuario'}
                  </option>
                  {userChoices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Descricao</label>
                <textarea
                  className="form-control task-description-input"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>
            {updateMutation.isError ? (
              <div className="text-danger mt-3">Erro ao salvar tarefa.</div>
            ) : null}
          </form>
        )}
      </AppModal>

      <AppModal
        isOpen={isCreateOpen}
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
            <div className="col-12">
              <label className="form-label fw-semibold">Titulo</label>
              <input
                className="form-control"
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm({ ...createForm, title: event.target.value })
                }
                required
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label fw-semibold">Prioridade</label>
              <select
                className="form-select"
                value={createForm.priority_level}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    priority_level: event.target.value,
                  })
                }
                disabled={priorityLevelsQuery.isLoading}
              >
                <option value="">
                  {priorityLevelsQuery.isLoading
                    ? 'Carregando niveis...'
                    : 'Sem prioridade'}
                </option>
                {priorityLevels.map((priorityLevel) => (
                  <option key={priorityLevel.id} value={priorityLevel.id}>
                    {priorityLevel.level} - {priorityLevel.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Equipe</label>
              <select
                className="form-select"
                value={createForm.team}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    team: event.target.value,
                    user: '',
                  })
                }
                required
              >
                <option value="">
                  {teamsQuery.isLoading
                    ? 'Carregando equipes...'
                    : 'Selecione uma equipe'}
                </option>
                {(teamsQuery.data ?? []).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Data de vencimento</label>
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
              <label className="form-label fw-semibold">Usuario</label>
              <select
                className="form-select"
                value={createForm.user}
                onChange={(event) =>
                  setCreateForm({ ...createForm, user: event.target.value })
                }
                disabled={!createForm.team || userChoicesQuery.isLoading}
              >
                <option value="">
                  {userChoicesQuery.isLoading
                    ? 'Carregando usuarios...'
                    : 'Selecione um usuario'}
                </option>
                {userChoices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Descricao</label>
              <textarea
                className="form-control task-description-input"
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    description: event.target.value,
                  })
                }
                rows={4}
              />
            </div>
          </div>
          {createMutation.isError ? (
            <div className="text-danger mt-3">Erro ao criar tarefa.</div>
          ) : null}
        </form>
      </AppModal>
    </div>
  )
}

export default TasksPage

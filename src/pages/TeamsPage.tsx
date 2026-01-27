import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTeam,
  deleteTeam,
  getTeam,
  getTeams,
  getTeamTasks,
  updateTeam,
} from '../api/teams'
import { createTask } from '../api/tasks'
import { getPriorityLevels } from '../api/priorityLevels'
import { getUserChoices } from '../api/users'
import AppModal from '../components/AppModal'
import DataTable from '../components/DataTable'
import NewItemButton from '../components/NewItemButton'
import RowActionsMenu from '../components/RowActionsMenu'
import TaskStatusBadge from '../components/TaskStatusBadge'
import { confirmDeletion } from '../utils/swalMessages'

type TeamCreateFormState = {
  name: string
  description: string
  members: number[]
  managers: number[]
}

type TeamEditFormState = TeamCreateFormState

const toNumberOrUndefined = (value: string) =>
  value.trim() ? Number(value) : undefined

const toIsoOrNull = (value: string) =>
  value.trim() ? new Date(value).toISOString() : null

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-'

const defaultCreateForm: TeamCreateFormState = {
  name: '',
  description: '',
  members: [],
  managers: [],
}

const defaultEditForm: TeamEditFormState = {
  name: '',
  description: '',
  members: [],
  managers: [],
}

const TeamsPage = () => {
  const queryClient = useQueryClient()
  const [createForm, setCreateForm] =
    useState<TeamCreateFormState>(defaultCreateForm)
  const [editForm, setEditForm] = useState<TeamEditFormState>(defaultEditForm)
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general')
  const [viewTab, setViewTab] = useState<'info' | 'tasks'>('info')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null)
  const [isTeamTaskCreateOpen, setIsTeamTaskCreateOpen] = useState(false)
  const [teamTaskForm, setTeamTaskForm] = useState({
    title: '',
    description: '',
    priority_level: '',
    due_date: '',
    user: '',
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const teamQuery = useQuery({
    queryKey: ['team', selectedTeamId],
    queryFn: () => getTeam(selectedTeamId as number),
    enabled: selectedTeamId !== null,
  })

  const userChoicesQuery = useQuery({
    queryKey: ['user-choices', 'teams'],
    queryFn: () => getUserChoices({ pageSize: 200 }),
  })

  const teamTasksQuery = useQuery({
    queryKey: ['team-tasks', selectedTeamId],
    queryFn: () => getTeamTasks(selectedTeamId as number),
    enabled: modalMode === 'view' && selectedTeamId !== null,
  })

  const teamUserChoicesQuery = useQuery({
    queryKey: ['user-choices', 'team', selectedTeamId],
    queryFn: () =>
      getUserChoices({ teamId: selectedTeamId ?? undefined, pageSize: 200 }),
    enabled: modalMode === 'view' && selectedTeamId !== null,
  })

  const priorityLevelsQuery = useQuery({
    queryKey: ['priority-levels'],
    queryFn: getPriorityLevels,
  })

  const userChoices = userChoicesQuery.data?.results ?? []
  const teamUserChoices = teamUserChoicesQuery.data?.results ?? []

  useEffect(() => {
    if (modalMode === 'edit' && teamQuery.data) {
      const team = teamQuery.data
      setEditForm({
        name: team.name ?? '',
        description: team.description ?? '',
        members: team.members ?? [],
        managers: team.managers ?? [],
      })
    }
  }, [modalMode, teamQuery.data])

  useEffect(() => {
    if (!isCreateOpen) {
      setActiveTab('general')
      setSelectedMemberId('')
    }
  }, [isCreateOpen])

  useEffect(() => {
    if (
      isTeamTaskCreateOpen &&
      !teamTaskForm.user &&
      teamUserChoices.length > 0
    ) {
      setTeamTaskForm((current) => ({
        ...current,
        user: String(teamUserChoices[0].id),
      }))
    }
  }, [isTeamTaskCreateOpen, teamTaskForm.user, teamUserChoices])

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
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
      payload: Parameters<typeof updateTeam>[1]
    }) => updateTeam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      if (selectedTeamId) {
        queryClient.invalidateQueries({ queryKey: ['team', selectedTeamId] })
      }
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setModalMode(null)
      setSelectedTeamId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks', selectedTeamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setIsTeamTaskCreateOpen(false)
      setTeamTaskForm({
        title: '',
        description: '',
        priority_level: '',
        due_date: '',
        user: '',
      })
    },
  })

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      name: createForm.name.trim(),
      description: createForm.description.trim() || null,
      members: createForm.members,
      managers: createForm.managers,
    })
  }

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTeamId) {
      return
    }
    updateMutation.mutate({
      id: selectedTeamId,
      payload: {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        members: editForm.members,
        managers: editForm.managers,
      },
    })
  }

  const openModal = (id: number, mode: 'view' | 'edit') => {
    setSelectedTeamId(id)
    setModalMode(mode)
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTeamId(null)
    setSelectedMemberId('')
    setActiveTab('general')
    setViewTab('info')
    setIsTeamTaskCreateOpen(false)
    setTeamTaskForm({
      title: '',
      description: '',
      priority_level: '',
      due_date: '',
      user: '',
    })
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDeletion('Essa equipe sera removida.')
    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  const handleTeamTaskCreateSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!selectedTeamId) {
      return
    }
    createTaskMutation.mutate({
      title: teamTaskForm.title.trim(),
      description: teamTaskForm.description.trim() || null,
      priority_level: toNumberOrUndefined(teamTaskForm.priority_level),
      due_date: toIsoOrNull(teamTaskForm.due_date),
      user: toNumberOrUndefined(teamTaskForm.user),
      team: selectedTeamId,
    })
  }

  return (
    <div className="page-card">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Equipes</h1>
          <p className="text-muted mb-0">Gerencie equipes e membros.</p>
        </div>
        <NewItemButton
          label="Criar equipe"
          onClick={() => setIsCreateOpen(true)}
        />
      </div>

      {teamsQuery.isLoading ? (
        <div className="text-muted">Carregando equipes...</div>
      ) : teamsQuery.isError ? (
        <div className="text-danger">Erro ao carregar equipes.</div>
      ) : (
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
              render: (team) =>
                team.managers_display?.length ?? team.managers.length ?? 0,
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
                      onClick: () => openModal(team.id, 'view'),
                    },
                    {
                      label: 'Editar',
                      onClick: () => openModal(team.id, 'edit'),
                    },
                    {
                      label: 'Deletar',
                      onClick: () => handleDelete(team.id),
                      className: 'dropdown-item text-danger',
                      disabled: deleteMutation.isPending,
                    },
                  ]}
                />
              ),
            },
          ]}
          data={teamsQuery.data ?? []}
          emptyMessage="Nenhuma equipe encontrada."
          rowKey={(team) => team.id}
        />
      )}

      <AppModal
        isOpen={modalMode !== null && selectedTeamId !== null}
        title={modalMode === 'view' ? 'Detalhes da equipe' : 'Editar equipe'}
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
                form="team-edit-form"
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
        {teamQuery.isLoading ? (
          <div className="text-muted">Carregando detalhes...</div>
        ) : teamQuery.isError ? (
          <div className="text-danger">Erro ao carregar equipe.</div>
        ) : modalMode === 'view' && teamQuery.data ? (
          <>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${viewTab === 'info' ? 'active' : ''}`}
                  onClick={() => setViewTab('info')}
                >
                  Informacoes
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${viewTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setViewTab('tasks')}
                >
                  Tarefas
                </button>
              </li>
            </ul>

            {viewTab === 'info' ? (
              <dl className="row mb-0">
                <dt className="col-sm-3">Nome</dt>
                <dd className="col-sm-9">{teamQuery.data.name}</dd>
                <dt className="col-sm-3">Descricao</dt>
                <dd className="col-sm-9">{teamQuery.data.description || '-'}</dd>
                <dt className="col-sm-3">Membros</dt>
                <dd className="col-sm-9">
                  {(teamQuery.data.members_display ?? [])
                    .map((member) => member.name)
                    .join(', ') || '-'}
                </dd>
                <dt className="col-sm-3">Managers</dt>
                <dd className="col-sm-9">
                  {(teamQuery.data.managers_display ?? [])
                    .map((member) => member.name)
                    .join(', ') || '-'}
                </dd>
              </dl>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Tarefas da equipe</h6>
                    <p className="text-muted mb-0">
                      Visualize e crie tarefas vinculadas a esta equipe.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => setIsTeamTaskCreateOpen(true)}
                  >
                    Criar tarefa
                  </button>
                </div>
                {teamTasksQuery.isLoading ? (
                  <div className="text-muted">Carregando tarefas...</div>
                ) : teamTasksQuery.isError ? (
                  <div className="text-danger">Erro ao carregar tarefas.</div>
                ) : (
                  <DataTable
                    columns={[
                      { header: 'ID', render: (task) => task.id },
                      { header: 'Titulo', render: (task) => task.title },
                      {
                        header: 'Status',
                        render: (task) => (
                          <TaskStatusBadge
                            status={task.status}
                            dueDate={task.due_date}
                          />
                        ),
                      },
                      {
                        header: 'Usuario',
                        render: (task) => task.user_display,
                      },
                      {
                        header: 'Prioridade',
                        render: (task) => task.priority_level_display ?? '-',
                      },
                      {
                        header: 'Vencimento',
                        render: (task) => formatDate(task.due_date),
                      },
                    ]}
                    data={teamTasksQuery.data?.results ?? []}
                    emptyMessage="Nenhuma tarefa encontrada."
                    rowKey={(task) => task.id}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <form id="team-edit-form" onSubmit={handleEditSubmit}>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  Informacoes
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  Membros
                </button>
              </li>
            </ul>

            {activeTab === 'general' ? (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nome</label>
                  <input
                    className="form-control"
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm({ ...editForm, name: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Descricao</label>
                  <textarea
                    className="form-control team-description-input"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm({ ...editForm, description: event.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Adicionar membro</label>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      value={selectedMemberId}
                      onChange={(event) => setSelectedMemberId(event.target.value)}
                    >
                      <option value="">Selecione um usuario</option>
                      {userChoices.map((choice) => (
                        <option key={choice.id} value={choice.id}>
                          {choice.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      onClick={() => {
                        if (!selectedMemberId) return
                        const memberId = Number(selectedMemberId)
                        if (Number.isNaN(memberId)) return
                        if (!editForm.members.includes(memberId)) {
                          setEditForm((current) => ({
                            ...current,
                            members: [...current.members, memberId],
                          }))
                        }
                        setSelectedMemberId('')
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
                <div className="col-12">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th className="text-end">Manager</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.members.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="text-muted">
                              Nenhum membro adicionado.
                            </td>
                          </tr>
                        ) : (
                          editForm.members.map((memberId) => {
                            const member = userChoices.find(
                              (choice) => choice.id === memberId,
                            )
                            const isManager = editForm.managers.includes(memberId)
                            return (
                              <tr key={memberId}>
                                <td>{member?.name ?? `Usuario ${memberId}`}</td>
                                <td className="text-end">
                                  <div className="form-check form-switch d-inline-flex align-items-center justify-content-end">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={isManager}
                                      onChange={(event) => {
                                        const checked = event.target.checked
                                        setEditForm((current) => ({
                                          ...current,
                                          managers: checked
                                            ? [...current.managers, memberId]
                                            : current.managers.filter(
                                                (id) => id !== memberId,
                                              ),
                                        }))
                                      }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {updateMutation.isError ? (
              <div className="text-danger mt-3">Erro ao salvar equipe.</div>
            ) : null}
          </form>
        )}
      </AppModal>

      <AppModal
        isOpen={isCreateOpen}
        title="Criar equipe"
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
              form="team-create-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Criar'}
            </button>
          </>
        }
      >
        <form id="team-create-form" onSubmit={handleCreateSubmit}>
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                Informacoes
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                Membros
              </button>
            </li>
          </ul>

          {activeTab === 'general' ? (
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nome</label>
                <input
                  className="form-control"
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm({ ...createForm, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Descricao</label>
                <textarea
                  className="form-control team-description-input"
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Adicionar membro</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={selectedMemberId}
                    onChange={(event) => setSelectedMemberId(event.target.value)}
                  >
                    <option value="">Selecione um usuario</option>
                    {userChoices.map((choice) => (
                      <option key={choice.id} value={choice.id}>
                        {choice.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => {
                      if (!selectedMemberId) return
                      const memberId = Number(selectedMemberId)
                      if (Number.isNaN(memberId)) return
                      if (!createForm.members.includes(memberId)) {
                        setCreateForm((current) => ({
                          ...current,
                          members: [...current.members, memberId],
                        }))
                      }
                      setSelectedMemberId('')
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th className="text-end">Manager</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createForm.members.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-muted">
                            Nenhum membro adicionado.
                          </td>
                        </tr>
                      ) : (
                        createForm.members.map((memberId) => {
                          const member = userChoices.find(
                            (choice) => choice.id === memberId,
                          )
                          const isManager = createForm.managers.includes(memberId)
                          return (
                            <tr key={memberId}>
                              <td>{member?.name ?? `Usuario ${memberId}`}</td>
                              <td className="text-end">
                                <div className="form-check form-switch d-inline-flex align-items-center justify-content-end">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isManager}
                                    onChange={(event) => {
                                      const checked = event.target.checked
                                      setCreateForm((current) => ({
                                        ...current,
                                        managers: checked
                                          ? [...current.managers, memberId]
                                          : current.managers.filter(
                                              (id) => id !== memberId,
                                            ),
                                      }))
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {createMutation.isError ? (
            <div className="text-danger mt-3">Erro ao criar equipe.</div>
          ) : null}
        </form>
      </AppModal>

      <AppModal
        isOpen={isTeamTaskCreateOpen}
        title="Criar tarefa da equipe"
        onClose={() => setIsTeamTaskCreateOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setIsTeamTaskCreateOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-dark"
              form="team-task-create-form"
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Salvando...' : 'Criar'}
            </button>
          </>
        }
      >
        <form id="team-task-create-form" onSubmit={handleTeamTaskCreateSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Titulo</label>
              <input
                className="form-control"
                value={teamTaskForm.title}
                onChange={(event) =>
                  setTeamTaskForm({ ...teamTaskForm, title: event.target.value })
                }
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Prioridade</label>
              <select
                className="form-select"
                value={teamTaskForm.priority_level}
                onChange={(event) =>
                  setTeamTaskForm({
                    ...teamTaskForm,
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
                {(priorityLevelsQuery.data ?? []).map((priorityLevel) => (
                  <option key={priorityLevel.id} value={priorityLevel.id}>
                    {priorityLevel.level} - {priorityLevel.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Data de vencimento</label>
              <input
                className="form-control"
                type="datetime-local"
                value={teamTaskForm.due_date}
                onChange={(event) =>
                  setTeamTaskForm({
                    ...teamTaskForm,
                    due_date: event.target.value,
                  })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Usuario</label>
              <select
                className="form-select"
                value={teamTaskForm.user}
                onChange={(event) =>
                  setTeamTaskForm({
                    ...teamTaskForm,
                    user: event.target.value,
                  })
                }
                disabled={teamUserChoicesQuery.isLoading}
                required
              >
                <option value="">
                  {teamUserChoicesQuery.isLoading
                    ? 'Carregando usuarios...'
                    : 'Selecione um usuario'}
                </option>
                {teamUserChoices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Descricao</label>
              <textarea
                className="form-control task-description-input"
                value={teamTaskForm.description}
                onChange={(event) =>
                  setTeamTaskForm({
                    ...teamTaskForm,
                    description: event.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          {createTaskMutation.isError ? (
            <div className="text-danger mt-3">Erro ao criar tarefa.</div>
          ) : null}
        </form>
      </AppModal>
    </div>
  )
}

export default TeamsPage

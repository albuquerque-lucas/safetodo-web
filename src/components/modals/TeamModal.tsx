import type { Dispatch, SetStateAction } from 'react'
import AppModal from '../AppModal'
import DataTable from '../DataTable'
import TaskStatusBadge from '../TaskStatusBadge'
import type { Team, Task } from '../../types/api'
import type { TeamEditFormState } from '../../types/teams'

type TeamModalProps = {
  mode: 'view' | 'edit'
  isOpen: boolean
  onClose: () => void
  isSaving: boolean
  saveError: boolean
  formId: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  isError: boolean
  team?: Team
  teamTasks: Task[]
  isTasksLoading: boolean
  isTasksError: boolean
  viewTab: 'info' | 'tasks'
  setViewTab: Dispatch<SetStateAction<'info' | 'tasks'>>
  activeTab: 'general' | 'members'
  setActiveTab: Dispatch<SetStateAction<'general' | 'members'>>
  selectedMemberId: string
  setSelectedMemberId: Dispatch<SetStateAction<string>>
  userChoices: { id: number; name: string }[]
  editForm: TeamEditFormState
  setEditForm: Dispatch<SetStateAction<TeamEditFormState>>
  onOpenTeamTaskModal: () => void
}

const TeamModal = ({
  mode,
  isOpen,
  onClose,
  isSaving,
  saveError,
  formId,
  onSubmit,
  isLoading,
  isError,
  team,
  teamTasks,
  isTasksLoading,
  isTasksError,
  viewTab,
  setViewTab,
  activeTab,
  setActiveTab,
  selectedMemberId,
  setSelectedMemberId,
  userChoices,
  editForm,
  setEditForm,
  onOpenTeamTaskModal,
}: TeamModalProps) => (
  <AppModal
    isOpen={isOpen}
    title={mode === 'view' ? 'Detalhes da equipe' : 'Editar equipe'}
    onClose={onClose}
    footer={
      mode === 'edit' ? (
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-dark"
            form={formId}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          Fechar
        </button>
      )
    }
  >
    {isLoading ? (
      <div className="text-muted">Carregando detalhes...</div>
    ) : isError ? (
      <div className="text-danger">Erro ao carregar equipe.</div>
    ) : mode === 'view' && team ? (
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
            <dd className="col-sm-9">{team.name}</dd>
            <dt className="col-sm-3">Descricao</dt>
            <dd className="col-sm-9">{team.description || '-'}</dd>
            <dt className="col-sm-3">Membros</dt>
            <dd className="col-sm-9">
              {(team.members_display ?? [])
                .map((member) => member.name)
                .join(', ') || '-'}
            </dd>
            <dt className="col-sm-3">Managers</dt>
            <dd className="col-sm-9">
              {(team.managers_display ?? [])
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
                onClick={onOpenTeamTaskModal}
              >
                Criar tarefa
              </button>
            </div>
            {isTasksLoading ? (
              <div className="text-muted">Carregando tarefas...</div>
            ) : isTasksError ? (
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
                    render: (task) =>
                      task.due_date ? new Date(task.due_date).toLocaleString() : '-',
                  },
                ]}
                data={teamTasks}
                emptyMessage="Nenhuma tarefa encontrada."
                rowKey={(task) => task.id}
              />
            )}
          </div>
        )}
      </>
    ) : (
      <form id={formId} onSubmit={onSubmit}>
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
                  setEditForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
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
                  setEditForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
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

        {saveError ? (
          <div className="text-danger mt-3">Erro ao salvar equipe.</div>
        ) : null}
      </form>
    )}
  </AppModal>
)

export default TeamModal

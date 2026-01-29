import type { Dispatch, SetStateAction } from 'react'
import AppModal from '../AppModal'
import type { TeamCreateFormState } from '../../types/teams'

type TeamCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
  saveError: boolean
  formId: string
  activeTab: 'general' | 'members'
  setActiveTab: Dispatch<SetStateAction<'general' | 'members'>>
  selectedMemberId: string
  setSelectedMemberId: Dispatch<SetStateAction<string>>
  form: TeamCreateFormState
  setForm: Dispatch<SetStateAction<TeamCreateFormState>>
  userChoices: { id: number; name: string }[]
}

const TeamCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  saveError,
  formId,
  activeTab,
  setActiveTab,
  selectedMemberId,
  setSelectedMemberId,
  form,
  setForm,
  userChoices,
}: TeamCreateModalProps) => (
  <AppModal
    isOpen={isOpen}
    title="Criar equipe"
    onClose={onClose}
    footer={
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
          {isSaving ? 'Salvando...' : 'Criar'}
        </button>
      </>
    }
  >
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
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
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
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
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
                  if (!form.members.includes(memberId)) {
                    setForm((current) => ({
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
                  {form.members.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-muted">
                        Nenhum membro adicionado.
                      </td>
                    </tr>
                  ) : (
                    form.members.map((memberId) => {
                      const member = userChoices.find(
                        (choice) => choice.id === memberId,
                      )
                      const isManager = form.managers.includes(memberId)
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
                                  setForm((current) => ({
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
        <div className="text-danger mt-3">Erro ao criar equipe.</div>
      ) : null}
    </form>
  </AppModal>
)

export default TeamCreateModal

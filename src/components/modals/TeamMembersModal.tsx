import type { Dispatch, SetStateAction } from 'react'
import AppModal from '../AppModal'

type TeamMembersModalProps = {
  isOpen: boolean
  onClose: () => void
  formId: string
  isSaving: boolean
  saveError: boolean
  userChoices: { id: number; name: string }[]
  selectedMemberId: string
  setSelectedMemberId: Dispatch<SetStateAction<string>>
  pendingMembers: { id: number; name: string }[]
  setPendingMembers: Dispatch<SetStateAction<{ id: number; name: string }[]>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

const TeamMembersModal = ({
  isOpen,
  onClose,
  formId,
  isSaving,
  saveError,
  userChoices,
  selectedMemberId,
  setSelectedMemberId,
  pendingMembers,
  setPendingMembers,
  onSubmit,
}: TeamMembersModalProps) => (
  <AppModal
    isOpen={isOpen}
    onClose={onClose}
    title="Adicionar membros"
    size="md"
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
          disabled={isSaving || pendingMembers.length === 0}
        >
          {isSaving ? 'Adicionando...' : 'Adicionar todos'}
        </button>
      </>
    }
  >
    <form id={formId} onSubmit={onSubmit} className="d-flex flex-column gap-3">
      <div>
        <label className="form-label">Selecionar usuario</label>
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
              const member = userChoices.find((choice) => choice.id === memberId)
              if (!member) return
              if (!pendingMembers.some((item) => item.id === memberId)) {
                setPendingMembers((current) => [...current, member])
              }
              setSelectedMemberId('')
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
      <div>
        <label className="form-label">Membros a adicionar</label>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Usuario</th>
                <th className="text-end">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-muted">
                    Nenhum membro selecionado.
                  </td>
                </tr>
              ) : (
                pendingMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setPendingMembers((current) =>
                            current.filter((item) => item.id !== member.id),
                          )
                        }
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {saveError ? (
        <div className="text-danger">Erro ao adicionar membros.</div>
      ) : null}
    </form>
  </AppModal>
)

export default TeamMembersModal

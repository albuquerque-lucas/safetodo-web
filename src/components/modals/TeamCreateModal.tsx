import AppModal from '../AppModal'

type TeamCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
  saveError: boolean
  formId: string
  children: React.ReactNode
}

const TeamCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  saveError,
  formId,
  children,
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
      {children}
      {saveError ? (
        <div className="text-danger mt-3">Erro ao criar equipe.</div>
      ) : null}
    </form>
  </AppModal>
)

export default TeamCreateModal

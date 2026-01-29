import AppModal from '../AppModal'

type PriorityLevelCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
  saveError: boolean
  formId: string
  children: React.ReactNode
}

const PriorityLevelCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  saveError,
  formId,
  children,
}: PriorityLevelCreateModalProps) => (
  <AppModal
    isOpen={isOpen}
    title="Adicionar nivel de prioridade"
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
        <div className="text-danger mt-3">
          Erro ao criar nivel de prioridade.
        </div>
      ) : null}
    </form>
  </AppModal>
)

export default PriorityLevelCreateModal

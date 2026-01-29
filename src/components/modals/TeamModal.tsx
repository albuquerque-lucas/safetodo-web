import AppModal from '../AppModal'

type TeamModalProps = {
  mode: 'view' | 'edit'
  isOpen: boolean
  onClose: () => void
  isSaving: boolean
  saveError: boolean
  formId: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

const TeamModal = ({
  mode,
  isOpen,
  onClose,
  isSaving,
  saveError,
  formId,
  onSubmit,
  children,
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
    {mode === 'edit' ? (
      <form id={formId} onSubmit={onSubmit}>
        {children}
        {saveError ? (
          <div className="text-danger mt-3">Erro ao salvar equipe.</div>
        ) : null}
      </form>
    ) : (
      children
    )}
  </AppModal>
)

export default TeamModal

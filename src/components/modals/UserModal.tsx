import AppModal from '../AppModal'

type UserModalProps = {
  mode: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  formId: string
  isSaving: boolean
  saveError: boolean
  children: React.ReactNode
}

const UserModal = ({
  mode,
  isOpen,
  onClose,
  onSubmit,
  formId,
  isSaving,
  saveError,
  children,
}: UserModalProps) => (
  <AppModal
    isOpen={isOpen}
    title={mode === 'edit' ? 'Editar usuario' : 'Criar usuario'}
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
          {isSaving ? 'Salvando...' : mode === 'edit' ? 'Salvar' : 'Criar'}
        </button>
      </>
    }
  >
    <form id={formId} onSubmit={onSubmit}>
      {children}
      {saveError ? (
        <div className="text-danger mt-3">
          {mode === 'edit' ? 'Erro ao salvar usuario.' : 'Erro ao criar usuario.'}
        </div>
      ) : null}
    </form>
  </AppModal>
)

export default UserModal

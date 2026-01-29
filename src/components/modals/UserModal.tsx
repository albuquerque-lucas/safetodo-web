import type { Dispatch, ReactNode, SetStateAction } from 'react'
import AppModal from '../AppModal'
import UserFormFields from '../users/UserFormFields'
import type { UserCreateFormState, UserEditFormState } from '../../types/users'

type BaseProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  formId: string
  isSaving: boolean
  saveError: boolean
}

type UserModalProps =
  | (BaseProps & {
      mode: 'create'
      createForm: UserCreateFormState
      setCreateForm: Dispatch<SetStateAction<UserCreateFormState>>
    })
  | (BaseProps & {
      mode: 'edit'
      editForm: UserEditFormState
      setEditForm: Dispatch<SetStateAction<UserEditFormState>>
      isLoading: boolean
      isError: boolean
    })

const UserModal = (props: UserModalProps) => {
  const { mode, isOpen, onClose, onSubmit, formId, isSaving, saveError } = props
  const isEdit = mode === 'edit'
  let content: ReactNode

  if (mode === 'edit') {
    const { editForm, setEditForm, isLoading, isError } = props
    if (isLoading) {
      content = <div className="text-muted">Carregando detalhes...</div>
    } else if (isError) {
      content = <div className="text-danger">Erro ao carregar usuario.</div>
    } else {
      content = (
        <div className="row g-3">
          <UserFormFields mode="edit" form={editForm} setForm={setEditForm} />
        </div>
      )
    }
  } else {
    const { createForm, setCreateForm } = props
    content = (
      <div className="row g-3">
        <UserFormFields mode="create" form={createForm} setForm={setCreateForm} />
        <div className="col-6 col-md-6">
          <label className="form-label">Senha</label>
          <input
            className="form-control"
            type="password"
            value={createForm.password}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="col-6 col-md-6">
          <label className="form-label">Confirmar senha</label>
          <input
            className="form-control"
            type="password"
            value={createForm.password2}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                password2: event.target.value,
              }))
            }
            required
          />
        </div>
      </div>
    )
  }

  return (
    <AppModal
      isOpen={isOpen}
      title={isEdit ? 'Editar usuario' : 'Criar usuario'}
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
            {isSaving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit}>
        {content}
        {saveError ? (
          <div className="text-danger mt-3">
            {isEdit ? 'Erro ao salvar usuario.' : 'Erro ao criar usuario.'}
          </div>
        ) : null}
      </form>
    </AppModal>
  )
}

export default UserModal

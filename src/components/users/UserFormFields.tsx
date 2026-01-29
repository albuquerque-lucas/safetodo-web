import type { Dispatch, SetStateAction } from 'react'
import type { UserBaseFormState } from '../../types/users'

type UserFormFieldsProps<T extends UserBaseFormState> = {
  mode: 'create' | 'edit'
  form: T
  setForm: Dispatch<SetStateAction<T>>
}

const UserFormFields = <T extends UserBaseFormState>({
  mode,
  form,
  setForm,
}: UserFormFieldsProps<T>) => {
  const isCreate = mode === 'create'

  const updateField = <K extends keyof UserBaseFormState>(
    key: K,
    value: UserBaseFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <div className={isCreate ? 'col-12 col-md-6' : 'col-12 col-md-4'}>
        <label className="form-label">Username</label>
        <input
          className="form-control"
          value={form.username}
          onChange={(event) => updateField('username', event.target.value)}
          required
        />
      </div>
      <div className={isCreate ? 'col-12 col-md-6' : 'col-12 col-md-4'}>
        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
        />
      </div>
      <div className={isCreate ? 'col-6 col-md-3' : 'col-6 col-md-2'}>
        <label className="form-label">Nome</label>
        <input
          className="form-control"
          value={form.first_name}
          onChange={(event) => updateField('first_name', event.target.value)}
        />
      </div>
      <div className={isCreate ? 'col-6 col-md-3' : 'col-6 col-md-2'}>
        <label className="form-label">Sobrenome</label>
        <input
          className="form-control"
          value={form.last_name}
          onChange={(event) => updateField('last_name', event.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label">Bio</label>
        <input
          className="form-control"
          value={form.bio}
          onChange={(event) => updateField('bio', event.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label">Telefone</label>
        <input
          className="form-control"
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
        />
      </div>
    </>
  )
}

export default UserFormFields

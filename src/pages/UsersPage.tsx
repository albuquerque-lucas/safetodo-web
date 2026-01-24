import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../api/users'
import AppModal from '../components/AppModal'
import DataTable from '../components/DataTable'
import NewItemButton from '../components/NewItemButton'
import RowActionsMenu from '../components/RowActionsMenu'
import { confirmDeletion } from '../utils/swalMessages'

type UserCreateFormState = {
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
  phone: string
  password: string
  password2: string
}

type UserEditFormState = Omit<UserCreateFormState, 'password' | 'password2'>

const defaultCreateForm: UserCreateFormState = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  bio: '',
  phone: '',
  password: '',
  password2: '',
}

const defaultEditForm: UserEditFormState = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  bio: '',
  phone: '',
}

const UsersPage = () => {
  const queryClient = useQueryClient()
  const [createForm, setCreateForm] = useState<UserCreateFormState>(
    defaultCreateForm,
  )
  const [editForm, setEditForm] =
    useState<UserEditFormState>(defaultEditForm)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null)

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const userQuery = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => getUser(selectedUserId as number),
    enabled: selectedUserId !== null,
  })

  useEffect(() => {
    if (modalMode === 'edit' && userQuery.data) {
      const user = userQuery.data
      setEditForm({
        username: user.username ?? '',
        email: user.email ?? '',
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        bio: user.bio ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [modalMode, userQuery.data])

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
      payload: Parameters<typeof updateUser>[1]
    }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ['user', selectedUserId] })
      }
      setModalMode(null)
      setSelectedUserId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      username: createForm.username.trim(),
      email: createForm.email.trim(),
      first_name: createForm.first_name.trim() || undefined,
      last_name: createForm.last_name.trim() || undefined,
      bio: createForm.bio.trim() || null,
      phone: createForm.phone.trim() || null,
      password: createForm.password,
      password2: createForm.password2,
    })
  }

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedUserId) {
      return
    }
    updateMutation.mutate({
      id: selectedUserId,
      payload: {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        first_name: editForm.first_name.trim() || undefined,
        last_name: editForm.last_name.trim() || undefined,
        bio: editForm.bio.trim() || null,
        phone: editForm.phone.trim() || null,
      },
    })
  }

  const openModal = (id: number, mode: 'view' | 'edit') => {
    setSelectedUserId(id)
    setModalMode(mode)
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedUserId(null)
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDeletion('Esse usuario sera removido.')
    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="page-card">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Usuarios</h1>
          <p className="text-muted mb-0">CRUD simples de usuarios.</p>
        </div>
        <NewItemButton
          label="Criar usuario"
          onClick={() => setIsCreateOpen(true)}
        />
      </div>

      {usersQuery.isLoading ? (
        <div className="text-muted">Carregando usuarios...</div>
      ) : usersQuery.isError ? (
        <div className="text-danger">Erro ao carregar usuarios.</div>
      ) : (
        <DataTable
          columns={[
            { header: 'ID', render: (user) => user.id },
            { header: 'Username', render: (user) => user.username },
            { header: 'Email', render: (user) => user.email },
            {
              header: 'Nome',
              render: (user) =>
                [user.first_name, user.last_name].filter(Boolean).join(' ') ||
                '-',
            },
            { header: 'Telefone', render: (user) => user.phone || '-' },
            {
              header: 'Opcoes',
              headerClassName: 'text-end',
              className: 'text-end',
              render: (user) => (
                <RowActionsMenu
                  items={[
                    {
                      label: 'Visualizar',
                      onClick: () => openModal(user.id, 'view'),
                    },
                    {
                      label: 'Editar',
                      onClick: () => openModal(user.id, 'edit'),
                    },
                    {
                      label: 'Deletar',
                      onClick: () => handleDelete(user.id),
                      className: 'dropdown-item text-danger',
                      disabled: deleteMutation.isPending,
                    },
                  ]}
                />
              ),
            },
          ]}
          data={usersQuery.data ?? []}
          emptyMessage="Nenhum usuario encontrado."
          rowKey={(user) => user.id}
        />
      )}

      <AppModal
        isOpen={modalMode !== null && selectedUserId !== null}
        title={modalMode === 'view' ? 'Detalhes do usuario' : 'Editar usuario'}
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
                form="user-edit-form"
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
        {userQuery.isLoading ? (
          <div className="text-muted">Carregando detalhes...</div>
        ) : userQuery.isError ? (
          <div className="text-danger">Erro ao carregar usuario.</div>
        ) : modalMode === 'view' && userQuery.data ? (
          <dl className="row mb-0">
            <dt className="col-sm-3">Username</dt>
            <dd className="col-sm-9">{userQuery.data.username}</dd>
            <dt className="col-sm-3">Email</dt>
            <dd className="col-sm-9">{userQuery.data.email}</dd>
            <dt className="col-sm-3">Nome</dt>
            <dd className="col-sm-9">
              {[userQuery.data.first_name, userQuery.data.last_name]
                .filter(Boolean)
                .join(' ') || '-'}
            </dd>
            <dt className="col-sm-3">Bio</dt>
            <dd className="col-sm-9">{userQuery.data.bio || '-'}</dd>
            <dt className="col-sm-3">Telefone</dt>
            <dd className="col-sm-9">{userQuery.data.phone || '-'}</dd>
          </dl>
        ) : (
          <form id="user-edit-form" onSubmit={handleEditSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={editForm.username}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      username: event.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm({ ...editForm, email: event.target.value })
                  }
                  required
                />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">Nome</label>
                <input
                  className="form-control"
                  value={editForm.first_name}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      first_name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">Sobrenome</label>
                <input
                  className="form-control"
                  value={editForm.last_name}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      last_name: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Bio</label>
                <input
                  className="form-control"
                  value={editForm.bio}
                  onChange={(event) =>
                    setEditForm({ ...editForm, bio: event.target.value })
                  }
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Telefone</label>
                <input
                  className="form-control"
                  value={editForm.phone}
                  onChange={(event) =>
                    setEditForm({ ...editForm, phone: event.target.value })
                  }
                />
              </div>
            </div>
            {updateMutation.isError ? (
              <div className="text-danger mt-3">Erro ao salvar usuario.</div>
            ) : null}
          </form>
        )}
      </AppModal>

      <AppModal
        isOpen={isCreateOpen}
        title="Criar usuario"
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
              form="user-create-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Criar'}
            </button>
          </>
        }
      >
        <form id="user-create-form" onSubmit={handleCreateSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={createForm.username}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    username: event.target.value,
                  })
                }
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm({ ...createForm, email: event.target.value })
                }
                required
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                value={createForm.first_name}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    first_name: event.target.value,
                  })
                }
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Sobrenome</label>
              <input
                className="form-control"
                value={createForm.last_name}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    last_name: event.target.value,
                  })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Bio</label>
              <input
                className="form-control"
                value={createForm.bio}
                onChange={(event) =>
                  setCreateForm({ ...createForm, bio: event.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Telefone</label>
              <input
                className="form-control"
                value={createForm.phone}
                onChange={(event) =>
                  setCreateForm({ ...createForm, phone: event.target.value })
                }
              />
            </div>
            <div className="col-6 col-md-6">
              <label className="form-label">Senha</label>
              <input
                className="form-control"
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    password: event.target.value,
                  })
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
                  setCreateForm({
                    ...createForm,
                    password2: event.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          {createMutation.isError ? (
            <div className="text-danger mt-3">Erro ao criar usuario.</div>
          ) : null}
        </form>
      </AppModal>
    </div>
  )
}

export default UsersPage

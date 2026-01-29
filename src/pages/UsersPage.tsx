import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../api/users'
import DataTable from '../components/DataTable'
import NewItemButton from '../components/NewItemButton'
import RowActionsMenu from '../components/RowActionsMenu'
import UserModal from '../components/modals/UserModal'
import useModalState from '../hooks/useModalState'
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
  const navigate = useNavigate()
  const [createForm, setCreateForm] = useState<UserCreateFormState>(
    defaultCreateForm,
  )
  const [editForm, setEditForm] =
    useState<UserEditFormState>(defaultEditForm)

  const createModal = useModalState<'create'>()
  const editModal = useModalState<'edit', number>()

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const userQuery = useQuery({
    queryKey: ['user', editModal.selectedId],
    queryFn: () => getUser(editModal.selectedId as number),
    enabled: editModal.selectedId !== null && editModal.isOpen,
  })

  useEffect(() => {
    if (editModal.isOpen && userQuery.data) {
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
  }, [editModal.isOpen, userQuery.data])

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setCreateForm(defaultCreateForm)
      createModal.close()
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
      if (editModal.selectedId) {
        queryClient.invalidateQueries({ queryKey: ['user', editModal.selectedId] })
      }
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      editModal.close()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
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
    if (!editModal.selectedId) {
      return
    }
    updateMutation.mutate({
      id: editModal.selectedId,
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

  const openEditModal = (id: number) => {
    editModal.open('edit', id)
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
          onClick={() => createModal.open('create')}
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
                      onClick: () => navigate(`/app/users/${user.id}`),
                    },
                    {
                      label: 'Editar',
                      onClick: () => openEditModal(user.id),
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

      <UserModal
        mode="edit"
        isOpen={editModal.isOpen && editModal.selectedId !== null}
        onClose={editModal.close}
        onSubmit={handleEditSubmit}
        formId="user-edit-form"
        isSaving={updateMutation.isPending}
        saveError={updateMutation.isError}
      >
        {userQuery.isLoading ? (
          <div className="text-muted">Carregando detalhes...</div>
        ) : userQuery.isError ? (
          <div className="text-danger">Erro ao carregar usuario.</div>
        ) : (
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
        )}
      </UserModal>

      <UserModal
        mode="create"
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        onSubmit={handleCreateSubmit}
        formId="user-create-form"
        isSaving={createMutation.isPending}
        saveError={createMutation.isError}
      >
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
      </UserModal>
    </div>
  )
}

export default UsersPage

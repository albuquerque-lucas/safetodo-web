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
import NewItemButton from '../components/NewItemButton'
import UserModal from '../components/modals/UserModal'
import UsersTable from '../components/users/UsersTable'
import useModalState from '../hooks/useModalState'
import type { UserCreateFormState, UserEditFormState } from '../types/users'
import { confirmDeletion } from '../utils/swalMessages'

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

      <UsersTable
        users={usersQuery.data ?? []}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        isDeleting={deleteMutation.isPending}
        onView={(id) => navigate(`/app/users/${id}`)}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <UserModal
        mode="edit"
        isOpen={editModal.isOpen && editModal.selectedId !== null}
        onClose={editModal.close}
        onSubmit={handleEditSubmit}
        formId="user-edit-form"
        isSaving={updateMutation.isPending}
        saveError={updateMutation.isError}
        editForm={editForm}
        setEditForm={setEditForm}
        isLoading={userQuery.isLoading}
        isError={userQuery.isError}
      />

      <UserModal
        mode="create"
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        onSubmit={handleCreateSubmit}
        formId="user-create-form"
        isSaving={createMutation.isPending}
        saveError={createMutation.isError}
        createForm={createForm}
        setCreateForm={setCreateForm}
      />
    </div>
  )
}

export default UsersPage

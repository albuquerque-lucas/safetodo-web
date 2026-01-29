import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import NewItemButton from '../components/NewItemButton'
import PriorityLevelCreateModal from '../components/modals/PriorityLevelCreateModal'
import PriorityLevelListModal from '../components/modals/PriorityLevelListModal'
import { createPriorityLevel, getPriorityLevels } from '../api/priorityLevels'
import useModalState from '../hooks/useModalState'
import type { PriorityLevelFormState } from '../types/priorityLevels'

const defaultPriorityLevelForm: PriorityLevelFormState = {
  level: '',
  name: '',
  description: '',
  is_active: true,
}

const AdminPage = () => {
  const queryClient = useQueryClient()
  const [priorityLevelForm, setPriorityLevelForm] =
    useState<PriorityLevelFormState>(defaultPriorityLevelForm)

  const createModal = useModalState<'create'>()
  const listModal = useModalState<'list'>()

  const priorityLevelsQuery = useQuery({
    queryKey: ['priority-levels'],
    queryFn: getPriorityLevels,
  })

  const createPriorityLevelMutation = useMutation({
    mutationFn: createPriorityLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priority-levels'] })
      setPriorityLevelForm(defaultPriorityLevelForm)
      createModal.close()
    },
  })

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createPriorityLevelMutation.mutate({
      level: Number(priorityLevelForm.level),
      name: priorityLevelForm.name.trim(),
      description: priorityLevelForm.description.trim() || null,
      is_active: priorityLevelForm.is_active,
    })
  }

  const priorityLevels = priorityLevelsQuery.data ?? []

  return (
    <div className="page-card">
      <div className="admin-header mb-4">
        <div>
          <h1 className="h3 mb-1">Admin</h1>
          <p className="text-muted mb-0">Configuracoes gerais do sistema.</p>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="h5 mb-2">Niveis de prioridade</h2>
            <p className="text-muted mb-0">
              Cadastre niveis para classificar tarefas no sistema.
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="btn btn-outline-dark"
              type="button"
              onClick={() => listModal.open('list')}
            >
              Visualizar niveis
            </button>
            <NewItemButton
              label="Adicionar nivel"
              onClick={() => createModal.open('create')}
            />
          </div>
        </div>
      </div>
      <div className="admin-divider" />

      <PriorityLevelCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        onSubmit={handleCreateSubmit}
        formId="priority-level-create-form"
        isSaving={createPriorityLevelMutation.isPending}
        saveError={createPriorityLevelMutation.isError}
        form={priorityLevelForm}
        setForm={setPriorityLevelForm}
      />

      <PriorityLevelListModal
        isOpen={listModal.isOpen}
        onClose={listModal.close}
        priorityLevels={priorityLevels}
        isLoading={priorityLevelsQuery.isLoading}
        isError={priorityLevelsQuery.isError}
      />
    </div>
  )
}

export default AdminPage

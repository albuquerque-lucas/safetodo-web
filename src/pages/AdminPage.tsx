import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AppModal from '../components/AppModal'
import DataTable from '../components/DataTable'
import NewItemButton from '../components/NewItemButton'
import { createPriorityLevel, getPriorityLevels } from '../api/priorityLevels'

type PriorityLevelFormState = {
  level: string
  name: string
  description: string
  is_active: boolean
}

const defaultPriorityLevelForm: PriorityLevelFormState = {
  level: '',
  name: '',
  description: '',
  is_active: true,
}

const AdminPage = () => {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isListOpen, setIsListOpen] = useState(false)
  const [priorityLevelForm, setPriorityLevelForm] =
    useState<PriorityLevelFormState>(defaultPriorityLevelForm)

  const priorityLevelsQuery = useQuery({
    queryKey: ['priority-levels'],
    queryFn: getPriorityLevels,
  })

  const createPriorityLevelMutation = useMutation({
    mutationFn: createPriorityLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priority-levels'] })
      setPriorityLevelForm(defaultPriorityLevelForm)
      setIsCreateOpen(false)
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
              onClick={() => setIsListOpen(true)}
            >
              Visualizar niveis
            </button>
            <NewItemButton
              label="Adicionar nivel"
              onClick={() => setIsCreateOpen(true)}
            />
          </div>
        </div>
      </div>
      <div className="admin-divider" />

      <AppModal
        isOpen={isCreateOpen}
        title="Adicionar nivel de prioridade"
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
              form="priority-level-create-form"
              disabled={createPriorityLevelMutation.isPending}
            >
              {createPriorityLevelMutation.isPending ? 'Salvando...' : 'Criar'}
            </button>
          </>
        }
      >
        <form
          id="priority-level-create-form"
          onSubmit={handleCreateSubmit}
        >
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Nivel</label>
              <input
                className="form-control"
                type="number"
                min="1"
                value={priorityLevelForm.level}
                onChange={(event) =>
                  setPriorityLevelForm({
                    ...priorityLevelForm,
                    level: event.target.value,
                  })
                }
                required
              />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                value={priorityLevelForm.name}
                onChange={(event) =>
                  setPriorityLevelForm({
                    ...priorityLevelForm,
                    name: event.target.value,
                  })
                }
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Descricao</label>
              <input
                className="form-control"
                value={priorityLevelForm.description}
                onChange={(event) =>
                  setPriorityLevelForm({
                    ...priorityLevelForm,
                    description: event.target.value,
                  })
                }
              />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="priority-level-active"
                  checked={priorityLevelForm.is_active}
                  onChange={(event) =>
                    setPriorityLevelForm({
                      ...priorityLevelForm,
                      is_active: event.target.checked,
                    })
                  }
                />
                <label className="form-check-label" htmlFor="priority-level-active">
                  Nivel ativo
                </label>
              </div>
            </div>
          </div>
          {createPriorityLevelMutation.isError ? (
            <div className="text-danger mt-3">
              Erro ao criar nivel de prioridade.
            </div>
          ) : null}
        </form>
      </AppModal>

      <AppModal
        isOpen={isListOpen}
        title="Niveis de prioridade"
        onClose={() => setIsListOpen(false)}
      >
        {priorityLevelsQuery.isLoading ? (
          <div className="text-muted">Carregando niveis...</div>
        ) : priorityLevelsQuery.isError ? (
          <div className="text-danger">Erro ao carregar niveis.</div>
        ) : (
          <DataTable
            columns={[
              { header: 'Nivel', render: (level) => level.level },
              { header: 'Nome', render: (level) => level.name },
              {
                header: 'Descricao',
                render: (level) => level.description || '-',
              },
              {
                header: 'Ativo',
                render: (level) => (level.is_active ? 'Sim' : 'Nao'),
              },
            ]}
            data={priorityLevels}
            emptyMessage="Nenhum nivel encontrado."
            rowKey={(level) => level.id}
          />
        )}
      </AppModal>
    </div>
  )
}

export default AdminPage

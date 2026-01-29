import type { Dispatch, SetStateAction } from 'react'
import AppModal from '../AppModal'
import type { PriorityLevelFormState } from '../../types/priorityLevels'

type PriorityLevelCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
  saveError: boolean
  formId: string
  form: PriorityLevelFormState
  setForm: Dispatch<SetStateAction<PriorityLevelFormState>>
}

const PriorityLevelCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  saveError,
  formId,
  form,
  setForm,
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
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Nivel</label>
          <input
            className="form-control"
            type="number"
            min="1"
            value={form.level}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                level: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="col-12 col-md-8">
          <label className="form-label">Nome</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="col-12">
          <label className="form-label">Descricao</label>
          <input
            className="form-control"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="priority-level-active"
              checked={form.is_active}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <label className="form-check-label" htmlFor="priority-level-active">
              Nivel ativo
            </label>
          </div>
        </div>
      </div>
      {saveError ? (
        <div className="text-danger mt-3">
          Erro ao criar nivel de prioridade.
        </div>
      ) : null}
    </form>
  </AppModal>
)

export default PriorityLevelCreateModal

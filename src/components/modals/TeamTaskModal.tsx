import type { Dispatch, SetStateAction } from 'react'
import AppModal from '../AppModal'
import type { TeamTaskFormState } from '../../types/teams'
import type { PriorityLevel } from '../../types/api'

type TeamTaskModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSaving: boolean
  saveError: boolean
  formId: string
  form: TeamTaskFormState
  setForm: Dispatch<SetStateAction<TeamTaskFormState>>
  priorityLevels: PriorityLevel[]
  isPriorityLoading: boolean
  userChoices: { id: number; name: string }[]
  isUserChoicesLoading: boolean
}

const TeamTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  saveError,
  formId,
  form,
  setForm,
  priorityLevels,
  isPriorityLoading,
  userChoices,
  isUserChoicesLoading,
}: TeamTaskModalProps) => (
  <AppModal
    isOpen={isOpen}
    title="Criar tarefa da equipe"
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
        <div className="col-12 col-md-6">
          <label className="form-label">Titulo</label>
          <input
            className="form-control"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Prioridade</label>
          <select
            className="form-select"
            value={form.priority_level}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                priority_level: event.target.value,
              }))
            }
            disabled={isPriorityLoading}
          >
            <option value="">
              {isPriorityLoading ? 'Carregando niveis...' : 'Sem prioridade'}
            </option>
            {priorityLevels.map((priorityLevel) => (
              <option key={priorityLevel.id} value={priorityLevel.id}>
                {priorityLevel.level} - {priorityLevel.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Data de vencimento</label>
          <input
            className="form-control"
            type="datetime-local"
            value={form.due_date}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                due_date: event.target.value,
              }))
            }
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Usuario</label>
          <select
            className="form-select"
            value={form.user}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                user: event.target.value,
              }))
            }
            disabled={isUserChoicesLoading}
            required
          >
            <option value="">
              {isUserChoicesLoading
                ? 'Carregando usuarios...'
                : 'Selecione um usuario'}
            </option>
            {userChoices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Descricao</label>
          <textarea
            className="form-control task-description-input"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={3}
          />
        </div>
      </div>
      {saveError ? (
        <div className="text-danger mt-3">Erro ao criar tarefa.</div>
      ) : null}
    </form>
  </AppModal>
)

export default TeamTaskModal

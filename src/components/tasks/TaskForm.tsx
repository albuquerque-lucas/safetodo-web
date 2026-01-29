import type { Dispatch, SetStateAction } from 'react'
import type { PriorityLevel, TaskStatus } from '../../types/api'
import type { TaskCreateFormState, TaskEditFormState } from '../../types/tasks'

type StatusOption = { value: TaskStatus; label: string }

type TaskFormProps<T extends TaskCreateFormState | TaskEditFormState> = {
  mode: T extends TaskEditFormState ? 'edit' : 'create'
  form: T
  setForm: Dispatch<SetStateAction<T>>
  priorityLevels: PriorityLevel[]
  isPriorityLoading: boolean
  teams: { id: number; name: string }[]
  isTeamsLoading: boolean
  userChoices: { id: number; name: string }[]
  isUserChoicesLoading: boolean
  statusOptions: StatusOption[]
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  formId: string
}

const TaskForm = <T extends TaskCreateFormState | TaskEditFormState>({
  mode,
  form,
  setForm,
  priorityLevels,
  isPriorityLoading,
  teams,
  isTeamsLoading,
  userChoices,
  isUserChoicesLoading,
  statusOptions,
  onSubmit,
  formId,
}: TaskFormProps<T>) => {
  const isEdit = mode === 'edit'
  const statusValue = isEdit ? (form as TaskEditFormState).status : 'pending'

  const updateField = <K extends keyof TaskCreateFormState>(
    key: K,
    value: TaskCreateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleStatusChange = (value: TaskStatus) => {
    if (!isEdit) {
      return
    }
    const setEditForm = setForm as Dispatch<SetStateAction<TaskEditFormState>>
    setEditForm((prev) => ({ ...prev, status: value }))
  }

  return (
    <form id={formId} onSubmit={onSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label fw-semibold">Titulo</label>
          <input
            className="form-control"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />
        </div>
        {isEdit ? (
          <div className="col-6 col-md-4">
            <label className="form-label fw-semibold">Status</label>
            <select
              className="form-select"
              value={statusValue}
              onChange={(event) =>
                handleStatusChange(event.target.value as TaskStatus)
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="col-6 col-md-4">
          <label className="form-label fw-semibold">Prioridade</label>
          <select
            className="form-select"
            value={form.priority_level}
            onChange={(event) =>
              updateField('priority_level', event.target.value)
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
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold">Equipe</label>
          <select
            className="form-select"
            value={form.team}
            onChange={(event) => {
              updateField('team', event.target.value)
              updateField('user', '')
            }}
            required
          >
            <option value="">
              {isTeamsLoading ? 'Carregando equipes...' : 'Selecione uma equipe'}
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold">Data de vencimento</label>
          <input
            className="form-control"
            type="datetime-local"
            value={form.due_date}
            onChange={(event) => updateField('due_date', event.target.value)}
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold">Usuario</label>
          <select
            className="form-select"
            value={form.user}
            onChange={(event) => updateField('user', event.target.value)}
            disabled={!form.team || isUserChoicesLoading}
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
          <label className="form-label fw-semibold">Descricao</label>
          <textarea
            className="form-control task-description-input"
            value={form.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
            rows={4}
          />
        </div>
      </div>
    </form>
  )
}

export default TaskForm

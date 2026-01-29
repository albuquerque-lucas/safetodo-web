import AppModal from '../AppModal'
import TaskForm from '../tasks/TaskForm'
import type { PriorityLevel } from '../../types/api'
import type { TaskCreateFormState } from '../../types/tasks'
import { statusOptions } from '../../utils/taskUtils'

type TaskCreateModalProps = {
  isOpen: boolean
  createForm: TaskCreateFormState
  setCreateForm: React.Dispatch<React.SetStateAction<TaskCreateFormState>>
  priorityLevels: PriorityLevel[]
  isPriorityLoading: boolean
  teams: { id: number; name: string }[]
  isTeamsLoading: boolean
  userChoices: { id: number; name: string }[]
  isUserChoicesLoading: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  isSaving: boolean
  saveError: boolean
}

const TaskCreateModal = ({
  isOpen,
  createForm,
  setCreateForm,
  priorityLevels,
  isPriorityLoading,
  teams,
  isTeamsLoading,
  userChoices,
  isUserChoicesLoading,
  onSubmit,
  onClose,
  isSaving,
  saveError,
}: TaskCreateModalProps) => (
  <AppModal
    isOpen={isOpen}
    title="Criar tarefa"
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
          form="task-create-form"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Criar'}
        </button>
      </>
    }
  >
    <TaskForm
      mode="create"
      form={createForm}
      setForm={setCreateForm}
      priorityLevels={priorityLevels}
      isPriorityLoading={isPriorityLoading}
      teams={teams}
      isTeamsLoading={isTeamsLoading}
      userChoices={userChoices}
      isUserChoicesLoading={isUserChoicesLoading}
      statusOptions={statusOptions}
      onSubmit={onSubmit}
      formId="task-create-form"
    />
    {saveError ? (
      <div className="text-danger mt-3">Erro ao criar tarefa.</div>
    ) : null}
  </AppModal>
)

export default TaskCreateModal

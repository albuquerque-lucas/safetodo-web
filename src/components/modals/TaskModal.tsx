import AppModal from '../AppModal'
import TaskDetails from '../tasks/TaskDetails'
import TaskForm from '../tasks/TaskForm'
import type { TaskEditFormState } from '../../types/tasks'
import type { PriorityLevel, Task } from '../../types/api'
import { statusOptions } from '../../utils/taskUtils'

type TaskModalProps = {
  isOpen: boolean
  mode: 'view' | 'edit'
  task?: Task
  isLoading: boolean
  isError: boolean
  editForm: TaskEditFormState
  setEditForm: React.Dispatch<React.SetStateAction<TaskEditFormState>>
  priorityLevels: PriorityLevel[]
  isPriorityLoading: boolean
  teams: { id: number; name: string }[]
  isTeamsLoading: boolean
  userChoices: { id: number; name: string }[]
  isUserChoicesLoading: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onEdit: () => void
  onCancelEdit: () => void
  isSaving: boolean
  saveError: boolean
}

const TaskModal = ({
  isOpen,
  mode,
  task,
  isLoading,
  isError,
  editForm,
  setEditForm,
  priorityLevels,
  isPriorityLoading,
  teams,
  isTeamsLoading,
  userChoices,
  isUserChoicesLoading,
  onSubmit,
  onClose,
  onEdit,
  onCancelEdit,
  isSaving,
  saveError,
}: TaskModalProps) => (
  <AppModal
    isOpen={isOpen}
    title={mode === 'view' ? 'Detalhes da tarefa' : 'Editar tarefa'}
    onClose={onClose}
    footer={
      mode === 'edit' ? (
        <>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancelEdit}
          >
            Cancelar edicao
          </button>
          <button
            type="submit"
            className="btn btn-dark"
            form="task-edit-form"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-dark"
            onClick={onEdit}
            disabled={isLoading || !task}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </>
      )
    }
  >
    {isLoading ? (
      <div className="text-muted">Carregando detalhes...</div>
    ) : isError ? (
      <div className="text-danger">Erro ao carregar tarefa.</div>
    ) : mode === 'view' && task ? (
      <TaskDetails task={task} />
    ) : (
      <>
        <TaskForm
          mode="edit"
          form={editForm}
          setForm={setEditForm}
          priorityLevels={priorityLevels}
          isPriorityLoading={isPriorityLoading}
          teams={teams}
          isTeamsLoading={isTeamsLoading}
          userChoices={userChoices}
          isUserChoicesLoading={isUserChoicesLoading}
          statusOptions={statusOptions}
          onSubmit={onSubmit}
          formId="task-edit-form"
        />
        {saveError ? (
          <div className="text-danger mt-3">Erro ao salvar tarefa.</div>
        ) : null}
      </>
    )}
  </AppModal>
)

export default TaskModal

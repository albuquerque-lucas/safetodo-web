import type { Task } from '../../types/api'
import TaskStatusBadge from '../TaskStatusBadge'
import { formatDate } from '../../utils/taskUtils'

type TaskDetailsProps = {
  task: Task
}

const TaskDetails = ({ task }: TaskDetailsProps) => (
  <div className="task-details">
    <div className="task-details-row">
      <span className="task-details-label">Titulo</span>
      <span className="task-details-value">{task.title}</span>
    </div>
    <div className="task-details-row">
      <span className="task-details-label">Status</span>
      <TaskStatusBadge status={task.status} dueDate={task.due_date} />
    </div>
    <div className="task-details-row">
      <span className="task-details-label">Usuario</span>
      <span className="task-details-value">{task.user_display}</span>
    </div>
    <div className="task-details-row">
      <span className="task-details-label">Equipe</span>
      <span className="task-details-value">{task.team_display ?? '-'}</span>
    </div>
    <div className="task-details-row">
      <span className="task-details-label">Prioridade</span>
      <span className="task-details-value">
        {task.priority_level_display ?? '-'}
      </span>
    </div>
    <div className="task-details-row">
      <span className="task-details-label">Vencimento</span>
      <span className="task-details-value">{formatDate(task.due_date)}</span>
    </div>
    <div className="task-details-row task-details-row--full">
      <span className="task-details-label">Descricao</span>
      <div className="task-details-value task-details-description">
        {task.description?.trim() || '-'}
      </div>
    </div>
  </div>
)

export default TaskDetails

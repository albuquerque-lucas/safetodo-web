import type { TaskStatus } from '../types/api'
import { getTaskStatusLabel, isTaskOverdue } from '../utils/taskStatus'

type TaskStatusBadgeProps = {
  status: TaskStatus
  dueDate?: string | null
  className?: string
}

const TaskStatusBadge = ({
  status,
  dueDate,
  className,
}: TaskStatusBadgeProps) => {
  const overdue = isTaskOverdue(dueDate, status)

  return (
    <span className={`task-status ${className ?? ''}`.trim()}>
      <span className={`task-status-dot status-${status}`} />
      {getTaskStatusLabel(status)}
      {overdue ? <span className="task-status-overdue">Em atraso</span> : null}
    </span>
  )
}

export default TaskStatusBadge

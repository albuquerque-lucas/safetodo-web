import type { TaskStatus } from '../types/api'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em progresso',
  completed: 'Concluida',
  cancelled: 'Cancelada',
}

export const getTaskStatusLabel = (status: TaskStatus) =>
  STATUS_LABELS[status] ?? status

export const isTaskOverdue = (
  dueDate?: string | null,
  status?: TaskStatus
) => {
  if (!dueDate) {
    return false
  }
  if (status === 'completed' || status === 'cancelled') {
    return false
  }
  const parsed = new Date(dueDate)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }
  return parsed.getTime() < Date.now()
}

import type { TaskStatus } from './api'

export type TaskCreateFormState = {
  title: string
  description: string
  priority_level: string
  due_date: string
  user: string
  team: string
}

export type TaskEditFormState = TaskCreateFormState & {
  status: TaskStatus
}

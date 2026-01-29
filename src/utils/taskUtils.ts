import type { TaskStatus } from '../types/api'
import type { TaskCreateFormState, TaskEditFormState } from '../types/tasks'
import { STATUS_LABELS } from './taskStatus'

export const defaultCreateForm: TaskCreateFormState = {
  title: '',
  description: '',
  priority_level: '',
  due_date: '',
  user: '',
  team: '',
}

export const defaultEditForm: TaskEditFormState = {
  ...defaultCreateForm,
  status: 'created',
}

export const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'created', label: STATUS_LABELS.created },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
]

export const toNumberOrUndefined = (value: string) =>
  value.trim() ? Number(value) : undefined

export const toIsoOrNull = (value: string) =>
  value.trim() ? new Date(value).toISOString() : null

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-'

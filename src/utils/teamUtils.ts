import type {
  TeamCreateFormState,
  TeamEditFormState,
  TeamTaskFormState,
} from '../types/teams'

export const defaultCreateForm: TeamCreateFormState = {
  name: '',
  description: '',
  members: [],
  managers: [],
}

export const defaultEditForm: TeamEditFormState = {
  name: '',
  description: '',
  members: [],
  managers: [],
}

export const defaultTeamTaskForm: TeamTaskFormState = {
  title: '',
  description: '',
  priority_level: '',
  due_date: '',
  user: '',
}

export const toNumberOrUndefined = (value: string) =>
  value.trim() ? Number(value) : undefined

export const toIsoOrNull = (value: string) =>
  value.trim() ? new Date(value).toISOString() : null

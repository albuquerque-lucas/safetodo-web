export type TeamCreateFormState = {
  name: string
  description: string
  members: number[]
  managers: number[]
}

export type TeamEditFormState = TeamCreateFormState

export type TeamTaskFormState = {
  title: string
  description: string
  priority_level: string
  due_date: string
  user: string
}

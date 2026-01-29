export type Timestamp = string

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type PriorityLevel = {
  id: number
  level: number
  name: string
  description: string | null
  is_active: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

export type User = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string | null
  phone: string | null
  notifications_last_seen_at?: Timestamp | null
  date_joined?: Timestamp
  last_login?: Timestamp | null
}

export type AuditLog = {
  id: number
  user: number
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, unknown>
  timestamp: Timestamp
  ip: string | null
  user_agent: string
}

export type Notification = {
  id: number
  recipient: number
  actor: number | null
  type: string
  payload: Record<string, unknown>
  created_at: Timestamp
  read_at: Timestamp | null
}

export type Task = {
  id: number
  user: number
  user_display: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: Timestamp | null
  priority_level: number | null
  priority_level_display: string | null
  team?: number | null
  team_display?: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export type TeamMemberDisplay = {
  id: number
  name: string
}

export type Team = {
  id: number
  name: string
  description: string | null
  members: number[]
  managers: number[]
  members_display?: TeamMemberDisplay[]
  managers_display?: TeamMemberDisplay[]
}

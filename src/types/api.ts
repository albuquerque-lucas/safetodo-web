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
  date_joined?: Timestamp
  last_login?: Timestamp | null
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
  created_at: Timestamp
  updated_at: Timestamp
}

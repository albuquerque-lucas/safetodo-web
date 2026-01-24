export type Timestamp = string

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

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
  priority: number
  created_at: Timestamp
  updated_at: Timestamp
}

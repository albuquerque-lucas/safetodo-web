import type { Task, TaskStatus } from '../types/api'
import apiClient from '../lib/apiClient'

export type TaskCreateInput = {
  user?: number
  team?: number | null
  title: string
  description?: string | null
  due_date?: string | null
  priority_level?: number | null
}

export type TaskUpdateInput = Partial<TaskCreateInput> & {
  status?: TaskStatus
}

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type TaskFilters = {
  page?: number
  pageSize?: number
}

export const getTasks = async (filters: TaskFilters = {}) => {
  const searchParams = new URLSearchParams()
  if (filters.page) {
    searchParams.set('page', String(filters.page))
  }
  if (filters.pageSize) {
    searchParams.set('page_size', String(filters.pageSize))
  }
  const query = searchParams.toString()
  const { data } = await apiClient.get<PaginatedResponse<Task>>(
    `/tasks/${query ? `?${query}` : ''}`,
  )
  return data
}

export const getTask = async (id: number) => {
  const { data } = await apiClient.get<Task>(`/tasks/${id}/`)
  return data
}

export const createTask = async (payload: TaskCreateInput) => {
  const { data } = await apiClient.post<Task>('/tasks/', payload)
  return data
}

export const updateTask = async (id: number, payload: TaskUpdateInput) => {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/`, payload)
  return data
}

export const deleteTask = async (id: number) => {
  await apiClient.delete(`/tasks/${id}/`)
}

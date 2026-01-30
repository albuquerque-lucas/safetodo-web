import apiClient from '../lib/apiClient'
import type { Team, Task, User } from '../types/api'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type TeamCreateInput = {
  name: string
  description?: string | null
  members?: number[]
  managers?: number[]
}

export type TeamUpdateInput = Partial<TeamCreateInput>

export type TeamFilters = {
  page?: number
  pageSize?: number
  ordering?: string
  search?: string
}

export type TeamMembersFilters = {
  page?: number
  pageSize?: number
  ordering?: string
}

export type TeamTasksFilters = {
  page?: number
  pageSize?: number
  ordering?: string
  search?: string
}

export const getTeams = async (filters: TeamFilters = {}) => {
  const searchParams = new URLSearchParams()
  if (filters.page) {
    searchParams.set('page', String(filters.page))
  }
  if (filters.pageSize) {
    searchParams.set('page_size', String(filters.pageSize))
  }
  if (filters.ordering) {
    searchParams.set('ordering', filters.ordering)
  }
  if (filters.search) {
    searchParams.set('search', filters.search)
  }
  const query = searchParams.toString()
  const { data } = await apiClient.get<PaginatedResponse<Team>>(
    `/teams/${query ? `?${query}` : ''}`,
  )
  return data
}

export const getTeam = async (id: number) => {
  const { data } = await apiClient.get<Team>(`/teams/${id}/`)
  return data
}

export const createTeam = async (payload: TeamCreateInput) => {
  const { data } = await apiClient.post<Team>('/teams/', payload)
  return data
}

export const updateTeam = async (id: number, payload: TeamUpdateInput) => {
  const { data } = await apiClient.patch<Team>(`/teams/${id}/`, payload)
  return data
}

export const deleteTeam = async (id: number) => {
  await apiClient.delete(`/teams/${id}/`)
}

export const getTeamTasks = async (
  id: number,
  filters: TeamTasksFilters = {},
) => {
  const searchParams = new URLSearchParams()
  if (filters.page) {
    searchParams.set('page', String(filters.page))
  }
  if (filters.pageSize) {
    searchParams.set('page_size', String(filters.pageSize))
  }
  if (filters.ordering) {
    searchParams.set('ordering', filters.ordering)
  }
  if (filters.search) {
    searchParams.set('search', filters.search)
  }
  const query = searchParams.toString()
  const { data } = await apiClient.get<PaginatedResponse<Task>>(
    `/teams/${id}/tasks/${query ? `?${query}` : ''}`,
  )
  return data
}

export const getTeamMembers = async (
  id: number,
  filters: TeamMembersFilters = {},
) => {
  const searchParams = new URLSearchParams()
  if (filters.page) {
    searchParams.set('page', String(filters.page))
  }
  if (filters.pageSize) {
    searchParams.set('page_size', String(filters.pageSize))
  }
  if (filters.ordering) {
    searchParams.set('ordering', filters.ordering)
  }
  const query = searchParams.toString()
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    `/teams/${id}/members/${query ? `?${query}` : ''}`,
  )
  return data
}

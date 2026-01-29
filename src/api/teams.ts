import apiClient from '../lib/apiClient'
import type { Team, Task } from '../types/api'

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
}

export const getTeams = async (filters: TeamFilters = {}) => {
  const searchParams = new URLSearchParams()
  if (filters.page) {
    searchParams.set('page', String(filters.page))
  }
  if (filters.pageSize) {
    searchParams.set('page_size', String(filters.pageSize))
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

export const getTeamTasks = async (id: number, page?: number) => {
  const query = page ? `?page=${page}` : ''
  const { data } = await apiClient.get<PaginatedResponse<Task>>(
    `/teams/${id}/tasks/${query}`,
  )
  return data
}

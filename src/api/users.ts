import apiClient from '../lib/apiClient'
import type { User } from '../types/api'

export type UserCreateInput = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  password: string
  password2: string
  bio?: string | null
  phone?: string | null
}

export type UserUpdateInput = Partial<
  Omit<UserCreateInput, 'password' | 'password2'>
>

export type UserChoice = {
  id: number
  name: string
}

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type UserFilters = {
  page?: number
  pageSize?: number
  ordering?: string
}

export const getUsers = async (filters: UserFilters = {}) => {
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
    `/users/${query ? `?${query}` : ''}`,
  )
  return data
}

export const getUser = async (id: number) => {
  const { data } = await apiClient.get<User>(`/users/${id}/`)
  return data
}

export const getCurrentUser = async () => {
  const { data } = await apiClient.get<User>('/users/me/')
  return data
}

export const markNotificationsSeen = async () => {
  const { data } = await apiClient.post<{ notifications_last_seen_at: string }>(
    '/users/notifications-seen/',
  )
  return data
}

export const createUser = async (payload: UserCreateInput) => {
  const { data } = await apiClient.post<User>('/users/', payload)
  return data
}

export const updateUser = async (id: number, payload: UserUpdateInput) => {
  const { data } = await apiClient.patch<User>(`/users/${id}/`, payload)
  return data
}

export const deleteUser = async (id: number) => {
  await apiClient.delete(`/users/${id}/`)
}

export const getUserChoices = async (params?: {
  teamId?: number
  page?: number
  pageSize?: number
}) => {
  const searchParams = new URLSearchParams()
  if (params?.teamId) {
    searchParams.set('team', String(params.teamId))
  }
  if (params?.page) {
    searchParams.set('page', String(params.page))
  }
  if (params?.pageSize) {
    searchParams.set('page_size', String(params.pageSize))
  }
  const query = searchParams.toString()
  const { data } = await apiClient.get<PaginatedResponse<UserChoice>>(
    `/users/choices/${query ? `?${query}` : ''}`,
  )
  return data
}

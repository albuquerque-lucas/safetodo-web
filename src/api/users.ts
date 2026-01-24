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

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const getUsers = async () => {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/users/')
  return data.results
}

export const getUser = async (id: number) => {
  const { data } = await apiClient.get<User>(`/users/${id}/`)
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

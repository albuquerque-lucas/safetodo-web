import apiClient from '../lib/apiClient'
import type { PriorityLevel } from '../types/api'

export type PriorityLevelCreateInput = {
  level: number
  name: string
  description?: string | null
  is_active?: boolean
}

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const getPriorityLevels = async () => {
  const { data } = await apiClient.get<PaginatedResponse<PriorityLevel>>(
    '/priority-levels/',
  )
  return data.results
}

export const createPriorityLevel = async (payload: PriorityLevelCreateInput) => {
  const { data } = await apiClient.post<PriorityLevel>(
    '/priority-levels/',
    payload,
  )
  return data
}

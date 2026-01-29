import apiClient from '../lib/apiClient'
import type { AuditLog } from '../types/api'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type AuditLogFilters = {
  userId?: number
  action?: string
  entityType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  ordering?: string
}

export const getAuditLogs = async (filters: AuditLogFilters = {}) => {
  const searchParams = new URLSearchParams()
  if (filters.userId) {
    searchParams.set('user', String(filters.userId))
  }
  if (filters.action) {
    searchParams.set('action', filters.action)
  }
  if (filters.entityType) {
    searchParams.set('entity_type', filters.entityType)
  }
  if (filters.dateFrom) {
    searchParams.set('date_from', filters.dateFrom)
  }
  if (filters.dateTo) {
    searchParams.set('date_to', filters.dateTo)
  }
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
  const { data } = await apiClient.get<PaginatedResponse<AuditLog>>(
    `/audit-logs/${query ? `?${query}` : ''}`,
  )
  return data
}

export const deleteAuditLog = async (id: number) => {
  await apiClient.delete(`/audit-logs/${id}/`)
}

export const clearAuditLogs = async (params?: { userId?: number }) => {
  const searchParams = new URLSearchParams()
  if (params?.userId) {
    searchParams.set('user', String(params.userId))
  }
  const query = searchParams.toString()
  const { data } = await apiClient.delete(
    `/audit-logs/clear/${query ? `?${query}` : ''}`,
  )
  return data as { deleted: number }
}

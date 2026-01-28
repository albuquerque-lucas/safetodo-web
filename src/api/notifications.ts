import apiClient from '../lib/apiClient'
import type { Notification } from '../types/api'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type NotificationFilters = {
  userId?: number
  unread?: boolean
  type?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export const getNotifications = async (filters: NotificationFilters = {}) => {
  const searchParams = new URLSearchParams()
  if (filters.userId) {
    searchParams.set('user', String(filters.userId))
  }
  if (filters.unread) {
    searchParams.set('unread', '1')
  }
  if (filters.type) {
    searchParams.set('type', filters.type)
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
  const query = searchParams.toString()
  const { data } = await apiClient.get<PaginatedResponse<Notification>>(
    `/notifications/${query ? `?${query}` : ''}`,
  )
  return data
}

export const markNotificationRead = async (id: number) => {
  const { data } = await apiClient.post<Notification>(
    `/notifications/${id}/read/`,
  )
  return data
}

export const markNotificationUnread = async (id: number) => {
  const { data } = await apiClient.post<Notification>(
    `/notifications/${id}/unread/`,
  )
  return data
}

export const deleteNotification = async (id: number) => {
  await apiClient.delete(`/notifications/${id}/`)
}

export const clearNotifications = async (params?: { userId?: number }) => {
  const searchParams = new URLSearchParams()
  if (params?.userId) {
    searchParams.set('user', String(params.userId))
  }
  const query = searchParams.toString()
  const { data } = await apiClient.delete(
    `/notifications/clear/${query ? `?${query}` : ''}`,
  )
  return data as { deleted: number }
}

export const markAllNotificationsRead = async (params?: { userId?: number }) => {
  const searchParams = new URLSearchParams()
  if (params?.userId) {
    searchParams.set('user', String(params.userId))
  }
  const query = searchParams.toString()
  const { data } = await apiClient.post(
    `/notifications/mark-all-read/${query ? `?${query}` : ''}`,
  )
  return data as { updated: number }
}

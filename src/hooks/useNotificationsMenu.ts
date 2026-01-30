/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead } from '../api/notifications'
import { getCurrentUser, markNotificationsSeen } from '../api/users'
import useNotificationsSocket from './useNotificationsSocket'
import useAuthToken from './useAuthToken'

type UseNotificationsMenuOptions = {
  isAdmin: boolean
  viewerId?: number
}

const useNotificationsMenu = ({ isAdmin, viewerId }: UseNotificationsMenuOptions) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [menuClearedAt, setMenuClearedAt] = useState<number | null>(null)
  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null)
  const authToken = useAuthToken()
  const isAuthenticated = !!authToken
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useNotificationsSocket({
    enabled: isAuthenticated,
    token: authToken,
  })

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'menu'],
    queryFn: () =>
      getNotifications({
        pageSize: 10,
        page: 1,
        userId: isAdmin ? viewerId : undefined,
      }),
    enabled: isOpen && isAuthenticated,
  })

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread', 'menu'],
    queryFn: () =>
      getNotifications({
        unread: true,
        pageSize: 1,
        page: 1,
        userId: isAdmin ? viewerId : undefined,
      }),
    enabled: isAuthenticated,
  })

  const currentUserQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  })

  const unseenCountQuery = useQuery({
    queryKey: ['notifications', 'unseen', lastSeenAt ?? 'all', viewerId],
    queryFn: () =>
      getNotifications({
        pageSize: 1,
        page: 1,
        dateFrom: lastSeenAt ? new Date(lastSeenAt + 1).toISOString() : undefined,
        userId: isAdmin ? viewerId : undefined,
      }),
    enabled: isAuthenticated,
  })

  const clearedStorageKey = viewerId
    ? `notifications:menuClearedAt:${viewerId}`
    : 'notifications:menuClearedAt'

  useEffect(() => {
    if (!isAuthenticated) {
      setLastSeenAt(null)
      setShowBadge(false)
      setMenuClearedAt(null)
      return
    }
    const storedCleared = localStorage.getItem(clearedStorageKey)
    const parsedCleared = storedCleared ? Number(storedCleared) : null
    setMenuClearedAt(Number.isNaN(parsedCleared as number) ? null : parsedCleared)
  }, [isAuthenticated, clearedStorageKey])

  useEffect(() => {
    const lastSeenValue = currentUserQuery.data?.notifications_last_seen_at
    if (!lastSeenValue) {
      setLastSeenAt(null)
      return
    }
    const parsed = new Date(lastSeenValue).getTime()
    setLastSeenAt(Number.isNaN(parsed) ? null : parsed)
  }, [currentUserQuery.data?.notifications_last_seen_at])

  useEffect(() => {
    if (!isAuthenticated || isOpen) {
      setShowBadge(false)
      return
    }
    const unseenCount = unseenCountQuery.data?.count ?? 0
    setShowBadge(unseenCount > 0)
  }, [isAuthenticated, isOpen, unseenCountQuery.data?.count])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (isAuthenticated) {
      const now = Date.now()
      setLastSeenAt(now)
      markNotificationsSeen()
        .then((response) => {
          const parsed = new Date(response.notifications_last_seen_at).getTime()
          if (!Number.isNaN(parsed)) {
            setLastSeenAt(parsed)
            queryClient.setQueryData(['current-user'], (prev) =>
              prev && typeof prev === 'object'
                ? {
                    ...(prev as Record<string, unknown>),
                    notifications_last_seen_at: response.notifications_last_seen_at,
                  }
                : prev,
            )
          }
        })
        .finally(() => {
          queryClient.invalidateQueries({
            queryKey: ['notifications', 'unseen'],
            exact: false,
          })
        })
    }
    if (notificationsQuery.refetch) {
      notificationsQuery.refetch()
    }
    if (unreadCountQuery.refetch) {
      unreadCountQuery.refetch()
    }
  }, [isOpen, isAuthenticated, notificationsQuery, unreadCountQuery, queryClient])

  const menuNotifications = useMemo(() => {
    const items = notificationsQuery.data?.results ?? []
    if (!menuClearedAt) {
      return items
    }
    return items.filter((item) => {
      if (!item.created_at) {
        return false
      }
      const createdAt = new Date(item.created_at).getTime()
      if (Number.isNaN(createdAt)) {
        return false
      }
      return createdAt > menuClearedAt
    })
  }, [notificationsQuery.data, menuClearedAt])

  const handleNotificationClick = async (notificationId: number) => {
    const notification = notificationsQuery.data?.results.find(
      (item) => item.id === notificationId,
    )
    if (!notification) {
      return
    }
    if (!notification.read_at) {
      await markNotificationRead(notificationId)
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    }
    const payload = notification.payload
    const taskId = payload?.['task_id']
    const teamId = payload?.['team_id']
    if (taskId) {
      navigate('/app/tasks')
    } else if (teamId) {
      navigate('/app/teams')
    }
    setIsOpen(false)
  }

  const handleClearNotifications = () => {
    const now = Date.now()
    setMenuClearedAt(now)
    localStorage.setItem(clearedStorageKey, String(now))
    if (isAuthenticated) {
      setLastSeenAt(now)
      markNotificationsSeen()
        .then((response) => {
          const parsed = new Date(response.notifications_last_seen_at).getTime()
          if (!Number.isNaN(parsed)) {
            setLastSeenAt(parsed)
            queryClient.setQueryData(['current-user'], (prev) =>
              prev && typeof prev === 'object'
                ? {
                    ...(prev as Record<string, unknown>),
                    notifications_last_seen_at: response.notifications_last_seen_at,
                  }
                : prev,
            )
          }
        })
        .finally(() => {
          queryClient.invalidateQueries({
            queryKey: ['notifications', 'unseen'],
            exact: false,
          })
        })
    }
    setShowBadge(false)
  }

  const handleViewAll = () => {
    navigate('/app/profile?tab=notifications')
    setIsOpen(false)
  }

  return {
    isOpen,
    setIsOpen,
    showBadge,
    badgeCount: unseenCountQuery.data?.count ?? 0,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    menuNotifications,
    handleNotificationClick,
    handleClearNotifications,
    handleViewAll,
  }
}

export default useNotificationsMenu

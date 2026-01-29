import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { clearAuditLogs, deleteAuditLog, getAuditLogs } from '../api/auditLogs'
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '../api/notifications'
import { getCurrentUser, getUser } from '../api/users'
import useUserProfilePermissions from './useUserProfilePermissions'
import useUserProfileTabs from './useUserProfileTabs'
import { confirmDeletion } from '../utils/swalMessages'
import { getAvatarInitials, getDisplayName } from '../utils/profileUtils'

const useUserProfileController = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { userId } = useParams()
  const parsedUserId = userId ? Number(userId) : null
  const isValidUserId = parsedUserId !== null && !Number.isNaN(parsedUserId)

  const profileQuery = useQuery({
    queryKey: ['user-profile', userId ? parsedUserId : 'me'],
    queryFn: () =>
      userId && isValidUserId
        ? getUser(parsedUserId as number)
        : getCurrentUser(),
    enabled: userId ? isValidUserId : true,
  })

  const profileTitle = userId ? 'Perfil do usuario' : 'Meu perfil'

  const displayName = useMemo(() => {
    if (!profileQuery.data) {
      return ''
    }
    return getDisplayName(profileQuery.data)
  }, [profileQuery.data])

  const avatarInitials = useMemo(() => {
    if (!profileQuery.data) {
      return ''
    }
    return getAvatarInitials(profileQuery.data, displayName)
  }, [displayName, profileQuery.data])

  const viewerRole = localStorage.getItem('auth_role') ?? 'usuario'
  const viewerId = localStorage.getItem('auth_user_id') ?? ''
  const profileUserId = profileQuery.data?.id

  const permissions = useUserProfilePermissions({
    viewerRole,
    viewerId,
    profileUserId,
  })

  const { activeTab, setActiveTab } = useUserProfileTabs({
    canViewLogsTab: permissions.canViewLogsTab,
    canViewNotificationsTab: permissions.canViewNotificationsTab,
  })

  const [logPage, setLogPage] = useState(1)
  const [notificationPage, setNotificationPage] = useState(1)

  useEffect(() => {
    setLogPage(1)
  }, [profileUserId, activeTab])

  useEffect(() => {
    setNotificationPage(1)
  }, [profileUserId, activeTab])

  const logsQuery = useQuery({
    queryKey: ['audit-logs', profileUserId, logPage, permissions.isAdmin],
    queryFn: () =>
      getAuditLogs({
        userId: permissions.isAdmin ? profileUserId : undefined,
        page: logPage,
      }),
    enabled: permissions.canViewLogsTab && activeTab === 'logs' && !!profileUserId,
  })

  const logsErrorStatus = (logsQuery.error as { response?: { status?: number } })
    ?.response?.status

  useEffect(() => {
    if (activeTab === 'logs' && permissions.canViewLogsTab && logsQuery.refetch) {
      logsQuery.refetch()
    }
  }, [activeTab, logPage, logsQuery, permissions.canViewLogsTab])

  const notificationsQuery = useQuery({
    queryKey: [
      'notifications',
      profileUserId,
      notificationPage,
      permissions.isAdmin,
    ],
    queryFn: () =>
      getNotifications({
        userId: permissions.isAdmin ? profileUserId : undefined,
        page: notificationPage,
      }),
    enabled:
      permissions.canViewNotificationsTab &&
      activeTab === 'notifications' &&
      !!profileUserId,
  })

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread', profileUserId, permissions.isAdmin],
    queryFn: () =>
      getNotifications({
        userId: permissions.isAdmin ? profileUserId : undefined,
        unread: true,
        page: 1,
      }),
    enabled: permissions.canViewNotificationsTab && !!profileUserId,
  })

  useEffect(() => {
    if (
      activeTab === 'notifications' &&
      permissions.canViewNotificationsTab &&
      notificationsQuery.refetch
    ) {
      notificationsQuery.refetch()
    }
  }, [
    activeTab,
    notificationPage,
    notificationsQuery,
    permissions.canViewNotificationsTab,
  ])

  const deleteMutation = useMutation({
    mutationFn: deleteAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: (targetUserId?: number) => clearAuditLogs({ userId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const markUnreadMutation = useMutation({
    mutationFn: markNotificationUnread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const clearNotificationsMutation = useMutation({
    mutationFn: (targetUserId?: number) =>
      clearNotifications({ userId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: (targetUserId?: number) =>
      markAllNotificationsRead({ userId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const handleDeleteLog = async (logId: number) => {
    const confirmed = await confirmDeletion('Esse log sera removido.')
    if (confirmed) {
      deleteMutation.mutate(logId)
    }
  }

  const handleClearLogs = async () => {
    const confirmed = await confirmDeletion('Todos os logs serao removidos.')
    if (confirmed && profileUserId) {
      clearMutation.mutate(profileUserId)
    }
  }

  const handleNotificationClick = async (notificationId: number) => {
    const notification = notificationsQuery.data?.results.find(
      (item) => item.id === notificationId,
    )
    if (!notification) {
      return
    }
    if (!notification.read_at) {
      markReadMutation.mutate(notificationId)
    }
    const payload = notification.payload
    const taskId = payload?.['task_id']
    const teamId = payload?.['team_id']
    if (taskId) {
      navigate('/app/tasks')
      return
    }
    if (teamId) {
      navigate('/app/teams')
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    const confirmed = await confirmDeletion('Essa notificacao sera removida.')
    if (confirmed) {
      deleteNotificationMutation.mutate(notificationId)
    }
  }

  const handleClearNotifications = async () => {
    const confirmed = await confirmDeletion(
      'Todas as notificacoes serao removidas.',
    )
    if (confirmed) {
      clearNotificationsMutation.mutate(
        viewerRole === 'super_admin' ? profileUserId : undefined,
      )
    }
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(
      viewerRole === 'super_admin' ? profileUserId : undefined,
    )
  }

  return {
    userId,
    isValidUserId,
    profileTitle,
    profileQuery,
    displayName,
    avatarInitials,
    viewerRole,
    viewerId,
    profileUserId,
    permissions,
    activeTab,
    setActiveTab,
    logPage,
    setLogPage,
    notificationPage,
    setNotificationPage,
    logsQuery,
    logsErrorStatus,
    notificationsQuery,
    unreadCountQuery,
    deleteMutation,
    clearMutation,
    markReadMutation,
    markUnreadMutation,
    deleteNotificationMutation,
    clearNotificationsMutation,
    markAllReadMutation,
    handleDeleteLog,
    handleClearLogs,
    handleNotificationClick,
    handleDeleteNotification,
    handleClearNotifications,
    handleMarkAllRead,
  }
}

export default useUserProfileController

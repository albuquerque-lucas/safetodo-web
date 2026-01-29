import type { Notification } from '../types/api'

const canViewLogs = (role: string, isOwnProfile: boolean) =>
  role === 'super_admin' || role === 'company_admin' || isOwnProfile

const canDeleteLogs = (role: string) => role === 'super_admin'

const canClearLogs = (role: string) => role === 'super_admin'

const canViewNotifications = (role: string, isOwnProfile: boolean) =>
  role === 'super_admin' || role === 'company_admin' || isOwnProfile

type Params = {
  viewerRole: string
  viewerId: string
  profileUserId?: number
}

const useUserProfilePermissions = ({
  viewerRole,
  viewerId,
  profileUserId,
}: Params) => {
  const isOwnProfile =
    profileUserId !== undefined && String(profileUserId) === viewerId
  const isAdmin = viewerRole === 'super_admin' || viewerRole === 'company_admin'
  const canViewLogsTab = canViewLogs(viewerRole, isOwnProfile)
  const canDeleteLogsItems = canDeleteLogs(viewerRole)
  const canClearLogsItems = canClearLogs(viewerRole)
  const canViewNotificationsTab = canViewNotifications(viewerRole, isOwnProfile)
  const canDeleteNotificationItem = (notification: Notification) =>
    viewerRole === 'super_admin' || String(notification.recipient) === viewerId

  return {
    isOwnProfile,
    isAdmin,
    canViewLogsTab,
    canDeleteLogsItems,
    canClearLogsItems,
    canViewNotificationsTab,
    canDeleteNotificationItem,
  }
}

export default useUserProfilePermissions

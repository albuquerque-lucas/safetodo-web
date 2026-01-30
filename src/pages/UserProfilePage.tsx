import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileLogsTab from '../components/profile/ProfileLogsTab'
import ProfileNotificationsTab from '../components/profile/ProfileNotificationsTab'
import ProfileTab from '../components/profile/ProfileTab'
import ProfileTabs from '../components/profile/ProfileTabs'
import useUserProfileController from '../hooks/useUserProfileController'

const UserProfilePage = () => {
  const {
    userId,
    isValidUserId,
    profileTitle,
    profileQuery,
    displayName,
    avatarInitials,
    permissions,
    activeTab,
    setActiveTab,
    setLogPage,
    setNotificationPage,
    logPage,
    notificationPage,
    logPageSize,
    notificationPageSize,
    logSortBy,
    logSortDir,
    toggleLogSort,
    logSearchInput,
    setLogSearchInput,
    logSearch,
    notificationSortBy,
    notificationSortDir,
    toggleNotificationSort,
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
  } = useUserProfileController()

  if (userId && !isValidUserId) {
    return (
      <div className="page-card">
        <h1 className="h3 mb-2">Perfil do usuario</h1>
        <p className="text-danger mb-0">ID do usuario invalido.</p>
      </div>
    )
  }

  return (
    <div className="page-card profile-page">
      <ProfileHeader title={profileTitle} showBack={!!userId} />

      {profileQuery.isLoading ? (
        <div className="text-muted">Carregando perfil...</div>
      ) : profileQuery.isError ? (
        <div className="text-danger">Erro ao carregar perfil.</div>
      ) : profileQuery.data ? (
        <>
          <ProfileTabs
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            canViewLogsTab={permissions.canViewLogsTab}
            canViewNotificationsTab={permissions.canViewNotificationsTab}
            unreadCount={unreadCountQuery.data?.count}
          />

          {activeTab === 'profile' ? (
            <ProfileTab
              profile={profileQuery.data}
              displayName={displayName}
              avatarInitials={avatarInitials}
            />
          ) : activeTab === 'logs' ? (
            <ProfileLogsTab
              logs={logsQuery.data?.results ?? []}
              isLoading={logsQuery.isLoading}
              isError={logsQuery.isError}
              errorStatus={logsErrorStatus}
              canClearLogs={permissions.canClearLogsItems}
              isClearing={clearMutation.isPending}
              isClearDisabled={!profileQuery.data?.id}
              onClear={handleClearLogs}
              canDeleteLogs={permissions.canDeleteLogsItems}
              isDeleting={deleteMutation.isPending}
              onDeleteLog={handleDeleteLog}
              page={logPage}
              pageSize={logPageSize}
              sortBy={logSortBy}
              sortDir={logSortDir}
              onSort={toggleLogSort}
              total={logsQuery.data?.count ?? 0}
              onPageChange={setLogPage}
              showMutationError={deleteMutation.isError || clearMutation.isError}
              searchInput={logSearchInput}
              onSearchChange={setLogSearchInput}
              isSearching={logsQuery.isFetching}
              isSearchActive={!!logSearch}
            />
          ) : (
            <ProfileNotificationsTab
              notifications={notificationsQuery.data?.results ?? []}
              isLoading={notificationsQuery.isLoading}
              isError={notificationsQuery.isError}
              page={notificationPage}
              pageSize={notificationPageSize}
              sortBy={notificationSortBy}
              sortDir={notificationSortDir}
              onSort={toggleNotificationSort}
              total={notificationsQuery.data?.count ?? 0}
              onPageChange={setNotificationPage}
              onMarkAllRead={handleMarkAllRead}
              onClear={handleClearNotifications}
              isMarkingAllRead={markAllReadMutation.isPending}
              isClearing={clearNotificationsMutation.isPending}
              showMutationError={
                deleteNotificationMutation.isError ||
                clearNotificationsMutation.isError
              }
              onNotificationClick={handleNotificationClick}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onMarkUnread={(id) => markUnreadMutation.mutate(id)}
              onDelete={handleDeleteNotification}
              canDeleteItem={permissions.canDeleteNotificationItem}
              isMarkingRead={markReadMutation.isPending}
              isMarkingUnread={markUnreadMutation.isPending}
              isDeleting={deleteNotificationMutation.isPending}
            />
          )}
        </>
      ) : (
        <div className="text-muted">Nenhum dado encontrado.</div>
      )}
    </div>
  )
}

export default UserProfilePage

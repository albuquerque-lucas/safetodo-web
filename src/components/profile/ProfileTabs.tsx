import type { UserProfileTabKey } from '../../hooks/useUserProfileTabs'

type ProfileTabsProps = {
  activeTab: UserProfileTabKey
  onChangeTab: (tab: UserProfileTabKey) => void
  canViewLogsTab: boolean
  canViewNotificationsTab: boolean
  unreadCount?: number
}

const ProfileTabs = ({
  activeTab,
  onChangeTab,
  canViewLogsTab,
  canViewNotificationsTab,
  unreadCount,
}: ProfileTabsProps) => (
  <ul className="nav nav-tabs profile-tabs">
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onChangeTab('profile')}
      >
        Perfil
      </button>
    </li>
    {canViewLogsTab ? (
      <li className="nav-item">
        <button
          type="button"
          className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => onChangeTab('logs')}
        >
          Logs
        </button>
      </li>
    ) : null}
    {canViewNotificationsTab ? (
      <li className="nav-item">
        <button
          type="button"
          className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => onChangeTab('notifications')}
        >
          Notificacoes
          {unreadCount ? (
            <span className="notification-badge">{unreadCount}</span>
          ) : null}
        </button>
      </li>
    ) : null}
  </ul>
)

export default ProfileTabs

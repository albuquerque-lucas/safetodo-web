import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import useLogout from '../../hooks/useLogout'
import useNotificationsMenu from '../../hooks/useNotificationsMenu'
import NotificationsMenu from './NotificationsMenu'
import { getCurrentUser } from '../../api/users'
import { getAvatarInitials, getDisplayName } from '../../utils/profileUtils'

type TopbarProps = {
  title: string
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

const Topbar = ({ title, isSidebarOpen, onToggleSidebar }: TopbarProps) => {
  const location = useLocation()
  const handleLogout = useLogout()
  const role = localStorage.getItem('auth_role')
  const isAdmin = role === 'super_admin' || role === 'company_admin'
  const viewerId = Number(localStorage.getItem('auth_user_id') ?? '')
  const viewerIdParam = Number.isNaN(viewerId) ? undefined : viewerId

  const notificationsMenu = useNotificationsMenu({
    isAdmin,
    viewerId: viewerIdParam,
  })

  const currentUserQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  })

  const currentUser = currentUserQuery.data
  const displayName = currentUser ? getDisplayName(currentUser) : ''
  const avatarInitials = currentUser ? getAvatarInitials(currentUser, displayName) : ''
  const isProfilePage = location.pathname === '/app/profile'

  const toggleNotifications = () => {
    notificationsMenu.setIsOpen((open) => !open)
  }

  const closeNotifications = () => {
    notificationsMenu.setIsOpen(false)
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-toggle"
        aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        onClick={onToggleSidebar}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <Link className="topbar-title" to="/app">
        {title}
      </Link>
      <div className="topbar-actions">
        <Link
          to="/app/profile"
          className="topbar-avatar-button"
          aria-label="Ir para perfil"
          title="Perfil"
        >
          <span
            className={`topbar-avatar ${
              isProfilePage ? 'topbar-avatar--active' : 'topbar-avatar--inactive'
            }`}
            aria-hidden="true"
          >
            {avatarInitials || 'U'}
          </span>
        </Link>
        <NotificationsMenu
          isOpen={notificationsMenu.isOpen}
          onToggle={toggleNotifications}
          onClose={closeNotifications}
          showBadge={notificationsMenu.showBadge}
          badgeCount={notificationsMenu.badgeCount}
          isLoading={notificationsMenu.isLoading}
          isError={notificationsMenu.isError}
          notifications={notificationsMenu.menuNotifications}
          onNotificationClick={notificationsMenu.handleNotificationClick}
          onClear={notificationsMenu.handleClearNotifications}
          onViewAll={notificationsMenu.handleViewAll}
        />
        <button
          type="button"
          className="topbar-logout"
          aria-label="Sair"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>
    </header>
  )
}

export default Topbar

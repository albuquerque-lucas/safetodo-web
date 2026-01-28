import { ReactNode, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import {
  faBars,
  faGear,
  faListCheck,
  faHouse,
  faPeopleGroup,
  faRightFromBracket,
  faUsers,
  faUser,
  faBell
} from '@fortawesome/free-solid-svg-icons'
import apiClient from '../lib/apiClient'
import { getNotifications, markNotificationRead } from '../api/notifications'

type SidebarLayoutProps = {
  title: string
  children?: ReactNode
}

function SidebarLayout({ title, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  const handleLogout = async () => {
    try {
      await apiClient.post('/users/logout/')
    } catch {
      // No-op: logout pode ser apenas client-side
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_username')
      localStorage.removeItem('auth_user_id')
      localStorage.removeItem('auth_role')
      navigate('/', { replace: true })
    }
  }

  const isAdmin = localStorage.getItem('auth_role') === 'super_admin'
  const viewerId = Number(localStorage.getItem('auth_user_id') ?? '')
  const viewerIdParam = Number.isNaN(viewerId) ? undefined : viewerId

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'menu'],
    queryFn: () =>
      getNotifications({ pageSize: 10, page: 1, userId: viewerIdParam }),
    enabled: isNotificationsOpen,
  })

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread', 'menu'],
    queryFn: () =>
      getNotifications({
        unread: true,
        pageSize: 1,
        page: 1,
        userId: viewerIdParam,
      }),
    enabled: true,
  })

  useEffect(() => {
    if (!isNotificationsOpen) {
      return
    }
    if (notificationsQuery.refetch) {
      notificationsQuery.refetch()
    }
    if (unreadCountQuery.refetch) {
      unreadCountQuery.refetch()
    }
  }, [isNotificationsOpen, notificationsQuery, unreadCountQuery])

  useEffect(() => {
    if (!isNotificationsOpen) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsOpen])

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
    setIsNotificationsOpen(false)
  }

  const formatNotificationTitle = (type: string) => {
    if (type === 'task.assigned') {
      return 'Atribuiram uma tarefa a voce'
    }
    if (type === 'team.member_added') {
      return 'Voce foi adicionado a uma equipe'
    }
    return type.replaceAll('.', ' ')
  }

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : '-'

  return (
    <>
      <header className="topbar">
        <button
          type="button"
          className="topbar-toggle"
          aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
          onClick={() => setIsSidebarOpen((open) => !open)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <span className="topbar-title">{title}</span>
        <div className="topbar-actions">
          <div className="topbar-notifications" ref={notificationsRef}>
            <button
              type="button"
              className="topbar-icon-button"
              aria-label="Notificacoes"
              onClick={() => setIsNotificationsOpen((open) => !open)}
            >
              <FontAwesomeIcon icon={faBell} />
              {unreadCountQuery.data?.count ? (
                <span className="notification-badge topbar-badge">
                  {unreadCountQuery.data.count}
                </span>
              ) : null}
            </button>
            {isNotificationsOpen ? (
              <div className="notifications-menu">
                <div className="notifications-menu-header">
                  <span>Notificacoes</span>
                </div>
                <div className="notifications-menu-body">
                  {notificationsQuery.isLoading ? (
                    <div className="text-muted">Carregando...</div>
                  ) : notificationsQuery.isError ? (
                    <div className="text-danger">
                      Erro ao carregar notificacoes.
                    </div>
                  ) : (notificationsQuery.data?.results ?? []).length === 0 ? (
                    <div className="text-muted">Sem notificacoes.</div>
                  ) : (
                    (notificationsQuery.data?.results ?? []).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`notifications-menu-item ${
                          item.read_at ? '' : 'is-unread'
                        }`}
                        onClick={() => handleNotificationClick(item.id)}
                      >
                        <span className="notifications-menu-title">
                          {formatNotificationTitle(item.type)}
                        </span>
                        <span className="notifications-menu-time">
                          {formatDate(item.created_at)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <div className="notifications-menu-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      navigate('/app/profile?tab=notifications')
                      setIsNotificationsOpen(false)
                    }}
                  >
                    Ver todas
                  </button>
                </div>
              </div>
            ) : null}
          </div>
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

      <div className={`app-layout ${isSidebarOpen ? 'is-open' : ''}`}>
        <motion.aside
          className="sidebar"
          aria-label="Menu lateral"
          initial={false}
          animate={{
            width: isSidebarOpen ? 220 : 72,
            transition: {
              type: 'spring',
              stiffness: 240,
              damping: 26,
              delay: isSidebarOpen ? 0 : 0.12
            }
          }}
        >
          <nav className="sidebar-nav">
            <NavLink
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              to="/app"
              end
            >
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={faHouse} />
              </span>
              <motion.span
                className="sidebar-text"
                initial={false}
                animate={isSidebarOpen ? 'open' : 'closed'}
                variants={{
                  open: { opacity: 1, x: 0, maxWidth: 160 },
                  closed: { opacity: 0, x: 8, maxWidth: 0 }
                }}
                transition={{
                  type: 'tween',
                  duration: 0.18,
                  delay: isSidebarOpen ? 0.08 : 0
                }}
              >
                Home
              </motion.span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              to="/app/tasks"
            >
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={faListCheck} />
              </span>
              <motion.span
                className="sidebar-text"
                initial={false}
                animate={isSidebarOpen ? 'open' : 'closed'}
                variants={{
                  open: { opacity: 1, x: 0, maxWidth: 160 },
                  closed: { opacity: 0, x: 8, maxWidth: 0 }
                }}
                transition={{
                  type: 'tween',
                  duration: 0.18,
                  delay: isSidebarOpen ? 0.08 : 0
                }}
              >
                Tasks
              </motion.span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              to="/app/profile"
            >
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <motion.span
                className="sidebar-text"
                initial={false}
                animate={isSidebarOpen ? 'open' : 'closed'}
                variants={{
                  open: { opacity: 1, x: 0, maxWidth: 160 },
                  closed: { opacity: 0, x: 8, maxWidth: 0 }
                }}
                transition={{
                  type: 'tween',
                  duration: 0.18,
                  delay: isSidebarOpen ? 0.08 : 0
                }}
              >
                Perfil
              </motion.span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              to="/app/users"
            >
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={faUsers} />
              </span>
              <motion.span
                className="sidebar-text"
                initial={false}
                animate={isSidebarOpen ? 'open' : 'closed'}
                variants={{
                  open: { opacity: 1, x: 0, maxWidth: 160 },
                  closed: { opacity: 0, x: 8, maxWidth: 0 }
                }}
                transition={{
                  type: 'tween',
                  duration: 0.18,
                  delay: isSidebarOpen ? 0.08 : 0
                }}
              >
                Usuarios
              </motion.span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              to="/app/teams"
            >
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={faPeopleGroup} />
              </span>
              <motion.span
                className="sidebar-text"
                initial={false}
                animate={isSidebarOpen ? 'open' : 'closed'}
                variants={{
                  open: { opacity: 1, x: 0, maxWidth: 160 },
                  closed: { opacity: 0, x: 8, maxWidth: 0 }
                }}
                transition={{
                  type: 'tween',
                  duration: 0.18,
                  delay: isSidebarOpen ? 0.08 : 0
                }}
              >
                Equipes
              </motion.span>
            </NavLink>
            {isAdmin ? (
              <NavLink
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                to="/app/admin"
              >
                <span className="sidebar-icon">
                  <FontAwesomeIcon icon={faGear} />
                </span>
                <motion.span
                  className="sidebar-text"
                  initial={false}
                  animate={isSidebarOpen ? 'open' : 'closed'}
                  variants={{
                    open: { opacity: 1, x: 0, maxWidth: 160 },
                    closed: { opacity: 0, x: 8, maxWidth: 0 }
                  }}
                  transition={{
                    type: 'tween',
                    duration: 0.18,
                    delay: isSidebarOpen ? 0.08 : 0
                  }}
                >
                  Admin
                </motion.span>
              </NavLink>
            ) : null}
          </nav>
        </motion.aside>

        <main className="main-content">{children ?? <Outlet />}</main>
      </div>
    </>
  )
}

export default SidebarLayout

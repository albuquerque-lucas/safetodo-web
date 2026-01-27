import { ReactNode, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
  faUser
} from '@fortawesome/free-solid-svg-icons'
import apiClient from '../lib/apiClient'

type SidebarLayoutProps = {
  title: string
  children?: ReactNode
}

function SidebarLayout({ title, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

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
        <button
          type="button"
          className="topbar-logout"
          aria-label="Sair"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
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

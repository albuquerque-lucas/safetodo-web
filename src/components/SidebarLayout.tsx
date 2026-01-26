import { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import {
  faBars,
  faGear,
  faListCheck,
  faUsers
} from '@fortawesome/free-solid-svg-icons'

type SidebarLayoutProps = {
  title: string
  children: ReactNode
}

function SidebarLayout({ title, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
        <div className="topbar-spacer" aria-hidden="true" />
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
              to="/tasks"
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
              to="/users"
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
              to="/admin"
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
          </nav>
        </motion.aside>

        <main className="main-content">{children}</main>
      </div>
    </>
  )
}

export default SidebarLayout

import { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
        <aside className="sidebar" aria-label="Menu lateral">
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
              <span className="sidebar-text">Tasks</span>
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
              <span className="sidebar-text">Usuarios</span>
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
              <span className="sidebar-text">Admin</span>
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </>
  )
}

export default SidebarLayout

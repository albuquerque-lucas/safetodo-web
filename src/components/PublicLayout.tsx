import { NavLink, Outlet } from 'react-router-dom'

const PublicLayout = () => (
  <div className="public-shell">
    <header className="public-topbar">
      <span className="public-brand">Tasks Django</span>
      <nav className="public-nav">
        <NavLink to="/" end className="public-link">
          Home
        </NavLink>
        <NavLink to="/sobre-nos" className="public-link">
          Sobre nós
        </NavLink>
        <NavLink to="/login" className="public-link">
          Login
        </NavLink>
      </nav>
    </header>
    <main className="public-content">
      <Outlet />
    </main>
  </div>
)

export default PublicLayout

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import useAuthToken from '../hooks/useAuthToken'

const PublicLayout = () => {
  const authToken = useAuthToken()
  const isAuthenticated = !!authToken
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate])

  return (
    <div className="public-shell">
      <header className="public-topbar">
        <NavLink to="/" className="public-brand">
          Tasks Django
        </NavLink>
        <nav className="public-nav">
          {isAuthenticated ? (
            <NavLink to="/app" className="public-link public-link--icon" title="Ir para o app">
              <FontAwesomeIcon icon={faHouse} />
            </NavLink>
          ) : null}
          <NavLink to="/" end className="public-link">
            Home
          </NavLink>
          <NavLink to="/sobre-nos" className="public-link">
            Sobre nos
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
}

export default PublicLayout

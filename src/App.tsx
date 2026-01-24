import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import TasksPage from './pages/TasksPage'
import UsersPage from './pages/UsersPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <nav className="navbar navbar-light bg-white border-bottom">
        <div className="container d-flex flex-column flex-md-row align-items-md-center gap-3">
          <span className="navbar-brand fw-semibold mb-0">Tasks Django</span>
          <div className="nav nav-pills ms-md-auto">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/tasks"
            >
              Tasks
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to="/users"
            >
              Usuarios
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

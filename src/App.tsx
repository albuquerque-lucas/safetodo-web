import { Navigate, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import TasksPage from './pages/TasksPage'
import UsersPage from './pages/UsersPage'
import UserProfilePage from './pages/UserProfilePage'
import SidebarLayout from './components/SidebarLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import PublicHomePage from './pages/PublicHomePage'
import PrivateHomePage from './pages/PrivateHomePage'
import AboutPage from './pages/AboutPage'
import PublicLayout from './components/PublicLayout'
import AdminRoute from './components/AdminRoute'
import ForbiddenPage from './pages/ForbiddenPage'
import TeamsPage from './pages/TeamsPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHomePage />} />
          <Route path="sobre-nos" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
        <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
        <Route path="/users" element={<Navigate to="/app/users" replace />} />
        <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
        <Route path="/teams" element={<Navigate to="/app/teams" replace />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <SidebarLayout title="Tasks Django" />
            </ProtectedRoute>
          }
        >
          <Route index element={<PrivateHomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserProfilePage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="forbidden" element={<ForbiddenPage />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App

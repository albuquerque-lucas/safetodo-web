import { Navigate, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import TasksPage from './pages/TasksPage'
import UsersPage from './pages/UsersPage'
import SidebarLayout from './components/SidebarLayout'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <SidebarLayout title="Tasks Django">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </SidebarLayout>
    </div>
  )
}

export default App

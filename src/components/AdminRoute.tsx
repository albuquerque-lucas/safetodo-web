import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

type AdminRouteProps = {
  children: ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('auth_role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'super_admin' && role !== 'company_admin') {
    return <Navigate to="/app/forbidden" replace />
  }

  return <>{children}</>
}

export default AdminRoute

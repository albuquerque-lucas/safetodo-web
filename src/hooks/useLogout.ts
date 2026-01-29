import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'

const useLogout = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    try {
      await apiClient.post(
        '/users/logout/',
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      )
    } catch {
      // No-op: logout pode ser apenas client-side
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_username')
      localStorage.removeItem('auth_user_id')
      localStorage.removeItem('auth_role')
      window.dispatchEvent(new Event('auth-token-changed'))
      navigate('/', { replace: true })
    }
  }

  return handleLogout
}

export default useLogout

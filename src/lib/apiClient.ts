import axios from 'axios'

const PUBLIC_API_PATHS = ['/users/login/', '/users/register/', '/users/logout/']
const PUBLIC_APP_ROUTES = ['/', '/login', '/sobre-nos']

const isPublicApiPath = (url?: string) =>
  !!url && PUBLIC_API_PATHS.some((path) => url.startsWith(path))

const isOnPublicRoute = () =>
  PUBLIC_APP_ROUTES.some((path) => window.location.pathname.startsWith(path))

const redirectToLogin = () => {
  if (window.location.pathname === '/login') {
    return
  }
  window.location.assign('/login')
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  if (isPublicApiPath(config.url)) {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization
    }
    return config
  }

  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_username')
      localStorage.removeItem('auth_user_id')
      localStorage.removeItem('auth_role')
      if (!isOnPublicRoute()) {
        window.location.assign('/')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

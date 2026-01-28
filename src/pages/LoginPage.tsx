import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'

type LoginResponse = {
  access: string
  refresh: string
  username: string
  user_id: number
}

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const { data } = await apiClient.post<LoginResponse>('/users/login/', {
        username: username.trim(),
        password,
      })
      localStorage.setItem('token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('auth_username', data.username)
      localStorage.setItem('auth_user_id', String(data.user_id))
      localStorage.setItem(
        'auth_role',
        data.username === 'admin' ? 'super_admin' : 'usuario'
      )
      window.dispatchEvent(new Event('auth-token-changed'))
      navigate('/app', { replace: true })
    } catch (error) {
      setErrorMessage('Credenciais inválidas. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Entrar</h1>
        <p className="login-subtitle">
          Acesse sua conta para continuar.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="form-label fw-semibold">Usuário</label>
            <input
              className="form-control"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="form-label fw-semibold">Senha</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {errorMessage ? (
            <div className="text-danger">{errorMessage}</div>
          ) : null}
          <button className="btn btn-dark w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

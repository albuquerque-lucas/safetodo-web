import { useEffect, useState } from 'react'

const readToken = () => localStorage.getItem('token')

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(readToken())

  useEffect(() => {
    const handleChange = () => {
      setToken(readToken())
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener('auth-token-changed', handleChange)

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('auth-token-changed', handleChange)
    }
  }, [])

  return token
}

export default useAuthToken

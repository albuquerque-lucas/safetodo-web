import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/apiClient'

type UseNotificationsSocketOptions = {
  enabled: boolean
  token?: string | null
}

const BACKOFF_DELAYS = [1000, 2000, 5000, 10000]
const DEBUG_WS = true
const HEARTBEAT_INTERVAL_MS = 30000

const buildSocketUrl = (token?: string | null) => {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? apiClient.defaults.baseURL
  if (apiBaseUrl) {
    const parsed = new URL(apiBaseUrl, window.location.href)
    const protocol = parsed.protocol === 'https:' ? 'wss' : 'ws'
    const baseUrl = `${protocol}://${parsed.host}/ws/notifications/`
    if (token) {
      return `${baseUrl}?token=${encodeURIComponent(token)}`
    }
    return baseUrl
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const baseUrl = `${protocol}://${window.location.host}/ws/notifications/`
  if (token) {
    return `${baseUrl}?token=${encodeURIComponent(token)}`
  }
  return baseUrl
}

const useNotificationsSocket = ({ enabled, token }: UseNotificationsSocketOptions) => {
  const queryClient = useQueryClient()
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const reconnectAttemptRef = useRef(0)
  const shouldReconnectRef = useRef(true)
  const isConnectingRef = useRef(false)
  const intentionalCloseRef = useRef(false)
  const connectionIdRef = useRef(0)
  const socketIdRef = useRef<number | null>(null)
  const connectTimerRef = useRef<number | null>(null)
  const heartbeatTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      shouldReconnectRef.current = false
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (socketRef.current) {
        intentionalCloseRef.current = true
        if (DEBUG_WS) {
          // eslint-disable-next-line no-console
          console.debug('[WS notif] cleanup(close) readyState=', socketRef.current.readyState)
        }
        socketRef.current.close()
        socketRef.current = null
      }
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
      return
    }

    shouldReconnectRef.current = true

    let activeConnectionId: number | null = null

    const connect = () => {
      if (!shouldReconnectRef.current) {
        return
      }
      if (socketRef.current) {
        const state = socketRef.current.readyState
        if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
          return
        }
      }
      if (isConnectingRef.current) {
        return
      }

      const socketUrl = buildSocketUrl(token ?? undefined)
      const connectionId = ++connectionIdRef.current
      activeConnectionId = connectionId
      if (DEBUG_WS) {
        const tokenPrefix = token ? token.slice(0, 8) : ''
        const tokenLen = token ? token.length : 0
        // eslint-disable-next-line no-console
        console.debug(
          '[WS notif]',
          connectionId,
          'connect start',
          socketUrl,
          'tokenLen=',
          tokenLen,
          'tokenPrefix=',
          tokenPrefix,
        )
      }
      const ws = new WebSocket(socketUrl)
      isConnectingRef.current = true
      intentionalCloseRef.current = false
      socketRef.current = ws
      socketIdRef.current = connectionId

      ws.onopen = () => {
        reconnectAttemptRef.current = 0
        isConnectingRef.current = false
        if (DEBUG_WS) {
          // eslint-disable-next-line no-console
          console.debug('[WS notif]', connectionId, 'open')
        }
        if (heartbeatTimerRef.current) {
          window.clearInterval(heartbeatTimerRef.current)
        }
        const sendHeartbeat = () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'presence.heartbeat' }))
          }
        }
        sendHeartbeat()
        heartbeatTimerRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
      }

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload?.event === 'notification.created') {
            queryClient.invalidateQueries({
              queryKey: ['notifications'],
              exact: false,
            })
            queryClient.invalidateQueries({
              queryKey: ['notifications-unread'],
              exact: false,
            })
            queryClient.invalidateQueries({
              queryKey: ['notifications', 'unseen'],
              exact: false,
            })
            return
          }
          if (payload?.event === 'user_online' || payload?.event === 'user_offline') {
            const userId = payload?.user_id
            queryClient.setQueryData(['users-presence'], (prev) => {
              if (!Array.isArray(prev) || typeof userId !== 'number') {
                return prev
              }
              return prev.map((item) =>
                item && item.id === userId
                  ? {
                      ...item,
                      is_online: payload?.is_online === true,
                      last_seen_at: payload?.last_seen_at ?? item.last_seen_at,
                    }
                  : item,
              )
            })
          }
        } catch {
          // Ignore malformed payloads
        }
      }

      ws.onclose = (event) => {
        if (socketIdRef.current === connectionId) {
          socketRef.current = null
          socketIdRef.current = null
        }
        isConnectingRef.current = false
        if (heartbeatTimerRef.current) {
          window.clearInterval(heartbeatTimerRef.current)
          heartbeatTimerRef.current = null
        }
        if (DEBUG_WS) {
          // eslint-disable-next-line no-console
          console.debug(
            '[WS notif]',
            connectionId,
            'close',
            event.code,
            event.reason,
            event.wasClean,
            'readyState=',
            ws.readyState,
          )
        }
        if (intentionalCloseRef.current) {
          return
        }
        if (!shouldReconnectRef.current) {
          return
        }
        if (event.code === 4401) {
          shouldReconnectRef.current = false
          return
        }
        const attempt = reconnectAttemptRef.current
        const delay =
          BACKOFF_DELAYS[Math.min(attempt, BACKOFF_DELAYS.length - 1)]
        reconnectAttemptRef.current += 1
        reconnectTimerRef.current = window.setTimeout(connect, delay)
      }

      ws.onerror = () => {
        if (DEBUG_WS) {
          // eslint-disable-next-line no-console
          console.debug('[WS notif]', connectionId, 'error')
        }
        ws.close()
      }
    }

    connectTimerRef.current = window.setTimeout(() => {
      connectTimerRef.current = null
      connect()
    }, 0)

    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (connectTimerRef.current) {
        window.clearTimeout(connectTimerRef.current)
        connectTimerRef.current = null
      }
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
      const socket = socketRef.current
      const shouldCloseSocket =
        socket &&
        socketIdRef.current === activeConnectionId &&
        !(import.meta.env.DEV && socket.readyState === WebSocket.CONNECTING)
      if (shouldCloseSocket) {
        intentionalCloseRef.current = true
        if (DEBUG_WS) {
          // eslint-disable-next-line no-console
          console.debug('[WS notif] cleanup(close) readyState=', socket.readyState)
        }
        socket.close()
        socketRef.current = null
        socketIdRef.current = null
      } else if (socket && DEBUG_WS) {
        // eslint-disable-next-line no-console
        console.debug('[WS notif] cleanup(skip) readyState=', socket.readyState)
      }
    }
  }, [enabled, token, queryClient])
}

export default useNotificationsSocket

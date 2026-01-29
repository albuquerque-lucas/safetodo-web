import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import type { Notification } from '../../types/api'

type NotificationsMenuProps = {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  showBadge: boolean
  badgeCount: number
  isLoading: boolean
  isError: boolean
  notifications: Notification[]
  onNotificationClick: (id: number) => void
  onClear: () => void
  onViewAll: () => void
}

const NotificationsMenu = ({
  isOpen,
  onToggle,
  onClose,
  showBadge,
  badgeCount,
  isLoading,
  isError,
  notifications,
  onNotificationClick,
  onClear,
  onViewAll,
}: NotificationsMenuProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const formatNotificationTitle = (type: string) => {
    if (type === 'task.assigned') {
      return 'Atribuiram uma tarefa a voce'
    }
    if (type === 'team.member_added') {
      return 'Voce foi adicionado a uma equipe'
    }
    return type.replaceAll('.', ' ')
  }

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : '-'

  return (
    <div className="topbar-notifications" ref={containerRef}>
      <button
        type="button"
        className="topbar-icon-button"
        aria-label="Notificacoes"
        onClick={onToggle}
      >
        <FontAwesomeIcon icon={faBell} />
        {showBadge && badgeCount ? (
          <motion.span
            key={`notif-${badgeCount}`}
            className="notification-badge topbar-badge"
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 1.65, 0.88, 1.2, 1] }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {badgeCount}
          </motion.span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="notifications-menu">
          <div className="notifications-menu-header">
            <span>Notificacoes</span>
          </div>
          <div className="notifications-menu-body">
            {isLoading ? (
              <div className="text-muted">Carregando...</div>
            ) : isError ? (
              <div className="text-danger">Erro ao carregar notificacoes.</div>
            ) : notifications.length === 0 ? (
              <div className="text-muted">Sem notificacoes.</div>
            ) : (
              notifications.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`notifications-menu-item ${
                    item.read_at ? '' : 'is-unread'
                  }`}
                  onClick={() => onNotificationClick(item.id)}
                >
                  <span className="notifications-menu-title">
                    {formatNotificationTitle(item.type)}
                  </span>
                  <span className="notifications-menu-time">
                    {formatDate(item.created_at)}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="notifications-menu-footer">
            <button
              type="button"
              className="btn btn-sm notifications-clear"
              onClick={onClear}
            >
              Limpar
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-3"
              onClick={onViewAll}
            >
              Ver todas
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationsMenu

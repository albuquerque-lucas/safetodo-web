import type { Notification } from '../../types/api'
import { compactMetadata, formatDate } from '../../utils/profileUtils'

type NotificationsListProps = {
  notifications: Notification[]
  onClick: (id: number) => void
  onMarkRead: (id: number) => void
  onMarkUnread: (id: number) => void
  onDelete: (id: number) => void
  canDeleteItem: (notification: Notification) => boolean
  isMarkingRead: boolean
  isMarkingUnread: boolean
  isDeleting: boolean
}

const NotificationsList = ({
  notifications,
  onClick,
  onMarkRead,
  onMarkUnread,
  onDelete,
  canDeleteItem,
  isMarkingRead,
  isMarkingUnread,
  isDeleting,
}: NotificationsListProps) => (
  <div className="notification-list">
    {notifications.length === 0 ? (
      <div className="text-muted">Nenhuma notificacao.</div>
    ) : (
      notifications.map((item) => {
        const isUnread = !item.read_at
        return (
          <div
            key={item.id}
            className={`notification-item ${isUnread ? 'is-unread' : ''}`}
          >
            <button
              type="button"
              className="notification-main"
              onClick={() => onClick(item.id)}
            >
              <div className="notification-title">
                {item.type.replaceAll('.', ' ')}
              </div>
              <div className="notification-meta">
                {formatDate(item.created_at)}
              </div>
              <div className="notification-payload">
                {compactMetadata(item.payload)}
              </div>
            </button>
            <div className="notification-actions">
              {isUnread ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onMarkRead(item.id)}
                  disabled={isMarkingRead}
                >
                  Marcar como lida
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onMarkUnread(item.id)}
                  disabled={isMarkingUnread}
                >
                  Marcar como nao lida
                </button>
              )}
              {canDeleteItem(item) ? (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeleting}
                >
                  Excluir
                </button>
              ) : null}
            </div>
          </div>
        )
      })
    )}
  </div>
)

export default NotificationsList

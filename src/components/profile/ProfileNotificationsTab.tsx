import type { Notification } from '../../types/api'
import NotificationsList from './NotificationsList'
import ProfilePaginationFooter from './ProfilePaginationFooter'

type ProfileNotificationsTabProps = {
  notifications: Notification[]
  isLoading: boolean
  isError: boolean
  total: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  onMarkAllRead: () => void
  onClear: () => void
  isMarkingAllRead: boolean
  isClearing: boolean
  showMutationError: boolean
  onNotificationClick: (id: number) => void
  onMarkRead: (id: number) => void
  onMarkUnread: (id: number) => void
  onDelete: (id: number) => void
  canDeleteItem: (notification: Notification) => boolean
  isMarkingRead: boolean
  isMarkingUnread: boolean
  isDeleting: boolean
}

const ProfileNotificationsTab = ({
  notifications,
  isLoading,
  isError,
  total,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onMarkAllRead,
  onClear,
  isMarkingAllRead,
  isClearing,
  showMutationError,
  onNotificationClick,
  onMarkRead,
  onMarkUnread,
  onDelete,
  canDeleteItem,
  isMarkingRead,
  isMarkingUnread,
  isDeleting,
}: ProfileNotificationsTabProps) => (
  <div className="profile-notifications">
    <div className="profile-notifications-header">
      <div>
        <h2 className="h5 mb-1">Notificacoes</h2>
        <p className="text-muted mb-0">
          Acompanhe avisos recentes e acoes pendentes.
        </p>
      </div>
      <div className="profile-notifications-actions">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead}
        >
          {isMarkingAllRead ? 'Marcando...' : 'Marcar todas como lidas'}
        </button>
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={onClear}
          disabled={isClearing}
        >
          {isClearing ? 'Limpando...' : 'Limpar notificacoes'}
        </button>
      </div>
    </div>

    {isLoading ? (
      <div className="text-muted">Carregando notificacoes...</div>
    ) : isError ? (
      <div className="text-danger">Erro ao carregar notificacoes.</div>
    ) : (
      <>
        <NotificationsList
          notifications={notifications}
          onClick={onNotificationClick}
          onMarkRead={onMarkRead}
          onMarkUnread={onMarkUnread}
          onDelete={onDelete}
          canDeleteItem={canDeleteItem}
          isMarkingRead={isMarkingRead}
          isMarkingUnread={isMarkingUnread}
          isDeleting={isDeleting}
        />
        <ProfilePaginationFooter
          total={total}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious}
          onNext={onNext}
        />
        {showMutationError ? (
          <div className="text-danger mt-3">
            Permissao insuficiente ou erro ao remover notificacoes.
          </div>
        ) : null}
      </>
    )}
  </div>
)

export default ProfileNotificationsTab

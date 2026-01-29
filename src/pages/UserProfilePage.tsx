import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { getCurrentUser, getUser } from '../api/users'
import { clearAuditLogs, deleteAuditLog, getAuditLogs } from '../api/auditLogs'
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '../api/notifications'
import DataTable from '../components/DataTable'
import RowActionsMenu from '../components/RowActionsMenu'
import { confirmDeletion } from '../utils/swalMessages'
import type { AuditLog } from '../types/api'

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '-'

const compactMetadata = (metadata: Record<string, unknown>) => {
  const keys = Object.keys(metadata)
  if (keys.length === 0) {
    return '-'
  }
  const raw = JSON.stringify(metadata)
  if (raw.length <= 120) {
    return raw
  }
  return `${raw.slice(0, 120)}...`
}

const canViewLogs = (role: string, isOwnProfile: boolean) =>
  role === 'super_admin' || role === 'company_admin' || isOwnProfile

const canDeleteLogs = (role: string) => role === 'super_admin'

const canClearLogs = (role: string) => role === 'super_admin'

const canViewNotifications = (role: string, isOwnProfile: boolean) =>
  role === 'super_admin' || role === 'company_admin' || isOwnProfile

const UserProfilePage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const parsedUserId = userId ? Number(userId) : null
  const isValidUserId =
    parsedUserId !== null && !Number.isNaN(parsedUserId)
  const [activeTab, setActiveTab] = useState<'profile' | 'logs' | 'notifications'>('profile')
  const [logPage, setLogPage] = useState(1)
  const [notificationPage, setNotificationPage] = useState(1)

  const profileQuery = useQuery({
    queryKey: ['user-profile', userId ? parsedUserId : 'me'],
    queryFn: () =>
      userId && isValidUserId
        ? getUser(parsedUserId as number)
        : getCurrentUser(),
    enabled: userId ? isValidUserId : true,
  })

  const profileTitle = userId ? 'Perfil do usuario' : 'Meu perfil'

  const displayName = useMemo(() => {
    if (!profileQuery.data) {
      return ''
    }
    const fullName = [profileQuery.data.first_name, profileQuery.data.last_name]
      .filter(Boolean)
      .join(' ')
    return fullName || profileQuery.data.username
  }, [profileQuery.data])

  const avatarInitials = useMemo(() => {
    if (!profileQuery.data) {
      return ''
    }
    const first = profileQuery.data.first_name?.trim()
    const last = profileQuery.data.last_name?.trim()
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase()
    }
    const fallback = (displayName || profileQuery.data.username).trim()
    return fallback.slice(0, 2).toUpperCase()
  }, [displayName, profileQuery.data])

  const viewerRole = localStorage.getItem('auth_role') ?? 'usuario'
  const viewerId = localStorage.getItem('auth_user_id') ?? ''
  const profileUserId = profileQuery.data?.id
  const isOwnProfile =
    profileUserId !== undefined && String(profileUserId) === viewerId
  const isAdmin = viewerRole === 'super_admin' || viewerRole === 'company_admin'
  const canViewLogsTab = canViewLogs(viewerRole, isOwnProfile)
  const canDeleteLogsItems = canDeleteLogs(viewerRole)
  const canClearLogsItems = canClearLogs(viewerRole)
  const canViewNotificationsTab = canViewNotifications(viewerRole, isOwnProfile)

  useEffect(() => {
    setLogPage(1)
  }, [profileUserId, activeTab])

  useEffect(() => {
    setNotificationPage(1)
  }, [profileUserId, activeTab])

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'notifications') {
      setActiveTab('notifications')
    } else if (tabParam === 'logs') {
      setActiveTab('logs')
    } else if (tabParam === 'profile') {
      setActiveTab('profile')
    }
  }, [searchParams])

  useEffect(() => {
    if (!canViewLogsTab && activeTab === 'logs') {
      setActiveTab('profile')
    }
  }, [activeTab, canViewLogsTab])

  useEffect(() => {
    if (!canViewNotificationsTab && activeTab === 'notifications') {
      setActiveTab('profile')
    }
  }, [activeTab, canViewNotificationsTab])

  const logsQuery = useQuery({
    queryKey: ['audit-logs', profileUserId, logPage, isAdmin],
    queryFn: () =>
      getAuditLogs({
        userId: isAdmin ? profileUserId : undefined,
        page: logPage,
      }),
    enabled: canViewLogsTab && activeTab === 'logs' && !!profileUserId,
  })

  const logsErrorStatus = (logsQuery.error as { response?: { status?: number } })
    ?.response?.status

  useEffect(() => {
    if (activeTab === 'logs' && canViewLogsTab && logsQuery.refetch) {
      logsQuery.refetch()
    }
  }, [activeTab, canViewLogsTab, logPage, logsQuery])

  const notificationsQuery = useQuery({
    queryKey: ['notifications', profileUserId, notificationPage, isAdmin],
    queryFn: () =>
      getNotifications({
        userId: isAdmin ? profileUserId : undefined,
        page: notificationPage,
      }),
    enabled:
      canViewNotificationsTab && activeTab === 'notifications' && !!profileUserId,
  })

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread', profileUserId, isAdmin],
    queryFn: () =>
      getNotifications({
        userId: isAdmin ? profileUserId : undefined,
        unread: true,
        page: 1,
      }),
    enabled: canViewNotificationsTab && !!profileUserId,
  })

  useEffect(() => {
    if (
      activeTab === 'notifications' &&
      canViewNotificationsTab &&
      notificationsQuery.refetch
    ) {
      notificationsQuery.refetch()
    }
  }, [activeTab, canViewNotificationsTab, notificationPage, notificationsQuery])

  const deleteMutation = useMutation({
    mutationFn: deleteAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: (targetUserId?: number) => clearAuditLogs({ userId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const markUnreadMutation = useMutation({
    mutationFn: markNotificationUnread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const clearNotificationsMutation = useMutation({
    mutationFn: (targetUserId?: number) => clearNotifications({ userId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: (targetUserId?: number) =>
      markAllNotificationsRead({ userId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread'],
        exact: false,
      })
    },
  })

  const handleDeleteLog = async (logId: number) => {
    const confirmed = await confirmDeletion('Esse log sera removido.')
    if (confirmed) {
      deleteMutation.mutate(logId)
    }
  }

  const handleClearLogs = async () => {
    const confirmed = await confirmDeletion('Todos os logs serao removidos.')
    if (confirmed && profileUserId) {
      clearMutation.mutate(profileUserId)
    }
  }

  const handleNotificationClick = async (notificationId: number) => {
    const notification = notificationsQuery.data?.results.find(
      (item) => item.id === notificationId,
    )
    if (!notification) {
      return
    }
    if (!notification.read_at) {
      markReadMutation.mutate(notificationId)
    }
    const payload = notification.payload
    const taskId = payload?.['task_id']
    const teamId = payload?.['team_id']
    if (taskId) {
      navigate('/app/tasks')
      return
    }
    if (teamId) {
      navigate('/app/teams')
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    const confirmed = await confirmDeletion('Essa notificacao sera removida.')
    if (confirmed) {
      deleteNotificationMutation.mutate(notificationId)
    }
  }

  const handleClearNotifications = async () => {
    const confirmed = await confirmDeletion(
      'Todas as notificacoes serao removidas.',
    )
    if (confirmed) {
      clearNotificationsMutation.mutate(
        viewerRole === 'super_admin' ? profileUserId : undefined,
      )
    }
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(
      viewerRole === 'super_admin' ? profileUserId : undefined,
    )
  }

  if (userId && !isValidUserId) {
    return (
      <div className="page-card">
        <h1 className="h3 mb-2">Perfil do usuario</h1>
        <p className="text-danger mb-0">ID do usuario invalido.</p>
      </div>
    )
  }

  return (
    <div className="page-card profile-page">
      <div className="profile-header">
        <div>
          <p className="profile-eyebrow">Conta</p>
          <h1 className="h3 mb-1">{profileTitle}</h1>
          <p className="text-muted mb-0">
            Informacoes principais do usuario.
          </p>
        </div>
        {userId ? (
          <Link to="/app/users" className="btn btn-outline-secondary">
            Voltar para usuarios
          </Link>
        ) : null}
      </div>

      {profileQuery.isLoading ? (
        <div className="text-muted">Carregando perfil...</div>
      ) : profileQuery.isError ? (
        <div className="text-danger">Erro ao carregar perfil.</div>
      ) : profileQuery.data ? (
        <>
          <ul className="nav nav-tabs profile-tabs">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Perfil
              </button>
            </li>
            {canViewLogsTab ? (
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('logs')}
                >
                  Logs
                </button>
              </li>
            ) : null}
            {canViewNotificationsTab ? (
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  Notificacoes
                  {unreadCountQuery.data?.count ? (
                    <span className="notification-badge">
                      {unreadCountQuery.data.count}
                    </span>
                  ) : null}
                </button>
              </li>
            ) : null}
          </ul>

          {activeTab === 'profile' ? (
            <div className="profile-body">
              <div className="profile-summary">
                <div className="profile-avatar" aria-hidden="true">
                  {avatarInitials}
                </div>
                <div>
                  <h2 className="h4 mb-1">{displayName}</h2>
                  <p className="text-muted mb-2">@{profileQuery.data.username}</p>
                  <div className="profile-meta">
                    <span className="profile-chip">
                      ID {profileQuery.data.id}
                    </span>
                    {profileQuery.data.last_login ? (
                      <span className="profile-chip">
                        Ultimo acesso {formatDate(profileQuery.data.last_login)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <span className="profile-label">Email</span>
                  <span className="profile-value">
                    {profileQuery.data.email || '-'}
                  </span>
                </div>
                <div>
                  <span className="profile-label">Nome completo</span>
                  <span className="profile-value">
                    {displayName || '-'}
                  </span>
                </div>
                <div>
                  <span className="profile-label">Telefone</span>
                  <span className="profile-value">
                    {profileQuery.data.phone || '-'}
                  </span>
                </div>
                <div>
                  <span className="profile-label">Data de cadastro</span>
                  <span className="profile-value">
                    {formatDate(profileQuery.data.date_joined)}
                  </span>
                </div>
              </div>

              <div className="profile-bio">
                <span className="profile-label">Bio</span>
                <p className="profile-value mb-0">
                  {profileQuery.data.bio?.trim() || '-'}
                </p>
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <div className="profile-logs">
              <div className="profile-logs-header">
                <div>
                  <h2 className="h5 mb-1">Logs de auditoria</h2>
                  <p className="text-muted mb-0">
                    Registros de acoes deste usuario.
                  </p>
                </div>
                {canClearLogsItems ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleClearLogs}
                    disabled={clearMutation.isPending || !profileUserId}
                  >
                    {clearMutation.isPending ? 'Limpando...' : 'Deletar tudo'}
                  </button>
                ) : null}
              </div>

              {logsQuery.isLoading ? (
                <div className="text-muted">Carregando logs...</div>
              ) : logsQuery.isError ? (
                <div className="text-danger">
                  {logsErrorStatus === 403
                    ? 'Permissao insuficiente para ver os logs.'
                    : 'Erro ao carregar logs.'}
                </div>
              ) : (
                <>
                  <DataTable
                    columns={[
                      {
                        header: 'Data/Hora',
                        render: (log: AuditLog) => formatDate(log.timestamp),
                      },
                      { header: 'Acao', render: (log: AuditLog) => log.action },
                      {
                        header: 'Entidade',
                        render: (log: AuditLog) => log.entity_type,
                      },
                      { header: 'ID', render: (log: AuditLog) => log.entity_id || '-' },
                      {
                        header: 'Resumo',
                        render: (log: AuditLog) => compactMetadata(log.metadata),
                      },
                      ...(canDeleteLogsItems
                        ? [
                            {
                              header: 'Opcoes',
                              headerClassName: 'text-end',
                              className: 'text-end',
                              render: (log: AuditLog) => (
                                <RowActionsMenu
                                  items={[
                                    {
                                      label: 'Deletar',
                                      onClick: () => handleDeleteLog(log.id),
                                      className: 'dropdown-item text-danger',
                                      disabled: deleteMutation.isPending,
                                    },
                                  ]}
                                />
                              ),
                            },
                          ]
                        : []),
                    ]}
                    data={logsQuery.data?.results ?? []}
                    emptyMessage="Nenhum log encontrado."
                    rowKey={(log: AuditLog) => log.id}
                  />
                  <div className="profile-logs-footer">
                    <span className="text-muted">
                      Total: {logsQuery.data?.count ?? 0}
                    </span>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setLogPage((page) => Math.max(1, page - 1))}
                        disabled={!logsQuery.data?.previous}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setLogPage((page) => page + 1)}
                        disabled={!logsQuery.data?.next}
                      >
                        Proxima
                      </button>
                    </div>
                  </div>
                    {deleteMutation.isError || clearMutation.isError ? (
                      <div className="text-danger mt-3">
                        Permissao insuficiente ou erro ao remover logs.
                      </div>
                    ) : null}
                </>
              )}
            </div>
          ) : (
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
                    onClick={handleMarkAllRead}
                    disabled={markAllReadMutation.isPending}
                  >
                    {markAllReadMutation.isPending
                      ? 'Marcando...'
                      : 'Marcar todas como lidas'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleClearNotifications}
                    disabled={clearNotificationsMutation.isPending}
                  >
                    {clearNotificationsMutation.isPending
                      ? 'Limpando...'
                      : 'Limpar notificacoes'}
                  </button>
                </div>
              </div>

              {notificationsQuery.isLoading ? (
                <div className="text-muted">Carregando notificacoes...</div>
              ) : notificationsQuery.isError ? (
                <div className="text-danger">
                  Erro ao carregar notificacoes.
                </div>
              ) : (
                <>
                  <div className="notification-list">
                    {(notificationsQuery.data?.results ?? []).length === 0 ? (
                      <div className="text-muted">Nenhuma notificacao.</div>
                    ) : (
                      (notificationsQuery.data?.results ?? []).map((item) => {
                        const isUnread = !item.read_at
                        const canDeleteItem =
                          viewerRole === 'super_admin' ||
                          String(item.recipient) === viewerId
                        return (
                          <div
                            key={item.id}
                            className={`notification-item ${
                              isUnread ? 'is-unread' : ''
                            }`}
                          >
                            <button
                              type="button"
                              className="notification-main"
                              onClick={() => handleNotificationClick(item.id)}
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
                                  onClick={() =>
                                    markReadMutation.mutate(item.id)
                                  }
                                  disabled={markReadMutation.isPending}
                                >
                                  Marcar como lida
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() =>
                                    markUnreadMutation.mutate(item.id)
                                  }
                                  disabled={markUnreadMutation.isPending}
                                >
                                  Marcar como nao lida
                                </button>
                              )}
                              {canDeleteItem ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteNotification(item.id)}
                                  disabled={deleteNotificationMutation.isPending}
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
                  <div className="profile-logs-footer">
                    <span className="text-muted">
                      Total: {notificationsQuery.data?.count ?? 0}
                    </span>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setNotificationPage((page) => Math.max(1, page - 1))
                        }
                        disabled={!notificationsQuery.data?.previous}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setNotificationPage((page) => page + 1)}
                        disabled={!notificationsQuery.data?.next}
                      >
                        Proxima
                      </button>
                    </div>
                  </div>
                  {deleteNotificationMutation.isError ||
                  clearNotificationsMutation.isError ? (
                    <div className="text-danger mt-3">
                      Permissao insuficiente ou erro ao remover notificacoes.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-muted">Nenhum dado encontrado.</div>
      )}
    </div>
  )
}

export default UserProfilePage

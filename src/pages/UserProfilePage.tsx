import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { getCurrentUser, getUser } from '../api/users'
import { clearAuditLogs, deleteAuditLog, getAuditLogs } from '../api/auditLogs'
import DataTable from '../components/DataTable'
import RowActionsMenu from '../components/RowActionsMenu'
import { confirmDeletion } from '../utils/swalMessages'

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

const UserProfilePage = () => {
  const queryClient = useQueryClient()
  const { userId } = useParams()
  const parsedUserId = userId ? Number(userId) : null
  const isValidUserId =
    parsedUserId !== null && !Number.isNaN(parsedUserId)
  const [activeTab, setActiveTab] = useState<'profile' | 'logs'>('profile')
  const [logPage, setLogPage] = useState(1)

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

  useEffect(() => {
    setLogPage(1)
  }, [profileUserId, activeTab])

  useEffect(() => {
    if (!canViewLogsTab && activeTab === 'logs') {
      setActiveTab('profile')
    }
  }, [activeTab, canViewLogsTab])

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
          ) : (
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
                        render: (log) => formatDate(log.timestamp),
                      },
                      { header: 'Acao', render: (log) => log.action },
                      {
                        header: 'Entidade',
                        render: (log) => log.entity_type,
                      },
                      { header: 'ID', render: (log) => log.entity_id || '-' },
                      {
                        header: 'Resumo',
                        render: (log) => compactMetadata(log.metadata),
                      },
                      ...(canDeleteLogsItems
                        ? [
                            {
                              header: 'Opcoes',
                              headerClassName: 'text-end',
                              className: 'text-end',
                              render: (log) => (
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
                    rowKey={(log) => log.id}
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
          )}
        </>
      ) : (
        <div className="text-muted">Nenhum dado encontrado.</div>
      )}
    </div>
  )
}

export default UserProfilePage

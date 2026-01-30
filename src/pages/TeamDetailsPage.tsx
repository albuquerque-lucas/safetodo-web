/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import Pagination from '../components/Pagination'
import TeamMembersTable from '../components/teams/TeamMembersTable'
import TeamTasksTable from '../components/teams/TeamTasksTable'
import TeamTabs, { type TeamTabKey } from '../components/teams/TeamTabs'
import TeamMembersModal from '../components/modals/TeamMembersModal'
import NewItemButton from '../components/NewItemButton'
import { getTeam, getTeamMembers, getTeamTasks, updateTeam } from '../api/teams'
import { getUserChoices } from '../api/users'
import useModalState from '../hooks/useModalState'
import useTableSorting from '../hooks/useTableSorting'

const TeamDetailsPage = () => {
  const { teamId } = useParams()
  const parsedTeamId = Number(teamId)
  const isValidTeamId = Number.isFinite(parsedTeamId) && parsedTeamId > 0
  const queryClient = useQueryClient()
  const memberModal = useModalState<'add'>()
  const [activeTab, setActiveTab] = useState<TeamTabKey>('team')
  const [membersPage, setMembersPage] = useState(1)
  const [tasksPage, setTasksPage] = useState(1)
  const pageSize = 10
  const [taskSearchInput, setTaskSearchInput] = useState('')
  const [taskSearch, setTaskSearch] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [pendingMembers, setPendingMembers] = useState<
    { id: number; name: string }[]
  >([])

  const {
    sortBy: membersSortBy,
    sortDir: membersSortDir,
    ordering: membersOrdering,
    toggleSort: toggleMembersSort,
  } = useTableSorting({ defaultSortBy: 'date_joined' })

  const {
    sortBy: tasksSortBy,
    sortDir: tasksSortDir,
    ordering: tasksOrdering,
    toggleSort: toggleTasksSort,
  } = useTableSorting({ defaultSortBy: 'created_at' })

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setTaskSearch(taskSearchInput.trim())
    }, 300)
    return () => window.clearTimeout(handler)
  }, [taskSearchInput])

  useEffect(() => {
    setMembersPage(1)
  }, [membersOrdering])

  useEffect(() => {
    setTasksPage(1)
  }, [tasksOrdering, taskSearch])

  const teamQuery = useQuery({
    queryKey: ['team', parsedTeamId],
    queryFn: () => getTeam(parsedTeamId),
    enabled: isValidTeamId,
    placeholderData: keepPreviousData,
  })

  const membersQuery = useQuery({
    queryKey: ['team-members', parsedTeamId, membersPage, pageSize, membersOrdering],
    queryFn: () =>
      getTeamMembers(parsedTeamId, {
        page: membersPage,
        pageSize,
        ordering: membersOrdering,
      }),
    enabled: isValidTeamId && activeTab === 'members',
    placeholderData: keepPreviousData,
  })

  const tasksQuery = useQuery({
    queryKey: [
      'team-tasks',
      parsedTeamId,
      tasksPage,
      pageSize,
      tasksOrdering,
      taskSearch,
    ],
    queryFn: () =>
      getTeamTasks(parsedTeamId, {
        page: tasksPage,
        pageSize,
        ordering: tasksOrdering,
        search: taskSearch,
      }),
    enabled: isValidTeamId && activeTab === 'tasks',
    placeholderData: keepPreviousData,
  })

  const userChoicesQuery = useQuery({
    queryKey: ['user-choices', 'teams', 'add-members'],
    queryFn: () => getUserChoices({ pageSize: 200 }),
    enabled: memberModal.isOpen,
  })

  const addMembersMutation = useMutation({
    mutationFn: (memberIds: number[]) =>
      updateTeam(parsedTeamId, { members: memberIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', parsedTeamId] })
      queryClient.invalidateQueries({ queryKey: ['team-members', parsedTeamId] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      memberModal.close()
      setSelectedMemberId('')
      setPendingMembers([])
    },
  })

  const membersCount = useMemo(() => {
    const members = teamQuery.data?.members_display?.length
    if (typeof members === 'number') {
      return members
    }
    return teamQuery.data?.members?.length ?? 0
  }, [teamQuery.data])

  const managersCount = useMemo(() => {
    const managers = teamQuery.data?.managers_display?.length
    if (typeof managers === 'number') {
      return managers
    }
    return teamQuery.data?.managers?.length ?? 0
  }, [teamQuery.data])

  const existingMemberIds = useMemo(() => {
    if (!teamQuery.data) {
      return []
    }
    if (teamQuery.data.members_display?.length) {
      return teamQuery.data.members_display.map((member) => member.id)
    }
    return teamQuery.data.members ?? []
  }, [teamQuery.data])

  const availableChoices = useMemo(() => {
    const blocked = new Set([
      ...existingMemberIds,
      ...pendingMembers.map((member) => member.id),
    ])
    return (userChoicesQuery.data?.results ?? []).filter(
      (choice) => !blocked.has(choice.id),
    )
  }, [existingMemberIds, pendingMembers, userChoicesQuery.data])

  useEffect(() => {
    if (!memberModal.isOpen) {
      setSelectedMemberId('')
      setPendingMembers([])
    }
  }, [memberModal.isOpen])

  if (teamId && !isValidTeamId) {
    return (
      <div className="page-card">
        <h1 className="h3 mb-2">Equipe</h1>
        <p className="text-danger mb-0">ID da equipe invalido.</p>
      </div>
    )
  }

  return (
    <div className="page-card profile-page">
      <div className="profile-header">
        <div>
          <p className="profile-eyebrow">Equipes</p>
          <h1 className="h3 mb-1">{teamQuery.data?.name ?? 'Equipe'}</h1>
          <p className="text-muted mb-0">
            Informacoes principais da equipe.
          </p>
        </div>
        <Link to="/app/teams" className="btn btn-outline-secondary">
          Voltar para equipes
        </Link>
      </div>

      {teamQuery.isLoading ? (
        <div className="text-muted">Carregando equipe...</div>
      ) : teamQuery.isError ? (
        <div className="text-danger">Erro ao carregar equipe.</div>
      ) : teamQuery.data ? (
        <>
          <TeamTabs activeTab={activeTab} onChangeTab={setActiveTab} />

          {activeTab === 'team' ? (
            <div className="profile-body">
              <div className="profile-summary team-summary">
                <div>
                  <h6 className="mb-2">Resumo</h6>
                  <div className="profile-meta">
                    <span className="profile-chip">
                      {membersCount} membros
                    </span>
                    <span className="profile-chip">
                      {managersCount} managers
                    </span>
                  </div>
                </div>
              </div>
              <div className="profile-grid">
                <div>
                  <span className="profile-label">Nome</span>
                  <div className="profile-value">{teamQuery.data.name}</div>
                </div>
              </div>
              <div className="profile-bio">
                <span className="profile-label">Descricao</span>
                <p className="mb-0">
                  {teamQuery.data.description || 'Sem descricao.'}
                </p>
              </div>
            </div>
          ) : activeTab === 'members' ? (
            <>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="mb-1">Membros da equipe</h6>
                  <p className="text-muted mb-0">
                    Gerencie os usuarios vinculados a equipe.
                  </p>
                </div>
                <NewItemButton
                  label="Adicionar membros"
                  onClick={() => memberModal.open('add')}
                  className="btn btn-dark text-nowrap"
                />
              </div>
              <TeamMembersTable
                members={membersQuery.data?.results ?? []}
                isLoading={membersQuery.isLoading}
                isError={membersQuery.isError}
                sortBy={membersSortBy}
                sortDir={membersSortDir}
                onSort={toggleMembersSort}
                emptyMessage="Nenhum membro encontrado."
              />
              {!membersQuery.isLoading && !membersQuery.isError ? (
                <Pagination
                  page={membersPage}
                  totalItems={membersQuery.data?.count ?? 0}
                  pageSize={pageSize}
                  onPageChange={setMembersPage}
                />
              ) : null}
              <TeamMembersModal
                isOpen={memberModal.isOpen}
                onClose={memberModal.close}
                formId="team-members-form"
                isSaving={addMembersMutation.isPending}
                saveError={addMembersMutation.isError}
                userChoices={availableChoices}
                selectedMemberId={selectedMemberId}
                setSelectedMemberId={setSelectedMemberId}
                pendingMembers={pendingMembers}
                setPendingMembers={setPendingMembers}
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!teamQuery.data) return
                  const merged = Array.from(
                    new Set([
                      ...existingMemberIds,
                      ...pendingMembers.map((member) => member.id),
                    ]),
                  )
                  if (merged.length === 0) return
                  addMembersMutation.mutate(merged)
                }}
              />
            </>
          ) : (
            <>
              <div className="list-toolbar-actions d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 mb-3">
                <div className="list-toolbar-search input-group">
                  <span className="input-group-text text-muted">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Buscar por ID, titulo, usuario"
                    value={taskSearchInput}
                    onChange={(event) => setTaskSearchInput(event.target.value)}
                    aria-label="Buscar tarefas da equipe"
                  />
                </div>
                {tasksQuery.isFetching && taskSearchInput.trim() ? (
                  <span className="text-muted small">Buscando...</span>
                ) : null}
              </div>
              <TeamTasksTable
                tasks={tasksQuery.data?.results ?? []}
                isLoading={tasksQuery.isLoading}
                isError={tasksQuery.isError}
                sortBy={tasksSortBy}
                sortDir={tasksSortDir}
                onSort={toggleTasksSort}
                emptyMessage={
                  taskSearch
                    ? 'Nenhuma tarefa encontrada para a busca.'
                    : 'Nenhuma tarefa encontrada.'
                }
              />
              {!tasksQuery.isLoading && !tasksQuery.isError ? (
                <Pagination
                  page={tasksPage}
                  totalItems={tasksQuery.data?.count ?? 0}
                  pageSize={pageSize}
                  onPageChange={setTasksPage}
                />
              ) : null}
            </>
          )}
        </>
      ) : (
        <div className="text-muted">Nenhum dado encontrado.</div>
      )}
    </div>
  )
}

export default TeamDetailsPage

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import NewItemButton from '../components/NewItemButton'
import Pagination from '../components/Pagination'
import TeamsTable from '../components/teams/TeamsTable'
import TeamCreateModal from '../components/modals/TeamCreateModal'
import useTeamsPageController from '../hooks/useTeamsPageController'

const TeamsPage = () => {
  const navigate = useNavigate()
  const {
    page,
    pageSize,
    setPage,
    sortBy,
    sortDir,
    toggleSort,
    searchInput,
    setSearchInput,
    search,
    teamsQuery,
    userChoices,
    createForm,
    setCreateForm,
    activeTab,
    setActiveTab,
    selectedMemberId,
    setSelectedMemberId,
    createModal,
    createMutation,
    deleteMutation,
    handleCreateSubmit,
    closeCreateModal,
    handleDelete,
  } = useTeamsPageController()

  return (
    <div className="page-card page-card--min">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Equipes</h1>
          <p className="text-muted mb-0">Gerencie equipes e membros.</p>
        </div>
        <div className="list-toolbar-actions d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
          <div className="list-toolbar-search input-group">
            <span className="input-group-text text-muted">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por ID ou nome da equipe"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Buscar equipes"
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            {teamsQuery.isFetching && searchInput.trim() ? (
              <span className="text-muted small">Buscando...</span>
            ) : null}
            <NewItemButton
              label="Criar equipe"
              onClick={() => createModal.open('create')}
              className="btn btn-dark text-nowrap flex-shrink-0"
            />
          </div>
        </div>
      </div>

      <TeamsTable
        teams={teamsQuery.data?.results ?? []}
        isLoading={teamsQuery.isLoading}
        isError={teamsQuery.isError}
        isDeleting={deleteMutation.isPending}
        onView={(id) => navigate(`/app/teams/${id}`)}
        onDelete={handleDelete}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        emptyMessage={
          search
            ? 'Nenhuma equipe encontrada para a busca.'
            : 'Nenhuma equipe encontrada.'
        }
      />

      {!teamsQuery.isLoading && !teamsQuery.isError ? (
        <Pagination
          page={page}
          totalItems={teamsQuery.data?.count ?? 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <TeamCreateModal
        isOpen={createModal.isOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        formId="team-create-form"
        isSaving={createMutation.isPending}
        saveError={createMutation.isError}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMemberId={selectedMemberId}
        setSelectedMemberId={setSelectedMemberId}
        form={createForm}
        setForm={setCreateForm}
        userChoices={userChoices}
      />
    </div>
  )
}

export default TeamsPage

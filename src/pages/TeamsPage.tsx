import NewItemButton from '../components/NewItemButton'
import Pagination from '../components/Pagination'
import TeamsTable from '../components/teams/TeamsTable'
import TeamCreateModal from '../components/modals/TeamCreateModal'
import TeamModal from '../components/modals/TeamModal'
import TeamTaskModal from '../components/modals/TeamTaskModal'
import useTeamsPageController from '../hooks/useTeamsPageController'

const TeamsPage = () => {
  const {
    page,
    pageSize,
    setPage,
    sortBy,
    sortDir,
    toggleSort,
    teamsQuery,
    teamQuery,
    teamTasksQuery,
    teamUserChoicesQuery,
    priorityLevelsQuery,
    userChoices,
    teamUserChoices,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    teamTaskForm,
    setTeamTaskForm,
    activeTab,
    setActiveTab,
    viewTab,
    setViewTab,
    selectedMemberId,
    setSelectedMemberId,
    createModal,
    teamModal,
    teamTaskModal,
    createMutation,
    updateMutation,
    deleteMutation,
    createTaskMutation,
    handleCreateSubmit,
    handleEditSubmit,
    handleTeamTaskCreateSubmit,
    openTeamModal,
    closeTeamModal,
    closeCreateModal,
    closeTeamTaskModal,
    handleDelete,
  } = useTeamsPageController()

  return (
    <div className="page-card page-card--min">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Equipes</h1>
          <p className="text-muted mb-0">Gerencie equipes e membros.</p>
        </div>
        <NewItemButton
          label="Criar equipe"
          onClick={() => createModal.open('create')}
        />
      </div>

      <TeamsTable
        teams={teamsQuery.data?.results ?? []}
        isLoading={teamsQuery.isLoading}
        isError={teamsQuery.isError}
        isDeleting={deleteMutation.isPending}
        onView={(id) => openTeamModal(id, 'view')}
        onEdit={(id) => openTeamModal(id, 'edit')}
        onDelete={handleDelete}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
      />

      {!teamsQuery.isLoading && !teamsQuery.isError ? (
        <Pagination
          page={page}
          totalItems={teamsQuery.data?.count ?? 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <TeamModal
        mode={teamModal.mode ?? 'view'}
        isOpen={teamModal.isOpen && teamModal.selectedId !== null}
        onClose={closeTeamModal}
        onSubmit={handleEditSubmit}
        formId="team-edit-form"
        isSaving={updateMutation.isPending}
        saveError={updateMutation.isError}
        isLoading={teamQuery.isLoading}
        isError={teamQuery.isError}
        team={teamQuery.data}
        teamTasks={teamTasksQuery.data?.results ?? []}
        isTasksLoading={teamTasksQuery.isLoading}
        isTasksError={teamTasksQuery.isError}
        viewTab={viewTab}
        setViewTab={setViewTab}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMemberId={selectedMemberId}
        setSelectedMemberId={setSelectedMemberId}
        userChoices={userChoices}
        editForm={editForm}
        setEditForm={setEditForm}
        onOpenTeamTaskModal={() => teamTaskModal.open('create')}
      />

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

      <TeamTaskModal
        isOpen={teamTaskModal.isOpen}
        onClose={closeTeamTaskModal}
        onSubmit={handleTeamTaskCreateSubmit}
        formId="team-task-create-form"
        isSaving={createTaskMutation.isPending}
        saveError={createTaskMutation.isError}
        form={teamTaskForm}
        setForm={setTeamTaskForm}
        priorityLevels={priorityLevelsQuery.data ?? []}
        isPriorityLoading={priorityLevelsQuery.isLoading}
        userChoices={teamUserChoices}
        isUserChoicesLoading={teamUserChoicesQuery.isLoading}
      />
    </div>
  )
}

export default TeamsPage

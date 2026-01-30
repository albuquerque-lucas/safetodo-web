import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import NewItemButton from '../components/NewItemButton'
import Pagination from '../components/Pagination'
import TaskCreateModal from '../components/modals/TaskCreateModal'
import TaskModal from '../components/modals/TaskModal'
import TasksTable from '../components/tasks/TasksTable'
import useTaskFormOptions from '../hooks/useTaskFormOptions'
import useTasksPageController from '../hooks/useTasksPageController'

const TasksPage = () => {
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
    tasksQuery,
    taskQuery,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    openModal,
    closeModal,
    createMutation,
    updateMutation,
    updateInlineMutation,
    deleteMutation,
    createModal,
    taskModal,
    handleCreateSubmit,
    handleEditSubmit,
    handleDelete,
    handleInlineUpdate,
    enterEditMode,
    cancelEditMode,
  } = useTasksPageController()

  const {
    priorityLevelsQuery,
    priorityLevels,
    teamsQuery,
    userChoicesQuery,
    userChoices,
  } = useTaskFormOptions({
    modalMode: taskModal.mode,
    isCreateOpen: createModal.isOpen,
    createForm,
    editForm,
    setCreateForm,
    setEditForm,
  })

  return (
    <div className="page-card page-card--min">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Minhas tarefas</h1>
          <p className="text-muted mb-0">Acompanhe apenas as tarefas atribuida a voce.</p>
        </div>
        <div className="list-toolbar-actions d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
          <div className="list-toolbar-search input-group">
            <span className="input-group-text text-muted">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por ID, titulo, equipe"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Buscar minhas tarefas"
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            {tasksQuery.isFetching && searchInput.trim() ? (
              <span className="text-muted small">Buscando...</span>
            ) : null}
            <NewItemButton
              label="Criar tarefa"
              onClick={() => createModal.open('create')}
              className="btn btn-dark text-nowrap flex-shrink-0"
            />
          </div>
        </div>
      </div>

      <TasksTable
        tasks={tasksQuery.data?.results ?? []}
        isLoading={tasksQuery.isLoading}
        isError={tasksQuery.isError}
        isDeleting={deleteMutation.isPending}
        isUpdatingInline={updateInlineMutation.isPending}
        onView={(id) => openModal(id, 'view')}
        onDelete={handleDelete}
        onFieldUpdate={handleInlineUpdate}
        priorityLevels={priorityLevels}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        emptyMessage={
          search
            ? 'Nenhuma tarefa encontrada para a busca.'
            : 'Nenhuma tarefa encontrada.'
        }
      />

      {!tasksQuery.isLoading && !tasksQuery.isError ? (
        <Pagination
          page={page}
          totalItems={tasksQuery.data?.count ?? 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <TaskModal
        isOpen={taskModal.isOpen}
        mode={taskModal.mode ?? 'view'}
        task={taskQuery.data}
        isLoading={taskQuery.isLoading}
        isError={taskQuery.isError}
        editForm={editForm}
        setEditForm={setEditForm}
        priorityLevels={priorityLevels}
        isPriorityLoading={priorityLevelsQuery.isLoading}
        teams={teamsQuery.data?.results ?? []}
        isTeamsLoading={teamsQuery.isLoading}
        userChoices={userChoices}
        isUserChoicesLoading={userChoicesQuery.isLoading}
        onSubmit={handleEditSubmit}
        onClose={closeModal}
        onEdit={enterEditMode}
        onCancelEdit={cancelEditMode}
        isSaving={updateMutation.isPending}
        saveError={updateMutation.isError}
      />

      <TaskCreateModal
        isOpen={createModal.isOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        priorityLevels={priorityLevels}
        isPriorityLoading={priorityLevelsQuery.isLoading}
        teams={teamsQuery.data?.results ?? []}
        isTeamsLoading={teamsQuery.isLoading}
        userChoices={userChoices}
        isUserChoicesLoading={userChoicesQuery.isLoading}
        onSubmit={handleCreateSubmit}
        onClose={createModal.close}
        isSaving={createMutation.isPending}
        saveError={createMutation.isError}
      />
    </div>
  )
}

export default TasksPage

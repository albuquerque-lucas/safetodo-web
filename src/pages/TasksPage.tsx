import NewItemButton from '../components/NewItemButton'
import TaskCreateModal from '../components/modals/TaskCreateModal'
import TaskModal from '../components/modals/TaskModal'
import TasksTable from '../components/tasks/TasksTable'
import useTaskFormOptions from '../hooks/useTaskFormOptions'
import useTasksPageController from '../hooks/useTasksPageController'

const TasksPage = () => {
  const {
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
    deleteMutation,
    createModal,
    taskModal,
    handleCreateSubmit,
    handleEditSubmit,
    handleDelete,
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
    <div className="page-card">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h1 className="h3 mb-1">Tasks</h1>
          <p className="text-muted mb-0">CRUD simples de tarefas.</p>
        </div>
        <NewItemButton label="Criar tarefa" onClick={() => createModal.open('create')} />
      </div>

      <TasksTable
        tasks={tasksQuery.data ?? []}
        isLoading={tasksQuery.isLoading}
        isError={tasksQuery.isError}
        isDeleting={deleteMutation.isPending}
        onView={(id) => openModal(id, 'view')}
        onEdit={(id) => openModal(id, 'edit')}
        onDelete={handleDelete}
      />

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
        teams={teamsQuery.data ?? []}
        isTeamsLoading={teamsQuery.isLoading}
        userChoices={userChoices}
        isUserChoicesLoading={userChoicesQuery.isLoading}
        onSubmit={handleEditSubmit}
        onClose={closeModal}
        isSaving={updateMutation.isPending}
        saveError={updateMutation.isError}
      />

      <TaskCreateModal
        isOpen={createModal.isOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        priorityLevels={priorityLevels}
        isPriorityLoading={priorityLevelsQuery.isLoading}
        teams={teamsQuery.data ?? []}
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


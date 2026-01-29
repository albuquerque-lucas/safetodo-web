import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from '../api/tasks'
import type { TaskEditFormState, TaskCreateFormState } from '../types/tasks'
import { confirmDeletion } from '../utils/swalMessages'
import { defaultCreateForm, defaultEditForm, toIsoOrNull, toNumberOrUndefined } from '../utils/taskUtils'
import useModalState from './useModalState'

const useTasksPageController = () => {
  const queryClient = useQueryClient()
  const storedUserId = localStorage.getItem('auth_user_id') ?? ''
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [createForm, setCreateForm] =
    useState<TaskCreateFormState>(defaultCreateForm)
  const [editForm, setEditForm] = useState<TaskEditFormState>(defaultEditForm)
  const createModal = useModalState<'create'>()
  const taskModal = useModalState<'view' | 'edit', number>()

  const tasksQuery = useQuery({
    queryKey: ['tasks', storedUserId, page, pageSize],
    queryFn: () => getTasks({ page, pageSize }),
  })

  const taskQuery = useQuery({
    queryKey: ['task', taskModal.selectedId, storedUserId],
    queryFn: () => getTask(taskModal.selectedId as number),
    enabled: taskModal.selectedId !== null,
  })

  const setEditFormFromTask = (task: (typeof taskQuery)['data']) => {
    if (!task) {
      return
    }
    setEditForm({
      title: task.title ?? '',
      description: task.description ?? '',
      status: task.status,
      priority_level: task.priority_level ? String(task.priority_level) : '',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
      user: String(task.user ?? ''),
      team: task.team ? String(task.team) : '',
    })
  }

  useEffect(() => {
    if (taskModal.mode === 'edit' && taskQuery.data) {
      setEditFormFromTask(taskQuery.data)
    }
  }, [taskModal.mode, taskQuery.data])

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setCreateForm(defaultCreateForm)
      createModal.close()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof updateTask>[1]
    }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      if (taskModal.selectedId) {
        queryClient.invalidateQueries({ queryKey: ['task', taskModal.selectedId] })
      }
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      taskModal.close()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
    },
  })

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      title: createForm.title.trim(),
      description: createForm.description.trim() || null,
      priority_level: toNumberOrUndefined(createForm.priority_level),
      due_date: toIsoOrNull(createForm.due_date),
      user: toNumberOrUndefined(createForm.user),
      team: toNumberOrUndefined(createForm.team),
    })
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!taskModal.selectedId) {
      return
    }
    updateMutation.mutate({
      id: taskModal.selectedId,
      payload: {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        status: editForm.status,
        priority_level: toNumberOrUndefined(editForm.priority_level),
        due_date: toIsoOrNull(editForm.due_date),
        user: toNumberOrUndefined(editForm.user),
        team: toNumberOrUndefined(editForm.team),
      },
    })
  }

  const openModal = (id: number, mode: 'view' | 'edit') => {
    taskModal.open(mode, id)
  }

  const enterEditMode = () => {
    if (taskModal.selectedId) {
      taskModal.open('edit', taskModal.selectedId)
    }
  }

  const cancelEditMode = () => {
    setEditFormFromTask(taskQuery.data)
    if (taskModal.selectedId) {
      taskModal.open('view', taskModal.selectedId)
    }
  }

  const closeModal = () => {
    taskModal.close()
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDeletion('Essa tarefa sera removida.')
    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  return {
    page,
    pageSize,
    setPage,
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
    enterEditMode,
    cancelEditMode,
  }
}

export default useTasksPageController

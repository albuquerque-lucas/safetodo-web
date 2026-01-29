import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTeam,
  deleteTeam,
  getTeam,
  getTeams,
  getTeamTasks,
  updateTeam,
} from '../api/teams'
import { createTask } from '../api/tasks'
import { getPriorityLevels } from '../api/priorityLevels'
import { getUserChoices } from '../api/users'
import type {
  TeamCreateFormState,
  TeamEditFormState,
  TeamTaskFormState,
} from '../types/teams'
import {
  defaultCreateForm,
  defaultEditForm,
  defaultTeamTaskForm,
  toIsoOrNull,
  toNumberOrUndefined,
} from '../utils/teamUtils'
import { confirmDeletion } from '../utils/swalMessages'
import useModalState from './useModalState'

const useTeamsPageController = () => {
  const queryClient = useQueryClient()
  const [createForm, setCreateForm] =
    useState<TeamCreateFormState>(defaultCreateForm)
  const [editForm, setEditForm] = useState<TeamEditFormState>(defaultEditForm)
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general')
  const [viewTab, setViewTab] = useState<'info' | 'tasks'>('info')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [teamTaskForm, setTeamTaskForm] =
    useState<TeamTaskFormState>(defaultTeamTaskForm)

  const createModal = useModalState<'create'>()
  const teamModal = useModalState<'view' | 'edit', number>()
  const teamTaskModal = useModalState<'create'>()

  const selectedTeamId = teamModal.selectedId

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const teamQuery = useQuery({
    queryKey: ['team', selectedTeamId],
    queryFn: () => getTeam(selectedTeamId as number),
    enabled: selectedTeamId !== null && teamModal.isOpen,
  })

  const userChoicesQuery = useQuery({
    queryKey: ['user-choices', 'teams'],
    queryFn: () => getUserChoices({ pageSize: 200 }),
  })

  const teamTasksQuery = useQuery({
    queryKey: ['team-tasks', selectedTeamId],
    queryFn: () => getTeamTasks(selectedTeamId as number),
    enabled:
      teamModal.isOpen && teamModal.mode === 'view' && selectedTeamId !== null,
  })

  const teamUserChoicesQuery = useQuery({
    queryKey: ['user-choices', 'team', selectedTeamId],
    queryFn: () =>
      getUserChoices({ teamId: selectedTeamId ?? undefined, pageSize: 200 }),
    enabled:
      teamModal.isOpen && teamModal.mode === 'view' && selectedTeamId !== null,
  })

  const priorityLevelsQuery = useQuery({
    queryKey: ['priority-levels'],
    queryFn: getPriorityLevels,
  })

  const userChoices = userChoicesQuery.data?.results ?? []
  const teamUserChoices = teamUserChoicesQuery.data?.results ?? []

  useEffect(() => {
    if (teamModal.mode === 'edit' && teamModal.isOpen && teamQuery.data) {
      const team = teamQuery.data
      setEditForm({
        name: team.name ?? '',
        description: team.description ?? '',
        members: team.members ?? [],
        managers: team.managers ?? [],
      })
    }
  }, [teamModal.mode, teamModal.isOpen, teamQuery.data])

  useEffect(() => {
    if (!createModal.isOpen) {
      setActiveTab('general')
      setSelectedMemberId('')
    }
  }, [createModal.isOpen])

  useEffect(() => {
    if (teamTaskModal.isOpen && !teamTaskForm.user && teamUserChoices.length > 0) {
      setTeamTaskForm((current) => ({
        ...current,
        user: String(teamUserChoices[0].id),
      }))
    }
  }, [teamTaskModal.isOpen, teamTaskForm.user, teamUserChoices])

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
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
      payload: Parameters<typeof updateTeam>[1]
    }) => updateTeam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      if (selectedTeamId) {
        queryClient.invalidateQueries({ queryKey: ['team', selectedTeamId] })
      }
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      teamModal.close()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-tasks', selectedTeamId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      teamTaskModal.close()
      setTeamTaskForm(defaultTeamTaskForm)
    },
  })

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      name: createForm.name.trim(),
      description: createForm.description.trim() || null,
      members: createForm.members,
      managers: createForm.managers,
    })
  }

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTeamId) {
      return
    }
    updateMutation.mutate({
      id: selectedTeamId,
      payload: {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        members: editForm.members,
        managers: editForm.managers,
      },
    })
  }

  const handleTeamTaskCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTeamId) {
      return
    }
    createTaskMutation.mutate({
      title: teamTaskForm.title.trim(),
      description: teamTaskForm.description.trim() || null,
      priority_level: toNumberOrUndefined(teamTaskForm.priority_level),
      due_date: toIsoOrNull(teamTaskForm.due_date),
      user: toNumberOrUndefined(teamTaskForm.user),
      team: selectedTeamId,
    })
  }

  const openTeamModal = (id: number, mode: 'view' | 'edit') => {
    teamModal.open(mode, id)
  }

  const closeTeamModal = () => {
    teamModal.close()
    setSelectedMemberId('')
    setActiveTab('general')
    setViewTab('info')
    setTeamTaskForm(defaultTeamTaskForm)
    teamTaskModal.close()
  }

  const closeCreateModal = () => {
    createModal.close()
    setActiveTab('general')
    setSelectedMemberId('')
  }

  const closeTeamTaskModal = () => {
    teamTaskModal.close()
    setTeamTaskForm(defaultTeamTaskForm)
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDeletion('Essa equipe sera removida.')
    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  return {
    teamsQuery,
    teamQuery,
    teamTasksQuery,
    userChoicesQuery,
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
  }
}

export default useTeamsPageController

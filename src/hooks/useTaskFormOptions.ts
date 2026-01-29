import { useEffect, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPriorityLevels } from '../api/priorityLevels'
import { getTeams } from '../api/teams'
import { getUserChoices } from '../api/users'
import type { TaskCreateFormState, TaskEditFormState } from '../types/tasks'

type UseTaskFormOptionsParams = {
  modalMode: 'view' | 'edit' | null
  isCreateOpen: boolean
  createForm: TaskCreateFormState
  editForm: TaskEditFormState
  setCreateForm: Dispatch<SetStateAction<TaskCreateFormState>>
  setEditForm: Dispatch<SetStateAction<TaskEditFormState>>
}

const useTaskFormOptions = ({
  modalMode,
  isCreateOpen,
  createForm,
  editForm,
  setCreateForm,
  setEditForm,
}: UseTaskFormOptionsParams) => {
  const priorityLevelsQuery = useQuery({
    queryKey: ['priority-levels'],
    queryFn: getPriorityLevels,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const activeTeamId =
    modalMode === 'edit' ? editForm.team : isCreateOpen ? createForm.team : ''

  const userChoicesQuery = useQuery({
    queryKey: ['user-choices', activeTeamId],
    queryFn: () =>
      getUserChoices({
        teamId: activeTeamId ? Number(activeTeamId) : undefined,
        pageSize: 200,
      }),
    enabled: !!activeTeamId,
  })

  const priorityLevels = useMemo(
    () =>
      (priorityLevelsQuery.data ?? [])
        .slice()
        .sort((leftLevel, rightLevel) => leftLevel.level - rightLevel.level),
    [priorityLevelsQuery.data],
  )

  const userChoices = userChoicesQuery.data?.results ?? []

  useEffect(() => {
    const teams = teamsQuery.data?.results ?? []
    if (teams.length === 1) {
      const teamId = String(teams[0].id)
      setCreateForm((current) =>
        current.team ? current : { ...current, team: teamId },
      )
      setEditForm((current) =>
        current.team ? current : { ...current, team: teamId },
      )
    }
  }, [teamsQuery.data, setCreateForm, setEditForm])

  useEffect(() => {
    if (!createForm.user && userChoices.length > 0) {
      setCreateForm((current) => ({
        ...current,
        user: String(userChoices[0].id),
      }))
    }
  }, [createForm.user, setCreateForm, userChoices])

  useEffect(() => {
    if (isCreateOpen) {
      setCreateForm((current) => ({
        ...current,
        user: '',
      }))
    }
  }, [createForm.team, isCreateOpen, setCreateForm])

  return {
    activeTeamId,
    priorityLevelsQuery,
    priorityLevels,
    teamsQuery,
    userChoicesQuery,
    userChoices,
  }
}

export default useTaskFormOptions

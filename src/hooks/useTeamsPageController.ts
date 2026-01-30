/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTeam, deleteTeam, getTeams } from '../api/teams'
import { getUserChoices } from '../api/users'
import type { TeamCreateFormState } from '../types/teams'
import { defaultCreateForm } from '../utils/teamUtils'
import { confirmDeletion } from '../utils/swalMessages'
import useModalState from './useModalState'
import useTableSorting from './useTableSorting'

const useTeamsPageController = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { sortBy, sortDir, ordering, toggleSort } = useTableSorting({
    defaultSortBy: 'created_at',
  })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [createForm, setCreateForm] =
    useState<TeamCreateFormState>(defaultCreateForm)
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general')
  const [selectedMemberId, setSelectedMemberId] = useState('')

  const createModal = useModalState<'create'>()

  const teamsQuery = useQuery({
    queryKey: ['teams', page, pageSize, ordering, search],
    queryFn: () => getTeams({ page, pageSize, ordering, search }),
    placeholderData: keepPreviousData,
  })

  const userChoicesQuery = useQuery({
    queryKey: ['user-choices', 'teams'],
    queryFn: () => getUserChoices({ pageSize: 200 }),
  })

  const userChoices = userChoicesQuery.data?.results ?? []

  useEffect(() => {
    if (!createModal.isOpen) {
      setActiveTab('general')
      setSelectedMemberId('')
    }
  }, [createModal.isOpen])

  useEffect(() => {
    setPage(1)
  }, [ordering, search])

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setSearch(searchInput.trim())
    }, 300)
    return () => window.clearTimeout(handler)
  }, [searchInput])

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
      setCreateForm(defaultCreateForm)
      createModal.close()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'], exact: false })
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

  const closeCreateModal = () => {
    createModal.close()
    setActiveTab('general')
    setSelectedMemberId('')
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDeletion('Essa equipe sera removida.')
    if (confirmed) {
      deleteMutation.mutate(id)
    }
  }

  return {
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
    userChoicesQuery,
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
  }
}

export default useTeamsPageController

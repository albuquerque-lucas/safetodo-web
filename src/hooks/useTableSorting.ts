import { useMemo, useState } from 'react'

export type SortDir = 'asc' | 'desc'

type UseTableSortingOptions = {
  defaultSortBy: string
  defaultSortDir?: SortDir
}

const useTableSorting = ({
  defaultSortBy,
  defaultSortDir = 'desc',
}: UseTableSortingOptions) => {
  const [sortBy, setSortBy] = useState(defaultSortBy)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir)

  const toggleSort = (key: string) => {
    if (key !== sortBy) {
      setSortBy(key)
      setSortDir(defaultSortDir)
      return
    }
    setSortDir((current) => (current === 'desc' ? 'asc' : 'desc'))
  }

  const ordering = useMemo(
    () => `${sortDir === 'desc' ? '-' : ''}${sortBy}`,
    [sortBy, sortDir],
  )

  return {
    sortBy,
    sortDir,
    ordering,
    setSortBy,
    setSortDir,
    toggleSort,
  }
}

export default useTableSorting

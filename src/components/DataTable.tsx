import type React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'

type DataTableColumn<T> = {
  header: string
  headerClassName?: string
  className?: string
  cellClassName?: string
  render: (row: T) => React.ReactNode
  sortKey?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  ellipsis?: boolean
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  emptyMessage: string
  rowKey: (row: T) => React.Key
  tableClassName?: string
  headClassName?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  useFixedLayout?: boolean
}

const DataTable = <T,>({
  columns,
  data,
  emptyMessage,
  rowKey,
  tableClassName = 'table table-hover align-middle',
  headClassName = 'table-light',
  sortBy,
  sortDir,
  onSort,
  useFixedLayout = false,
}: DataTableProps<T>) => {
  const hasData = data.length > 0
  const tableClasses = [
    tableClassName,
    useFixedLayout ? 'datatable-table-fixed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="table-responsive datatable-scroll-wrapper">
      <table className={tableClasses}>
        <thead className={headClassName}>
          <tr>
            {columns.map((column, index) => {
              const isSortable = !!column.sortKey && !!onSort
              const isActive = isSortable && column.sortKey === sortBy
              const indicator =
                isActive && sortDir ? (sortDir === 'asc' ? 'up' : 'down') : 'neutral'
              const sortLabel =
                isActive && sortDir ? (sortDir === 'asc' ? 'asc' : 'desc') : 'none'
              const thStyle = {
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }

              return (
                <th
                  key={`${column.header}-${index}`}
                  className={column.headerClassName}
                  aria-sort={
                    isActive
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  style={thStyle}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      className={`datatable-sortable-header ${isActive ? 'is-active' : ''}`}
                      onClick={() => onSort?.(column.sortKey as string)}
                      aria-label={`Ordenar por ${column.header} (${sortLabel})`}
                    >
                      <span>{column.header}</span>
                      <span className={`datatable-sort-icon is-${indicator}`}>
                        <FontAwesomeIcon
                          icon={
                            indicator === 'neutral'
                              ? faSort
                              : indicator === 'up'
                              ? faSortUp
                              : faSortDown
                          }
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {hasData ? (
            data.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column, index) => {
                  const content = column.render(row)
                  const title =
                    column.ellipsis && (typeof content === 'string' || typeof content === 'number')
                      ? String(content)
                      : undefined

                  return (
                    <td
                      key={`${rowKey(row)}-${index}`}
                      className={[
                        column.className,
                        column.cellClassName,
                        column.ellipsis ? 'datatable-cell-ellipsis' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={title}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable

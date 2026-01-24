import type React from 'react'

type DataTableColumn<T> = {
  header: string
  headerClassName?: string
  className?: string
  render: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  emptyMessage: string
  rowKey: (row: T) => React.Key
  tableClassName?: string
  headClassName?: string
}

const DataTable = <T,>({
  columns,
  data,
  emptyMessage,
  rowKey,
  tableClassName = 'table table-hover align-middle',
  headClassName = 'table-light',
}: DataTableProps<T>) => {
  const hasData = data.length > 0

  return (
    <div className="table-responsive">
      <table className={tableClassName}>
        <thead className={headClassName}>
          <tr>
            {columns.map((column, index) => (
              <th key={`${column.header}-${index}`} className={column.headerClassName}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasData ? (
            data.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column, index) => (
                  <td key={`${rowKey(row)}-${index}`} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
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

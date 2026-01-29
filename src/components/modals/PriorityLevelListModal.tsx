import AppModal from '../AppModal'
import DataTable from '../DataTable'
import type { PriorityLevel } from '../../types/api'

type PriorityLevelListModalProps = {
  isOpen: boolean
  onClose: () => void
  priorityLevels: PriorityLevel[]
  isLoading: boolean
  isError: boolean
}

const PriorityLevelListModal = ({
  isOpen,
  onClose,
  priorityLevels,
  isLoading,
  isError,
}: PriorityLevelListModalProps) => (
  <AppModal isOpen={isOpen} title="Niveis de prioridade" onClose={onClose}>
    {isLoading ? (
      <div className="text-muted">Carregando niveis...</div>
    ) : isError ? (
      <div className="text-danger">Erro ao carregar niveis.</div>
    ) : (
      <DataTable
        columns={[
          { header: 'Nivel', render: (level) => level.level },
          { header: 'Nome', render: (level) => level.name },
          {
            header: 'Descricao',
            render: (level) => level.description || '-',
          },
          {
            header: 'Ativo',
            render: (level) => (level.is_active ? 'Sim' : 'Nao'),
          },
        ]}
        data={priorityLevels}
        emptyMessage="Nenhum nivel encontrado."
        rowKey={(level) => level.id}
      />
    )}
  </AppModal>
)

export default PriorityLevelListModal

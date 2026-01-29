import AppModal from '../AppModal'

type PriorityLevelListModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const PriorityLevelListModal = ({
  isOpen,
  onClose,
  children,
}: PriorityLevelListModalProps) => (
  <AppModal isOpen={isOpen} title="Niveis de prioridade" onClose={onClose}>
    {children}
  </AppModal>
)

export default PriorityLevelListModal

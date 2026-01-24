import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

type NewItemButtonProps = {
  label: string
  onClick: () => void
  className?: string
}

const NewItemButton = ({
  label,
  onClick,
  className = 'btn btn-dark',
}: NewItemButtonProps) => (
  <button className={className} type="button" onClick={onClick}>
    <FontAwesomeIcon icon={faPlus} className="me-2" />
    {label}
  </button>
)

export default NewItemButton

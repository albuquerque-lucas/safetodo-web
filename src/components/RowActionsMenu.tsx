import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'

type RowActionItem = {
  label: string
  onClick: () => void
  className?: string
  disabled?: boolean
}

type RowActionsMenuProps = {
  items: RowActionItem[]
  buttonLabel?: string
}

const RowActionsMenu = ({
  items,
  buttonLabel = 'Opcoes',
}: RowActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuPosition, setMenuPosition] = useState<{
    top: number
    right: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }
      const targetNode = event.target as Node
      const clickedInsideButton = containerRef.current.contains(targetNode)
      const clickedInsideMenu = menuRef.current?.contains(targetNode) ?? false
      if (!clickedInsideButton && !clickedInsideMenu) {
        setIsOpen(false)
      }
    }

    const handleReposition = () => {
      if (!buttonRef.current) {
        return
      }
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      })
    }

    const handleScroll = () => setIsOpen(false)

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleScroll, true)

    handleReposition()

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  return (
    <div className="dropdown" ref={containerRef}>
      <button
        className="btn btn-sm row-actions-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        ref={buttonRef}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
        <span className="visually-hidden">{buttonLabel}</span>
      </button>
      {isOpen && menuPosition
        ? createPortal(
            <div
              className="dropdown-menu show"
              ref={menuRef}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                right: menuPosition.right,
                zIndex: 1060,
              }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={item.className ?? 'dropdown-item'}
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export default RowActionsMenu

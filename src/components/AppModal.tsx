import type { CSSProperties, ReactNode } from 'react'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ModalSize = 'sm' | 'md' | 'lg'

type AppModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  animationMs?: number
  children: ReactNode
  footer?: ReactNode
}

let openModalCount = 0

const lockBodyScroll = () => {
  openModalCount += 1
  document.body.classList.add('modal-open')
}

const unlockBodyScroll = () => {
  openModalCount = Math.max(0, openModalCount - 1)
  if (openModalCount === 0) {
    document.body.classList.remove('modal-open')
  }
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5 },
  exit: { opacity: 0 },
}

const dialogVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

const SIZE_MAX_PX: Record<ModalSize, number> = {
  sm: 480,
  md: 640,
  lg: 960,
}

const MOBILE_VW = 95

const AppModal = ({
  isOpen,
  onClose,
  title,
  size = 'lg',
  animationMs = 200,
  children,
  footer,
}: AppModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return
    }
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const computedWidth = `min(${MOBILE_VW}vw, ${SIZE_MAX_PX[size]}px)`

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="modal-backdrop fade show"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: animationMs / 1000 }}
            style={{ zIndex: 1050 }}
          />

          <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-hidden="false"
            style={{ zIndex: 1055 }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
              style={
                {
                  ['--bs-modal-width']: computedWidth,
                  pointerEvents: 'none',
                } as CSSProperties
              }
            >
              <motion.div
                className="modal-content"
                variants={dialogVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: animationMs / 1000 }}
                style={{ width: '100%', margin: '0 auto', pointerEvents: 'auto' }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">{title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fechar"
                    onClick={onClose}
                  />
                </div>
                <div className="modal-body">{children}</div>
                {footer ? <div className="modal-footer">{footer}</div> : null}
              </motion.div>
            </div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default AppModal

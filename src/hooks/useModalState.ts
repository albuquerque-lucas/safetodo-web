import { useCallback, useEffect, useRef, useState } from 'react'

type SwitchArgs<TMode, TId> = {
  mode: TMode
  id?: TId
  delayMs?: number
}

const useModalState = <TMode extends string, TId = number>() => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<TMode | null>(null)
  const [selectedId, setSelectedId] = useState<TId | null>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const open = useCallback((nextMode: TMode, id?: TId) => {
    clearTimer()
    setMode(nextMode)
    setSelectedId(id ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    clearTimer()
    setIsOpen(false)
  }, [])

  const switchTo = useCallback(
    ({ mode: nextMode, id, delayMs = 200 }: SwitchArgs<TMode, TId>) => {
      clearTimer()
      setIsOpen(false)
      timerRef.current = window.setTimeout(() => {
        setMode(nextMode)
        setSelectedId(id ?? null)
        setIsOpen(true)
      }, delayMs)
    },
    [],
  )

  useEffect(() => () => clearTimer(), [])

  return {
    isOpen,
    mode,
    selectedId,
    setIsOpen,
    open,
    close,
    switchTo,
  }
}

export default useModalState

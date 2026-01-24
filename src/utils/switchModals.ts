export const switchModals = (
  closeSetter: (isOpen: boolean) => void,
  openSetter: (isOpen: boolean) => void,
  animationMs = 200,
) => {
  closeSetter(false)
  window.setTimeout(() => openSetter(true), animationMs)
}

import Swal from 'sweetalert2'

type SwalIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

type ConfirmActionOptions = {
  confirmText?: string
  cancelText?: string
  variant?: 'dark' | 'danger' | 'primary' | 'secondary'
}

export const triggerToast = (
  title: string,
  icon: SwalIcon,
  text?: string,
) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    title,
    text,
    icon,
  })
}

export const confirmDeletion = async (text: string): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Tem certeza que deseja excluir?',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#212529',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
  })

  return result.isConfirmed
}

export const alertError = async (
  title: string,
  text?: string,
): Promise<void> => {
  await Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545',
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
  })
}

export const confirmAction = async (
  title: string,
  text?: string,
  options?: ConfirmActionOptions,
): Promise<boolean> => {
  const {
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'dark',
  } = options || {}

  const variantClass =
    variant === 'danger'
      ? 'btn btn-danger'
      : variant === 'primary'
        ? 'btn btn-primary'
        : variant === 'secondary'
          ? 'btn btn-secondary'
          : 'btn btn-dark'

  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    buttonsStyling: false,
    customClass: {
      confirmButton: `${variantClass} w-100 my-1`,
      cancelButton: 'btn btn-secondary w-100 my-1',
    },
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    allowOutsideClick: false,
    allowEscapeKey: true,
  })

  return result.isConfirmed
}

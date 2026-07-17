export function hideModalSafely(modalElement, modalInstance) {
  if (modalElement?.contains(document.activeElement)) {
    document.activeElement.blur()
  }

  modalInstance?.hide()
}

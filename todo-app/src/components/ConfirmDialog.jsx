'use client'

export default function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'はい',
  cancelLabel = 'いいえ',
  loading = false,
}) {
  if (!open) return null

  return (
    <div className="confirm-overlay" role="presentation" onClick={loading ? undefined : onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </button>
          <button type="button" className="confirm-cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

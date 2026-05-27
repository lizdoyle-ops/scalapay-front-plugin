import { useEffect, ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  onConfirm: () => void
  confirmLabel?: string
  confirmDisabled?: boolean
  children: ReactNode
}

export default function Modal({
  title,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  children,
}: ModalProps) {
  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(26,26,46,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[14px] font-semibold text-[#1A1A2E]">{title}</h2>
        </div>

        {/* Body */}
        <div className="px-5 pb-3 text-[13px] text-gray-600">
          {children}
        </div>

        {/* Actions — cancel ABOVE confirm per spec */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-[13px] font-medium text-gray-600 border border-[#E0E0E0] bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="w-full py-2 rounded-lg text-[13px] font-semibold text-white bg-[#00B2A9] hover:bg-[#008B84] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

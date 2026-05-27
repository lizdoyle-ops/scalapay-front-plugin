import { useEffect, useState } from 'react'
import { ToastItem } from '../../context/CustomerContext'

interface ToastProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

function SingleToast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const bg = toast.type === 'error' ? 'bg-[#E63946]' : 'bg-[#00B2A9]'

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg text-white text-[12px] font-medium max-w-[280px] cursor-pointer transition-all duration-300 ${bg} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      onClick={onDismiss}
    >
      <span className="mt-0.5 flex-shrink-0 text-[14px]">
        {toast.type === 'error' ? '✕' : '✓'}
      </span>
      <span className="leading-snug">{toast.message}</span>
    </div>
  )
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  )
}

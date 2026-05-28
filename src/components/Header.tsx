import { useState } from 'react'
import { Customer } from '../mocks/customers'
import StatusBadge from './shared/StatusBadge'

interface HeaderProps {
  customer: Customer | null
  email: string | null
}

// Scalapay wordmark as inline SVG-free CSS
function Logo() {
  return (
    <span
      className="text-[18px] font-black tracking-tight select-none"
      style={{ color: '#00B2A9', letterSpacing: '-0.5px' }}
    >
      scalapay
    </span>
  )
}

// ── Seed demo emails button ────────────────────────────────────────────────────
function SeedEmailsButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleClick = async () => {
    if (status === 'loading') return
    setStatus('loading')
    try {
      const r = await fetch('/api/seed-emails', { method: 'POST' })
      if (!r.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const label =
    status === 'loading' ? 'Sending…'
    : status === 'done'  ? 'Sent ✓'
    : status === 'error' ? 'Failed ✗'
    : 'Send demo emails'

  const color =
    status === 'done'  ? '#2DC653'
    : status === 'error' ? '#E63946'
    : '#00B2A9'

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      title={label}
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-[#E6F7F6] disabled:opacity-50"
      style={{ color }}
    >
      {status === 'loading' ? (
        /* spinner */
        <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      ) : status === 'done' ? (
        /* check */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : status === 'error' ? (
        /* x */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      ) : (
        /* envelope */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <polyline points="2,4 12,13 22,4"/>
        </svg>
      )}
    </button>
  )
}

export default function Header({ customer, email }: HeaderProps) {
  return (
    <div className="flex-shrink-0 border-b border-[#E0E0E0] bg-white">
      {/* Brand row */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <SeedEmailsButton />
          {customer && <StatusBadge status={customer.accountStatus} />}
        </div>
      </div>

      {/* Customer identity row */}
      {customer ? (
        <div className="px-4 pb-3">
          <p className="text-[14px] font-semibold text-[#1A1A2E] leading-tight">
            {customer.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{customer.email}</p>
          {customer.type === 'merchant' && (
            <p className="text-[11px] text-[#00B2A9] font-medium mt-0.5">
              {(customer as any).businessName}
            </p>
          )}
        </div>
      ) : email ? (
        <div className="px-4 pb-3">
          <p className="text-[12px] text-gray-400">{email}</p>
        </div>
      ) : null}
    </div>
  )
}

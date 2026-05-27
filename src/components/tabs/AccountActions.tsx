import { useState } from 'react'
import { useCustomer } from '../../context/CustomerContext'
import { ConsumerCustomer } from '../../mocks/customers'
import StatusBadge from '../shared/StatusBadge'
import Modal from '../shared/Modal'

function fmt(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const REACTIVATION_REASONS = [
  'Identity verified',
  'False positive',
  'Dispute resolved',
]

export default function AccountActions() {
  const { customer, reactivateAccount, showToast } = useCustomer()
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [reactivateReason, setReactivateReason] = useState(REACTIVATION_REASONS[0])

  if (!customer || customer.type !== 'consumer') return null
  const c = customer as ConsumerCustomer

  const handleEscalate = () => {
    showToast("Assigned to fraud inbox, tag 'fraud-escalation' added")
  }

  const handlePasswordReset = () => {
    showToast(`Reset link sent to ${customer.email}`)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Suspension details card */}
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Suspension Details
          </p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3">
          <Detail label="Status">
            <StatusBadge status={c.accountStatus} />
          </Detail>
          <Detail label="Fraud Risk">
            <StatusBadge status={c.fraudRiskScore ?? 'low'} />
          </Detail>
          <Detail label="Suspended on">
            <span className="text-[13px] font-medium text-[#1A1A2E]">
              {fmt(c.suspensionDate)}
            </span>
          </Detail>
          <Detail label="Last Login">
            <span className="text-[13px] font-medium text-[#1A1A2E]">
              {fmt(c.lastLogin)}
            </span>
          </Detail>
          <Detail label="Reason" fullWidth>
            <span className="text-[13px] font-medium text-[#1A1A2E]">
              {c.suspensionReason ?? '—'}
            </span>
          </Detail>
          <Detail label="Failed Logins (7d)" fullWidth>
            <span className="text-[13px] font-medium text-[#1A1A2E]">
              {c.failedLogin7d ?? 0}
            </span>
          </Detail>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</p>

        {c.accountStatus === 'suspended' && (
          <button
            onClick={() => setShowReactivateModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#00B2A9] hover:bg-[#008B84] transition-colors shadow-sm"
          >
            <span>✓</span> Reactivate Account
          </button>
        )}

        <button
          onClick={handleEscalate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border border-[#E0E0E0] text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <span>↗</span> Escalate to Fraud Team
        </button>

        <button
          onClick={handlePasswordReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border border-[#E0E0E0] text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <span>⟳</span> Send Password Reset Link
        </button>
      </div>

      {/* Reactivate modal */}
      {showReactivateModal && (
        <Modal
          title="Reactivate Account"
          onClose={() => setShowReactivateModal(false)}
          onConfirm={() => {
            reactivateAccount(reactivateReason)
            setShowReactivateModal(false)
          }}
          confirmLabel="Confirm Reactivation"
        >
          <div className="mt-2 space-y-3">
            <p className="text-gray-600">
              Reactivate account for{' '}
              <span className="font-semibold text-[#1A1A2E]">{customer.name}</span>?
            </p>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Reason</label>
              <select
                value={reactivateReason}
                onChange={e => setReactivateReason(e.target.value)}
              >
                {REACTIVATION_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-gray-400">
              An internal comment will be added to this conversation.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Detail({
  label,
  children,
  fullWidth,
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      {children}
    </div>
  )
}

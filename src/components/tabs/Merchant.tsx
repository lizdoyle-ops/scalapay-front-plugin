import { useState } from 'react'
import { useCustomer } from '../../context/CustomerContext'
import { MerchantCustomer, JiraTicket } from '../../mocks/customers'
import StatusBadge from '../shared/StatusBadge'
import Modal from '../shared/Modal'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
const TYPES = ['Bug', 'Integration Issue', 'Feature Request'] as const

function fmtEuro(n: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

// ── CSS bar chart ─────────────────────────────────────────────────────────────
function VolumeChart({ volumes }: { volumes: { month: string; amount: number }[] }) {
  const max = Math.max(...volumes.map(v => v.amount))

  return (
    <div className="flex items-end justify-around gap-2 pt-2 pb-1" style={{ height: 100 }}>
      {volumes.map(v => {
        const heightPct = max > 0 ? (v.amount / max) * 72 : 0
        return (
          <div key={v.month} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-semibold text-[#008B84]">
              {fmtEuro(v.amount)}
            </span>
            <div
              className="w-full rounded-t-md bg-[#00B2A9] transition-all"
              style={{ height: `${heightPct}px`, minHeight: 2 }}
            />
            <span className="text-[11px] text-gray-500 font-medium">{v.month}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Jira ticket row ───────────────────────────────────────────────────────────
function TicketRow({ ticket }: { ticket: JiraTicket }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-[#F0F0F0] last:border-0">
      <span className="font-mono text-[11px] text-gray-400 flex-shrink-0 mt-0.5 w-20">
        [{ticket.id}]
      </span>
      <span className="text-[12px] text-[#1A1A2E] flex-1 min-w-0">
        {ticket.summary}
      </span>
      <div className="flex gap-1 flex-shrink-0">
        <StatusBadge status={ticket.status} size="sm" />
        <StatusBadge status={ticket.priority} size="sm" />
      </div>
    </div>
  )
}

// ── Tab root ──────────────────────────────────────────────────────────────────
export default function Merchant() {
  const { customer, addJiraTicket } = useCustomer()
  const [showModal, setShowModal] = useState(false)
  const [summary, setSummary] = useState('')
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('Medium')
  const [type, setType] = useState<typeof TYPES[number]>('Bug')

  if (!customer || customer.type !== 'merchant') return null
  const m = customer as MerchantCustomer

  const defaultSummary = `Support escalation — ${m.businessName}`

  const handleOpenModal = () => {
    setSummary(defaultSummary)
    setPriority('Medium')
    setType('Bug')
    setShowModal(true)
  }

  const handleCreate = () => {
    addJiraTicket({
      summary,
      status: 'Open',
      priority,
    })
    setShowModal(false)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Merchant info */}
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Merchant Profile
          </p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3">
          <Detail label="Business" value={m.businessName} fullWidth />
          <Detail label="Integration" value={m.integrationType} />
          <Detail label="Account Manager" value={m.accountManager} />
        </div>
      </div>

      {/* Monthly volume */}
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Monthly Volume (GMV)
          </p>
        </div>
        <div className="px-4 py-3">
          <VolumeChart volumes={m.monthlyVolume} />
        </div>
      </div>

      {/* API health */}
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            API Health
          </p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {m.apiErrors24h > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  ⚠ {m.apiErrors24h} API error{m.apiErrors24h !== 1 ? 's' : ''} in 24h
                </span>
              </div>
              {m.lastErrorCode && (
                <div className="text-[11px] text-gray-500 space-y-0.5 pl-1">
                  <p>
                    <span className="text-gray-400">Last error:</span>{' '}
                    <span className="font-mono font-medium text-[#E63946]">{m.lastErrorCode}</span>
                  </p>
                  {m.lastErrorTime && (
                    <p>
                      <span className="text-gray-400">Time:</span>{' '}
                      <span className="text-[#1A1A2E]">{m.lastErrorTime}</span>
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              ✓ All systems healthy
            </span>
          )}
        </div>
      </div>

      {/* Jira tickets */}
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center justify-between">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Jira Tickets
          </p>
          <span className="text-[11px] text-gray-400">{m.jiraTickets.length}</span>
        </div>
        <div className="px-4">
          {m.jiraTickets.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-gray-400">No open tickets</p>
          ) : (
            m.jiraTickets.map(t => <TicketRow key={t.id} ticket={t} />)
          )}
        </div>
        <div className="px-4 py-3 border-t border-[#E0E0E0]">
          <button
            onClick={handleOpenModal}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-semibold text-white bg-[#00B2A9] hover:bg-[#008B84] transition-colors"
          >
            <span>+</span> Create Jira Ticket
          </button>
        </div>
      </div>

      {/* Create ticket modal */}
      {showModal && (
        <Modal
          title="Create Jira Ticket"
          onClose={() => setShowModal(false)}
          onConfirm={handleCreate}
          confirmLabel="Create Ticket"
          confirmDisabled={!summary.trim()}
        >
          <div className="mt-2 space-y-3">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Summary</label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Ticket summary…"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as typeof priority)}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value as typeof type)}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Detail({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-[#1A1A2E]">{value}</p>
    </div>
  )
}

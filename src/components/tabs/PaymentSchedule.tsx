import { useState } from 'react'
import { useCustomer } from '../../context/CustomerContext'
import { Order, Installment } from '../../mocks/customers'
import { updateRefundSchedule } from '../../api/orders'
import ApiBanner from '../shared/ApiBanner'
import Modal from '../shared/Modal'

const TODAY = '2026-05-27'

function fmt(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function statusColor(status: string) {
  if (status === 'paid')    return 'text-[#2DC653]'
  if (status === 'overdue') return 'text-[#E63946] font-semibold'
  return 'text-gray-500'
}

function statusLabel(status: string) {
  if (status === 'paid')    return 'Paid'
  if (status === 'overdue') return 'Overdue'
  return 'Upcoming'
}

function nextInstallment(order: Order): Installment | null {
  return order.installments.find(i => i.status !== 'paid') ?? null
}

// ── Single plan card ──────────────────────────────────────────────────────────
function PlanCard({ order }: { order: Order }) {
  const { reschedulePayment } = useCustomer()
  const [showModal, setShowModal] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const next = nextInstallment(order)
  const isOverdue = next?.status === 'overdue'
  const allPaid = order.installments.every(i => i.status === 'paid')

  const calloutBorder = isOverdue ? 'border-[#E63946] bg-red-50' : 'border-[#00B2A9] bg-[#E6F7F6]'
  const calloutText  = isOverdue ? 'text-[#E63946]' : 'text-[#008B84]'

  const openModal = () => {
    setNewDate(next?.date ?? '')
    setApiError(null)
    setShowModal(true)
  }

  const handleConfirm = async () => {
    if (!next || !newDate) return
    setSaving(true)
    setApiError(null)

    try {
      await updateRefundSchedule(order.id, {
        installmentNumber: next.number,
        dueDate: newDate,
      })
      // API confirmed — update mock state and close
      reschedulePayment(order.id, next.number, newDate)
      setShowModal(false)
    } catch {
      // API failed — still apply locally, surface a warning
      reschedulePayment(order.id, next.number, newDate)
      setApiError('API sync failed — rescheduled locally. Changes will sync when connection is restored.')
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        {/* Inline API error banner (shown after a failed reschedule) */}
        {apiError && (
          <div className="px-4 pt-3">
            <ApiBanner variant="warning" message={apiError} />
          </div>
        )}

        {/* Plan header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#1A1A2E]">{order.merchant}</span>
            <span className="text-[13px] font-bold text-[#1A1A2E]">€{order.total.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Purchased {fmt(order.purchaseDate)} · {order.numInstallments} installments
          </p>
        </div>

        {/* Next payment callout */}
        {!allPaid && next && (
          <div className={`mx-4 mb-3 rounded-lg border-2 px-3 py-2 ${calloutBorder}`}>
            {isOverdue ? (
              <p className={`text-[12px] font-semibold ${calloutText}`}>
                ⚠ OVERDUE since {fmt(next.date)} — €{next.amount.toFixed(2)}
              </p>
            ) : (
              <p className={`text-[12px] font-medium ${calloutText}`}>
                Next payment: <span className="font-bold">€{next.amount.toFixed(2)}</span> due {fmt(next.date)}
              </p>
            )}
          </div>
        )}

        {allPaid && (
          <div className="mx-4 mb-3 rounded-lg border-2 border-[#2DC653] bg-green-50 px-3 py-2">
            <p className="text-[12px] font-semibold text-green-700">✓ All installments paid</p>
          </div>
        )}

        {/* Installment table */}
        <div className="border-t border-[#E0E0E0]">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-1.5 text-left text-gray-400 font-medium">#</th>
                <th className="px-4 py-1.5 text-left text-gray-400 font-medium">Due date</th>
                <th className="px-4 py-1.5 text-right text-gray-400 font-medium">Amount</th>
                <th className="px-4 py-1.5 text-right text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {order.installments.map(inst => (
                <tr
                  key={inst.number}
                  className={`border-t border-[#F0F0F0] ${inst.status === 'overdue' ? 'bg-red-50' : ''}`}
                >
                  <td className="px-4 py-2 text-gray-500">{inst.number}</td>
                  <td className="px-4 py-2 text-gray-700">{fmt(inst.date)}</td>
                  <td className="px-4 py-2 text-right font-medium">€{inst.amount.toFixed(2)}</td>
                  <td className={`px-4 py-2 text-right ${statusColor(inst.status)}`}>
                    {statusLabel(inst.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reschedule button */}
        {next && (
          <div className="px-4 py-3 border-t border-[#E0E0E0]">
            <button
              onClick={openModal}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium border border-[#E0E0E0] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>↻</span> Reschedule Next Payment
            </button>
          </div>
        )}
      </div>

      {/* Reschedule modal */}
      {showModal && next && (
        <Modal
          title="Reschedule Next Payment"
          onClose={() => { if (!saving) setShowModal(false) }}
          onConfirm={handleConfirm}
          confirmLabel={saving ? 'Saving…' : 'Confirm Reschedule'}
          confirmDisabled={!newDate || saving}
        >
          <div className="mt-2 space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Current due date</span>
              <span className="font-semibold">{fmt(next.date)}</span>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                New due date (max +30 days)
              </label>
              <input
                type="date"
                value={newDate}
                min={TODAY}
                max={addDays(TODAY, 30)}
                onChange={e => setNewDate(e.target.value)}
                disabled={saving}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              The updated schedule will be synced via{' '}
              <span className="font-mono">PATCH /orders/{order.id}/schedule</span>.
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Tab root ──────────────────────────────────────────────────────────────────
export default function PaymentSchedule() {
  const { customer } = useCustomer()
  if (!customer) return null

  const activePlans    = customer.orders.filter(o => o.installments.some(i => i.status !== 'paid'))
  const completedPlans = customer.orders.filter(o => o.installments.every(i => i.status === 'paid'))

  if (!customer.orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <span className="text-2xl mb-2">💳</span>
        <p className="text-[12px]">No payment plans</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {activePlans.length > 0 && (
        <section className="space-y-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Active Plans</p>
          {activePlans.map(o => <PlanCard key={o.id} order={o} />)}
        </section>
      )}
      {completedPlans.length > 0 && (
        <section className="space-y-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Completed Plans</p>
          {completedPlans.map(o => <PlanCard key={o.id} order={o} />)}
        </section>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useCustomer } from '../../context/CustomerContext'
import { Order, Installment } from '../../mocks/customers'
import { getRefundOrder } from '../../api/orders'
import { ApiRefundOrder } from '../../api/types'
import StatusBadge from '../shared/StatusBadge'
import ApiBanner from '../shared/ApiBanner'
import Modal from '../shared/Modal'

type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

function fmt(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtEuro(n: number) {
  return '€' + n.toFixed(2)
}

// ── Merge API response onto the mock Order ────────────────────────────────────
function mergeApiData(order: Order, api: ApiRefundOrder): Order {
  return {
    ...order,
    refundStatus: api.refundStatus,
    refundAmount: api.refundAmount ?? order.refundAmount,
    refundRequestedAt: api.refundRequestedAt ?? order.refundRequestedAt,
    installments: api.installments.map(i => ({
      number: i.number,
      amount: i.amount,
      status: i.status,
      date: i.dueDate,
    })),
  }
}

// ── Installment progress bar ──────────────────────────────────────────────────
function ProgressBar({ installments }: { installments: Installment[] }) {
  const COLOR: Record<string, string> = {
    paid:    'bg-[#00B2A9]',
    due:     'bg-gray-200',
    overdue: 'bg-[#E63946]',
  }
  return (
    <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
      {installments.map(inst => (
        <div key={inst.number} className={`flex-1 ${COLOR[inst.status] ?? 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

const paidCount = (installments: Installment[]) =>
  installments.filter(i => i.status === 'paid').length

// ── Refund badge ──────────────────────────────────────────────────────────────
function RefundBadge({ order }: { order: Order }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <StatusBadge status={order.refundStatus} size="sm" />
      {order.refundStatus === 'requested' && order.refundRequestedAt && (
        <span className="text-gray-400 text-[10px]">· {fmt(order.refundRequestedAt)}</span>
      )}
    </span>
  )
}

// ── Single order card ─────────────────────────────────────────────────────────
function OrderCard({ order: initialOrder }: { order: Order }) {
  const { approveRefund, showToast } = useCustomer()
  const [expanded, setExpanded] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)

  // Live data state — fetched once on first expand
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle')
  const [liveOrder, setLiveOrder] = useState<Order | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)

  // Approving refund locally may update refundStatus — track that too
  const [localOverrides, setLocalOverrides] = useState<Partial<Order>>({})

  // Resolved order: approved overrides → live API data → mock data
  const displayOrder: Order = { ...initialOrder, ...liveOrder, ...localOverrides } as Order

  const hasOverdue = displayOrder.installments.some(i => i.status === 'overdue')
  const paid = paidCount(displayOrder.installments)
  const total = displayOrder.installments.length

  // Fetch live refund data on first expand
  useEffect(() => {
    if (!expanded || apiStatus !== 'idle') return

    setApiStatus('loading')
    getRefundOrder(initialOrder.id)
      .then(apiData => {
        setLiveOrder(mergeApiData(initialOrder, apiData))
        setFetchedAt(apiData.fetchedAt)
        setApiStatus('success')
      })
      .catch(() => {
        setApiStatus('error')
      })
  }, [expanded, apiStatus, initialOrder])

  const handleFlagReview = () => {
    showToast("Tag 'refund-review' added to conversation")
  }

  return (
    <>
      <div className="rounded-xl border border-[#E0E0E0] bg-white overflow-hidden">
        {/* Card header */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] text-gray-400 flex-shrink-0">
                #{displayOrder.id}
              </span>
              <span className="text-[13px] font-semibold text-[#1A1A2E] truncate">
                {displayOrder.merchant}
              </span>
            </div>
            <span className="text-[13px] font-bold text-[#1A1A2E] flex-shrink-0">
              {fmtEuro(displayOrder.total)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {fmt(displayOrder.purchaseDate)}
            {hasOverdue && (
              <span className="ml-2 text-[#E63946] font-medium">⚠ Overdue payment</span>
            )}
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <ProgressBar installments={displayOrder.installments} />
          <p className="text-[10px] text-gray-400 mt-1">
            {paid} of {total} installment{total !== 1 ? 's' : ''} paid
          </p>
        </div>

        {/* Refund status */}
        <div className="px-4 py-2 border-t border-[#E0E0E0] flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-medium">Refund:</span>
          <RefundBadge order={displayOrder} />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full px-4 py-2 text-left text-[11px] text-[#00B2A9] font-medium hover:bg-[#E6F7F6] transition-colors flex items-center gap-1.5 border-t border-[#E0E0E0]"
        >
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
          {expanded ? 'Hide' : 'Show'} installments
        </button>

        {/* Expanded section */}
        {expanded && (
          <div className="border-t border-[#E0E0E0]">
            {/* API status banner */}
            <div className="px-4 py-2 space-y-1.5">
              {apiStatus === 'loading' && (
                <ApiBanner variant="loading" message="Fetching live refund record…" />
              )}
              {apiStatus === 'error' && (
                <ApiBanner
                  variant="warning"
                  message="Could not reach live API — showing cached record. Changes will sync when connection is restored."
                />
              )}
              {apiStatus === 'success' && fetchedAt && (
                <ApiBanner
                  variant="live"
                  message={`Live data · refreshed ${new Date(fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
                />
              )}
            </div>

            {/* Installment table */}
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-1.5 text-left text-gray-400 font-medium">#</th>
                  <th className="px-4 py-1.5 text-left text-gray-400 font-medium">Due</th>
                  <th className="px-4 py-1.5 text-right text-gray-400 font-medium">Amount</th>
                  <th className="px-4 py-1.5 text-right text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayOrder.installments.map(inst => (
                  <tr
                    key={inst.number}
                    className={`border-t border-[#F0F0F0] ${inst.status === 'overdue' ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-2 text-gray-500">{inst.number}</td>
                    <td className="px-4 py-2 text-gray-700">{fmt(inst.date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{fmtEuro(inst.amount)}</td>
                    <td className="px-4 py-2 text-right">
                      <StatusBadge status={inst.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 py-3 border-t border-[#E0E0E0] flex gap-2">
          {displayOrder.refundStatus === 'requested' && (
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#00B2A9] hover:bg-[#008B84] transition-colors"
            >
              <span>✓</span> Approve Refund
            </button>
          )}
          <button
            onClick={handleFlagReview}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium border border-[#E0E0E0] text-gray-600 hover:bg-gray-50 transition-colors ${
              displayOrder.refundStatus === 'requested' ? '' : 'flex-1'
            }`}
          >
            <span>⚑</span> Flag
          </button>
        </div>
      </div>

      {/* Approve refund modal */}
      {showApproveModal && (
        <Modal
          title="Approve Refund"
          onClose={() => setShowApproveModal(false)}
          onConfirm={() => {
            approveRefund(displayOrder.id)
            setLocalOverrides({ refundStatus: 'approved' })
            setShowApproveModal(false)
          }}
          confirmLabel="Confirm"
        >
          <p className="mt-1">
            Approve refund of{' '}
            <span className="font-semibold text-[#1A1A2E]">
              {fmtEuro(displayOrder.refundAmount ?? displayOrder.total)}
            </span>{' '}
            for order{' '}
            <span className="font-mono font-semibold text-[#1A1A2E]">#{displayOrder.id}</span>?
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            An internal comment will be added to this conversation.
          </p>
        </Modal>
      )}
    </>
  )
}

// ── Tab root ──────────────────────────────────────────────────────────────────
export default function OrdersRefunds() {
  const { customer } = useCustomer()
  if (!customer) return null

  const sorted = [...customer.orders].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  )

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <span className="text-2xl mb-2">🛍</span>
        <p className="text-[12px]">No orders found</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] text-gray-400 font-medium">
        {sorted.length} order{sorted.length !== 1 ? 's' : ''}
      </p>
      {sorted.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

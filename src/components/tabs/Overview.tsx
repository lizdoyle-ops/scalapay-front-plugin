import { useCustomer } from '../../context/CustomerContext'
import StatusBadge from '../shared/StatusBadge'
import { ConsumerCustomer } from '../../mocks/customers'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(amount)
}

function memberSince(c: { orders: { purchaseDate: string }[] }) {
  if (!c.orders.length) return null
  const earliest = c.orders
    .map(o => o.purchaseDate)
    .sort()[0]
  return formatDate(earliest)
}

export default function Overview() {
  const { customer } = useCustomer()
  if (!customer) return null

  const consumer = customer.type === 'consumer' ? (customer as ConsumerCustomer) : null
  const since = memberSince(customer)

  return (
    <div className="p-4 space-y-4">
      {/* Suspension banner */}
      {consumer?.accountStatus === 'suspended' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-[12px] font-semibold text-red-700">
            Account suspended on {formatDate(consumer.suspensionDate)}
          </p>
          {consumer.suspensionReason && (
            <p className="text-[11px] text-red-600 mt-0.5">
              Reason: {consumer.suspensionReason}
            </p>
          )}
        </div>
      )}

      {/* Identity card */}
      <div className="rounded-xl border border-[#E0E0E0] bg-white divide-y divide-[#E0E0E0]">
        {/* Header row */}
        <div className="px-4 py-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-semibold text-[#1A1A2E]">{customer.name}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{customer.email}</p>
          </div>
          <StatusBadge status={customer.accountStatus} />
        </div>

        {/* Details grid */}
        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3">
          <Detail label="Language" value={customer.language} />
          <Detail label="Member since" value={since ?? '—'} />
          <Detail label="Lifetime orders" value={String(customer.lifetimeOrders)} />
          <Detail
            label="Total spend"
            value={customer.type === 'merchant' ? '—' : formatEuro(customer.lifetimeValue)}
          />
          {customer.type === 'merchant' && (
            <Detail label="Business" value={(customer as any).businessName} fullWidth />
          )}
        </div>
      </div>

      {/* Consumer-specific: suspension detail */}
      {consumer?.accountStatus === 'suspended' && (
        <div className="rounded-xl border border-red-200 bg-white divide-y divide-[#E0E0E0]">
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Suspension Detail
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Detail label="Fraud risk" value={<StatusBadge status={consumer.fraudRiskScore ?? 'low'} size="sm" />} />
              <Detail label="Last login" value={formatDate(consumer.lastLogin)} />
              <Detail label="Failed logins (7d)" value={String(consumer.failedLogin7d ?? 0)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({
  label,
  value,
  fullWidth,
}: {
  label: string
  value: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <div className="text-[13px] font-medium text-[#1A1A2E]">{value}</div>
    </div>
  )
}

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

export default function Header({ customer, email }: HeaderProps) {
  return (
    <div className="flex-shrink-0 border-b border-[#E0E0E0] bg-white">
      {/* Brand row */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <Logo />
        {customer && (
          <StatusBadge status={customer.accountStatus} />
        )}
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

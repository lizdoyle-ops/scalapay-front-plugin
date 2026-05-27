import { Customer } from '../mocks/customers'
import { ConsumerCustomer } from '../mocks/customers'

export type TabId = 'overview' | 'orders' | 'payments' | 'account' | 'merchant'

interface Tab {
  id: TabId
  label: string
}

const ALL_TABS: Tab[] = [
  { id: 'overview',  label: 'Overview' },
  { id: 'orders',    label: 'Orders' },
  { id: 'payments',  label: 'Payments' },
  { id: 'account',   label: 'Account' },
  { id: 'merchant',  label: 'Merchant' },
]

export function visibleTabs(customer: Customer): Tab[] {
  return ALL_TABS.filter(tab => {
    if (tab.id === 'account') {
      // Show only if suspended/under_review OR failedLogin7d >= 3
      const c = customer as ConsumerCustomer
      if (customer.type !== 'consumer') return false
      const isActive = customer.accountStatus === 'active'
      const fewFailed = (c.failedLogin7d ?? 0) < 3
      return !(isActive && fewFailed)
    }
    if (tab.id === 'merchant') {
      return customer.type === 'merchant'
    }
    return true
  })
}

interface TabNavProps {
  customer: Customer
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function TabNav({ customer, activeTab, onTabChange }: TabNavProps) {
  const tabs = visibleTabs(customer)

  return (
    <div className="flex-shrink-0 border-b border-[#E0E0E0] bg-white px-3 overflow-x-auto">
      <div className="flex gap-0 min-w-max">
        {tabs.map(tab => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-[#00B2A9] text-[#00B2A9]'
                  : 'border-transparent text-gray-500 hover:text-[#1A1A2E] hover:border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

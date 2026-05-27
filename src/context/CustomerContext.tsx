import { createContext, useContext, useState, ReactNode } from 'react'
import initialCustomers, {
  Customer,
  Order,
  JiraTicket,
  ConsumerCustomer,
  MerchantCustomer,
} from '../mocks/customers'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error'
}

interface CustomerContextType {
  customer: Customer | null
  setActiveEmail: (email: string | null) => void

  approveRefund: (orderId: string) => void
  reschedulePayment: (orderId: string, installmentNum: number, newDate: string) => void
  reactivateAccount: (reason: string) => void
  addJiraTicket: (ticket: Omit<JiraTicket, 'id'>) => void

  toasts: ToastItem[]
  showToast: (message: string, type?: 'success' | 'error') => void
  dismissToast: (id: string) => void
}

const CustomerContext = createContext<CustomerContextType | null>(null)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [activeEmail, setActiveEmail] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const customer = customers.find(c => c.email === activeEmail) ?? null

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // ── Customer mutators ──────────────────────────────────────────────────────
  const updateCustomer = (email: string, updater: (c: Customer) => Customer) => {
    setCustomers(prev => prev.map(c => c.email === email ? updater(c) : c))
  }

  const updateOrders = (email: string, updater: (orders: Order[]) => Order[]) => {
    updateCustomer(email, c => ({ ...c, orders: updater(c.orders) }))
  }

  const approveRefund = (orderId: string) => {
    if (!activeEmail) return
    updateOrders(activeEmail, orders =>
      orders.map(o =>
        o.id === orderId ? { ...o, refundStatus: 'approved' as const } : o
      )
    )
    showToast('Refund approved — internal comment added')
  }

  const reschedulePayment = (orderId: string, installmentNum: number, newDate: string) => {
    if (!activeEmail) return
    updateOrders(activeEmail, orders =>
      orders.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          installments: o.installments.map(inst =>
            inst.number === installmentNum
              ? { ...inst, date: newDate, status: 'due' as const }
              : inst
          ),
        }
      })
    )
    showToast('Payment rescheduled — internal comment added')
  }

  const reactivateAccount = (_reason: string) => {
    if (!activeEmail) return
    updateCustomer(activeEmail, c => {
      const updated: ConsumerCustomer = {
        ...(c as ConsumerCustomer),
        accountStatus: 'active',
        suspensionReason: undefined,
        suspensionDate: undefined,
      }
      return updated
    })
    showToast('Account reactivated — internal comment added')
  }

  const addJiraTicket = (ticket: Omit<JiraTicket, 'id'>) => {
    if (!activeEmail) return
    const newId = `TECH-${Math.floor(1000 + Math.random() * 9000)}`
    const newTicket: JiraTicket = { ...ticket, id: newId }
    updateCustomer(activeEmail, c => {
      const merchant = c as MerchantCustomer
      return { ...merchant, jiraTickets: [newTicket, ...merchant.jiraTickets] }
    })
    showToast(`Jira ticket created — ${newId}`)
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        setActiveEmail,
        approveRefund,
        reschedulePayment,
        reactivateAccount,
        addJiraTicket,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider')
  return ctx
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Installment {
  number: number
  amount: number
  status: 'paid' | 'due' | 'overdue'
  date: string // ISO yyyy-mm-dd
}

export interface Order {
  id: string
  merchant: string
  total: number
  numInstallments: number
  purchaseDate: string // ISO
  installments: Installment[]
  refundStatus: 'none' | 'requested' | 'approved' | 'processed'
  refundAmount?: number
  refundRequestedAt?: string // ISO
}

export interface JiraTicket {
  id: string
  summary: string
  status: 'Open' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface BaseCustomer {
  email: string
  name: string
  language: string
  accountStatus: 'active' | 'suspended' | 'under_review'
  lifetimeOrders: number
  lifetimeValue: number
  orders: Order[]
}

export interface ConsumerCustomer extends BaseCustomer {
  type: 'consumer'
  suspensionReason?: string
  suspensionDate?: string // ISO
  lastLogin?: string // ISO
  failedLogin7d?: number
  fraudRiskScore?: 'low' | 'medium' | 'high'
}

export interface MerchantCustomer extends BaseCustomer {
  type: 'merchant'
  businessName: string
  integrationType: string
  accountManager: string
  monthlyVolume: { month: string; amount: number }[]
  apiErrors24h: number
  lastErrorCode?: string
  lastErrorTime?: string
  jiraTickets: JiraTicket[]
}

export type Customer = ConsumerCustomer | MerchantCustomer

// ─── Mock data ───────────────────────────────────────────────────────────────

const customers: Customer[] = [
  // ── Customer 1: Leyton Marcus ─────────────────────────────────────────────
  {
    type: 'consumer',
    email: 'leyton@finalproduction.club',
    name: 'Leyton Graves',
    language: 'English',
    accountStatus: 'active',
    lifetimeOrders: 9,
    lifetimeValue: 1240.0,
    orders: [
      {
        id: 'SP-2024-884321',
        merchant: 'Zara',
        total: 89.7,
        numInstallments: 3,
        purchaseDate: '2026-04-01',
        installments: [
          { number: 1, amount: 29.9, status: 'paid',    date: '2026-04-01' },
          { number: 2, amount: 29.9, status: 'paid',    date: '2026-05-01' },
          { number: 3, amount: 29.9, status: 'due',     date: '2026-06-01' },
        ],
        refundStatus: 'requested',
        refundAmount: 89.7,
        refundRequestedAt: '2026-05-12',
      },
      {
        id: 'SP-2024-771002',
        merchant: 'Nike',
        total: 142.5,
        numInstallments: 3,
        purchaseDate: '2026-03-01',
        installments: [
          { number: 1, amount: 47.5, status: 'paid',    date: '2026-03-01' },
          { number: 2, amount: 47.5, status: 'overdue', date: '2026-04-01' },
          { number: 3, amount: 47.5, status: 'due',     date: '2026-06-01' },
        ],
        refundStatus: 'none',
      },
    ],
  },

  // ── Customer 2: Elias Varga ───────────────────────────────────────────────
  {
    type: 'consumer',
    email: 'elias@auditlawyer.club',
    name: 'Elias Holly',
    language: 'English',
    accountStatus: 'suspended',
    suspensionReason: 'Suspicious activity',
    suspensionDate: '2026-05-18',
    lastLogin: '2026-05-17',
    failedLogin7d: 0,
    fraudRiskScore: 'medium',
    lifetimeOrders: 31,
    lifetimeValue: 4870.0,
    orders: [
      {
        id: 'SP-2024-556788',
        merchant: 'Decathlon',
        total: 210.0,
        numInstallments: 3,
        purchaseDate: '2026-03-01',
        installments: [
          { number: 1, amount: 70.0, status: 'paid', date: '2026-03-01' },
          { number: 2, amount: 70.0, status: 'paid', date: '2026-04-01' },
          { number: 3, amount: 70.0, status: 'paid', date: '2026-05-01' },
        ],
        refundStatus: 'none',
      },
      {
        id: 'SP-2024-602341',
        merchant: 'Apple',
        total: 399.0,
        numInstallments: 4,
        purchaseDate: '2026-02-01',
        installments: [
          { number: 1, amount: 99.75, status: 'paid', date: '2026-02-01' },
          { number: 2, amount: 99.75, status: 'paid', date: '2026-03-01' },
          { number: 3, amount: 99.75, status: 'paid', date: '2026-04-01' },
          { number: 4, amount: 99.75, status: 'due',  date: '2026-06-01' },
        ],
        refundStatus: 'none',
      },
    ],
  },

  // ── Customer 3: Sarah Okonkwo (Merchant) ──────────────────────────────────
  {
    type: 'merchant',
    email: 'sarah@zestymedia.club',
    name: 'Sarah Murphy',
    language: 'English',
    accountStatus: 'active',
    lifetimeOrders: 0,
    lifetimeValue: 0,
    orders: [],
    businessName: 'Zesty Media Ltd.',
    integrationType: 'API',
    accountManager: 'Sophie Morel',
    monthlyVolume: [
      { month: 'Mar', amount: 48200 },
      { month: 'Apr', amount: 51900 },
      { month: 'May', amount: 44100 },
    ],
    apiErrors24h: 3,
    lastErrorCode: '422 Unprocessable Entity',
    lastErrorTime: '2026-05-27 08:14',
    jiraTickets: [
      {
        id: 'TECH-1823',
        summary: 'Webhook not firing on order completion',
        status: 'In Progress',
        priority: 'High',
      },
      {
        id: 'TECH-1791',
        summary: 'Installment status sync delay',
        status: 'Open',
        priority: 'Medium',
      },
    ],
  },
]

export default customers

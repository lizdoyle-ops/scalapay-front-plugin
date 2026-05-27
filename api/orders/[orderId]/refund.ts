const ORDERS: Record<string, any> = {
  'SP-2024-884321': {
    orderId: 'SP-2024-884321',
    merchant: 'Zara',
    total: 89.7,
    currency: 'EUR',
    purchaseDate: '2026-04-01',
    numInstallments: 3,
    refundStatus: 'requested',
    refundAmount: 89.7,
    refundRequestedAt: '2026-05-12',
    installments: [
      { number: 1, amount: 29.9, status: 'paid',    dueDate: '2026-04-01' },
      { number: 2, amount: 29.9, status: 'paid',    dueDate: '2026-05-01' },
      { number: 3, amount: 29.9, status: 'due',     dueDate: '2026-06-01' },
    ],
  },
  'SP-2024-771002': {
    orderId: 'SP-2024-771002',
    merchant: 'Nike',
    total: 142.5,
    currency: 'EUR',
    purchaseDate: '2026-03-01',
    numInstallments: 3,
    refundStatus: 'none',
    refundAmount: null,
    refundRequestedAt: null,
    installments: [
      { number: 1, amount: 47.5, status: 'paid',    dueDate: '2026-03-01' },
      { number: 2, amount: 47.5, status: 'overdue', dueDate: '2026-04-01' },
      { number: 3, amount: 47.5, status: 'due',     dueDate: '2026-06-01' },
    ],
  },
  'SP-2024-556788': {
    orderId: 'SP-2024-556788',
    merchant: 'Decathlon',
    total: 210.0,
    currency: 'EUR',
    purchaseDate: '2026-03-01',
    numInstallments: 3,
    refundStatus: 'none',
    refundAmount: null,
    refundRequestedAt: null,
    installments: [
      { number: 1, amount: 70.0, status: 'paid', dueDate: '2026-03-01' },
      { number: 2, amount: 70.0, status: 'paid', dueDate: '2026-04-01' },
      { number: 3, amount: 70.0, status: 'paid', dueDate: '2026-05-01' },
    ],
  },
  'SP-2024-602341': {
    orderId: 'SP-2024-602341',
    merchant: 'Apple',
    total: 399.0,
    currency: 'EUR',
    purchaseDate: '2026-02-01',
    numInstallments: 4,
    refundStatus: 'none',
    refundAmount: null,
    refundRequestedAt: null,
    installments: [
      { number: 1, amount: 99.75, status: 'paid', dueDate: '2026-02-01' },
      { number: 2, amount: 99.75, status: 'paid', dueDate: '2026-03-01' },
      { number: 3, amount: 99.75, status: 'paid', dueDate: '2026-04-01' },
      { number: 4, amount: 99.75, status: 'due',  dueDate: '2026-06-01' },
    ],
  },
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const { orderId } = req.query
  const order = ORDERS[orderId as string]

  if (!order) {
    return res.status(404).json({ error: 'Order not found', orderId })
  }

  return res.status(200).json(order)
}

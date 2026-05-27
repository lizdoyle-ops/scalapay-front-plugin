import customers from '../../../src/mocks/customers'

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const { orderId } = req.query

  for (const customer of customers) {
    const order = customer.orders.find(o => o.id === orderId)
    if (order) {
      return res.status(200).json({
        orderId: order.id,
        merchant: order.merchant,
        total: order.total,
        currency: 'EUR',
        purchaseDate: order.purchaseDate,
        numInstallments: order.numInstallments,
        refundStatus: order.refundStatus,
        refundAmount: order.refundAmount ?? null,
        refundRequestedAt: order.refundRequestedAt ?? null,
        installments: order.installments.map(i => ({
          number: i.number,
          amount: i.amount,
          status: i.status,
          dueDate: i.date,
        })),
      })
    }
  }

  return res.status(404).json({ error: 'Order not found', orderId })
}

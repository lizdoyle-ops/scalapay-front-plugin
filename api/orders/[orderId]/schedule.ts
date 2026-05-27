export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const { orderId } = req.query
  const { installmentNumber, dueDate } = req.body ?? {}

  return res.status(200).json({
    orderId,
    installmentNumber,
    dueDate,
    status: 'updated',
    message: 'Payment schedule updated successfully',
  })
}

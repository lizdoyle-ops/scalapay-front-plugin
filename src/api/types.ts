// ─── Request / Response shapes ───────────────────────────────────────────────

/** GET /orders/{orderId}/refund */
export interface ApiRefundOrder {
  orderId: string
  merchant: string
  currency: string
  totalAmount: number
  refundStatus: 'none' | 'requested' | 'approved' | 'processed'
  refundAmount: number | null
  refundRequestedAt: string | null // ISO yyyy-mm-dd
  installments: ApiInstallment[]
  fetchedAt: string // ISO timestamp, returned by the API
}

export interface ApiInstallment {
  number: number
  amount: number
  dueDate: string // ISO yyyy-mm-dd
  status: 'paid' | 'due' | 'overdue'
}

/** PATCH /orders/{orderId}/schedule — request body */
export interface ApiScheduleUpdateRequest {
  installmentNumber: number
  dueDate: string // ISO yyyy-mm-dd
}

/** PATCH /orders/{orderId}/schedule — response */
export interface ApiScheduleUpdateResponse {
  orderId: string
  installmentNumber: number
  previousDueDate: string
  newDueDate: string
  updatedAt: string // ISO timestamp
}

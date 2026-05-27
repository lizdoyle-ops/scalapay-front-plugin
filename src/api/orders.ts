import { apiClient } from './client'
import type {
  ApiRefundOrder,
  ApiScheduleUpdateRequest,
  ApiScheduleUpdateResponse,
} from './types'

/**
 * Fetch a refund order's current state by order record ID.
 * GET /orders/{orderId}/refund
 */
export async function getRefundOrder(orderId: string): Promise<ApiRefundOrder> {
  return apiClient<ApiRefundOrder>(`/orders/${orderId}/refund`)
}

/**
 * Update the due date of a specific installment within an order.
 * PATCH /orders/{orderId}/schedule
 */
export async function updateRefundSchedule(
  orderId: string,
  payload: ApiScheduleUpdateRequest,
): Promise<ApiScheduleUpdateResponse> {
  return apiClient<ApiScheduleUpdateResponse>(`/orders/${orderId}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

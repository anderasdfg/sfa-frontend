export interface PaymentCreateRequest {
  appointment_id: number
  transaction_type?: string
  success_url: string
  failure_url: string
  pending_url: string
}

export interface PaymentResponse {
  success: boolean
  data: {
    preference_id: string
    init_point: string
  }
  message: string
}

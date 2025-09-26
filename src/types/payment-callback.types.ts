/**
 * Tipos para los callbacks de MercadoPago
 */

export interface PaymentCallbackParams {
  appointment_id: string
  collection_id: string
  collection_status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  payment_id: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  external_reference: string
  payment_type: string
  merchant_order_id: string
  preference_id: string
  site_id: string
  processing_mode: string
  merchant_account_id: string | null
}

export interface PaymentSummary {
  appointmentId: number
  paymentId: string
  collectionId: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  paymentType: string
  merchantOrderId: string
  externalReference: string
  amount?: number
  currency?: string
}

export type PaymentStatus = 'success' | 'pending' | 'failure'

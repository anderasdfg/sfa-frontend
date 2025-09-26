<template>
  <div class="payment-summary-card">
    <!-- Header con estado del pago -->
    <div class="payment-header" :class="statusClass">
      <div class="status-icon">
        <CheckCircleIcon v-if="isSuccess" class="w-8 h-8" />
        <ClockIcon v-else-if="isPending" class="w-8 h-8" />
        <XCircleIcon v-else class="w-8 h-8" />
      </div>
      <div class="status-text">
        <h2 class="status-title">{{ statusMessage.title }}</h2>
        <p class="status-description">{{ statusMessage.message }}</p>
      </div>
    </div>

    <!-- Detalles del pago -->
    <div class="payment-details">
      <h3 class="details-title">Detalles del Pago</h3>
      
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">ID de Pago:</span>
          <span class="detail-value">{{ paymentSummary.paymentId }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">ID de Cita:</span>
          <span class="detail-value">#{{ paymentSummary.appointmentId }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Método de Pago:</span>
          <span class="detail-value">{{ formatPaymentType(paymentSummary.paymentType) }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Estado:</span>
          <span class="detail-value" :class="statusBadgeClass">
            {{ formatStatus(paymentSummary.status) }}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Referencia:</span>
          <span class="detail-value">{{ paymentSummary.externalReference }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Orden:</span>
          <span class="detail-value">{{ paymentSummary.merchantOrderId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/vue/24/solid'
  import type { PaymentSummary, PaymentStatus } from '@/types/payment-callback.types'

  interface Props {
    paymentSummary: PaymentSummary
    paymentStatus: PaymentStatus
    statusMessage: { title: string; message: string }
  }

  const props = defineProps<Props>()

  // Computed properties para estilos
  const isSuccess = computed(() => props.paymentStatus === 'success')
  const isPending = computed(() => props.paymentStatus === 'pending')
  const isFailure = computed(() => props.paymentStatus === 'failure')

  const statusClass = computed(() => ({
    'success': isSuccess.value,
    'pending': isPending.value,
    'failure': isFailure.value
  }))

  const statusBadgeClass = computed(() => ({
    'status-success': isSuccess.value,
    'status-pending': isPending.value,
    'status-failure': isFailure.value
  }))

  // Métodos de formateo
  const formatPaymentType = (type: string): string => {
    const types: Record<string, string> = {
      'account_money': 'Dinero en Cuenta',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito',
      'bank_transfer': 'Transferencia Bancaria'
    }
    return types[type] || type
  }

  const formatStatus = (status: string): string => {
    const statuses: Record<string, string> = {
      'approved': 'Aprobado',
      'pending': 'Pendiente',
      'rejected': 'Rechazado',
      'cancelled': 'Cancelado'
    }
    return statuses[status] || status
  }
</script>

<style scoped>
  .payment-summary-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .payment-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .payment-header.success {
    background-color: #f0fdf4;
    border-left: 4px solid #10b981;
  }

  .payment-header.pending {
    background-color: #fefce8;
    border-left: 4px solid #eab308;
  }

  .payment-header.failure {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
  }

  .status-icon {
    flex-shrink: 0;
  }

  .payment-header.success .status-icon {
    color: #059669;
  }

  .payment-header.pending .status-icon {
    color: #d97706;
  }

  .payment-header.failure .status-icon {
    color: #dc2626;
  }

  .status-text {
    flex: 1;
  }

  .status-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .status-description {
    color: #4b5563;
  }

  .payment-details {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .details-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .details-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }

  .detail-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .detail-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }

  .status-success {
    color: #059669;
    background-color: #dcfce7;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  .status-pending {
    color: #d97706;
    background-color: #fef3c7;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  .status-failure {
    color: #dc2626;
    background-color: #fecaca;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }
</style>

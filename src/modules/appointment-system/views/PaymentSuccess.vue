<template>
  <div class="payment-success-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Procesando resultado del pago...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <XCircleIcon class="error-icon" />
        <h2 class="error-title">Error al Procesar el Pago</h2>
        <p class="error-message">{{ error }}</p>
        <div class="error-actions">
          <button @click="retryProcess" class="retry-button">Reintentar</button>
          <router-link to="/appointments" class="back-button">Volver a Citas</router-link>
        </div>
      </div>

      <!-- Success Content -->
      <div v-else-if="paymentSummary && isSuccess" class="success-content">
        <!-- Success Header -->
        <div class="success-header">
          <CheckCircleIcon class="success-icon" />
          <h1 class="success-title">¡Pago Exitoso!</h1>
          <p class="success-subtitle">Tu cita médica ha sido confirmada y pagada correctamente</p>
        </div>

        <!-- Payment Summary -->
        <PaymentSummaryCard
          :payment-summary="paymentSummary"
          :payment-status="paymentStatus"
          :status-message="statusMessage"
          class="mb-6"
        />

        <!-- Appointment Details -->
        <AppointmentDetailsCard v-if="appointment" :appointment="appointment" class="mb-6" />

        <!-- Actions -->
        <div class="actions-container">
          <router-link to="/appointments" class="primary-button">Ver Mis Citas</router-link>
          <button @click="downloadReceipt" class="secondary-button">Descargar Comprobante</button>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 class="next-steps-title">Próximos Pasos</h3>
          <ul class="next-steps-list">
            <li v-if="appointment?.modality === 'teleconsulta'">
              Te enviaremos el enlace de la videollamada por correo electrónico
            </li>
            <li v-else>Dirígete a la clínica en la fecha y hora programada</li>
            <li>Recibirás un recordatorio 24 horas antes de tu cita</li>
            <!-- <li>Si necesitas cancelar, hazlo con al menos 2 horas de anticipación</li> -->
          </ul>
        </div>
      </div>

      <!-- Invalid State -->
      <div v-else class="invalid-container">
        <ExclamationTriangleIcon class="invalid-icon" />
        <h2 class="invalid-title">Información de Pago No Válida</h2>
        <p class="invalid-message">
          No se pudo verificar el estado del pago. Por favor, contacta con soporte.
        </p>
        <div class="invalid-actions">
          <router-link to="/appointments" class="primary-button">Ver Mis Citas</router-link>
          <router-link to="/support" class="secondary-button">Contactar Soporte</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'
  import { usePaymentCallback } from '../composables/usePaymentCallback'
  import { useNotifications } from '@/composables/useNotifications'
  import PaymentSummaryCard from '../components/PaymentSummaryCard.vue'
  import AppointmentDetailsCard from '../components/AppointmentDetailsCard.vue'

  // Composables
  const paymentCallback = usePaymentCallback()
  const notifications = useNotifications()

  // Destructuring para mejor legibilidad
  const {
    loading,
    error,
    appointment,
    paymentSummary,
    paymentStatus,
    statusMessage,
    isSuccess,
    processCurrentRoute,
    clearError
  } = paymentCallback

  // Lifecycle
  onMounted(async () => {
    const success = await processCurrentRoute()

    if (success && isSuccess.value) {
      notifications.showSuccess('¡Pago Exitoso!', 'Tu cita médica ha sido confirmada correctamente')
    }
  })

  // Methods
  const retryProcess = async () => {
    clearError()
    await processCurrentRoute()
  }

  const downloadReceipt = () => {
    // TODO: Implementar descarga de comprobante
    notifications.showInfo(
      'Función en Desarrollo',
      'La descarga de comprobantes estará disponible próximamente'
    )
  }
</script>

<style scoped>
  .payment-success-page {
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 2rem 0;
  }

  .container {
    max-width: 56rem;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (min-width: 640px) {
    .container {
      padding: 0 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .container {
      padding: 0 2rem;
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid #dbeafe;
    border-top: 4px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: #4b5563;
    font-size: 1.125rem;
  }

  .error-container,
  .invalid-container {
    text-align: center;
    padding: 4rem 0;
  }

  .error-icon,
  .invalid-icon {
    width: 4rem;
    height: 4rem;
    color: #ef4444;
    margin: 0 auto 1rem;
  }

  .error-title,
  .invalid-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .error-message,
  .invalid-message {
    color: #4b5563;
    margin-bottom: 1.5rem;
  }

  .error-actions,
  .invalid-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
  }

  @media (min-width: 640px) {
    .error-actions,
    .invalid-actions {
      flex-direction: row;
    }
  }

  .success-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .success-header {
    text-align: center;
    padding: 2rem 0;
  }

  .success-icon {
    width: 5rem;
    height: 5rem;
    color: #10b981;
    margin: 0 auto 1rem;
  }

  .success-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .success-subtitle {
    font-size: 1.125rem;
    color: #4b5563;
  }

  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
  }

  @media (min-width: 640px) {
    .actions-container {
      flex-direction: row;
    }
  }

  .primary-button {
    background-color: var(--color-sf-green-normal);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }

  .primary-button:hover {
    background-color: var(--color-sf-green-light);
  }

  .secondary-button {
    background-color: #e5e7eb;
    color: #1f2937;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }

  .secondary-button:hover {
    background-color: #d1d5db;
  }

  .retry-button {
    background-color: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }

  .retry-button:hover {
    background-color: #1d4ed8;
  }

  .back-button {
    background-color: #e5e7eb;
    color: #1f2937;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  .back-button:hover {
    background-color: #d1d5db;
  }

  .next-steps {
    background-color: #eff6ff;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .next-steps-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e3a8a;
    margin-bottom: 1rem;
  }

  .next-steps-list {
    color: #1e40af;
    list-style: none;
    padding: 0;
  }

  .next-steps-list li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .next-steps-list li::before {
    content: '•';
    color: #2563eb;
    font-weight: 700;
    margin-right: 0.5rem;
    margin-top: 0.25rem;
  }
</style>

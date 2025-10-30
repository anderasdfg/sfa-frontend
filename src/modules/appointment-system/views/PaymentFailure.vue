<template>
  <div class="payment-failure-page">
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

      <!-- Failure Content -->
      <div v-else-if="paymentSummary && isFailure" class="failure-content">
        <!-- Failure Header -->
        <div class="failure-header">
          <XCircleIcon class="failure-icon" />
          <h1 class="failure-title">Pago No Procesado</h1>
          <p class="failure-subtitle">No se pudo procesar tu pago, pero tu cita sigue reservada</p>
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

        <!-- Failure Reasons -->
        <div class="failure-reasons">
          <h3 class="reasons-title">Posibles Causas</h3>
          <div class="reasons-content">
            <div class="reason-item">
              <CreditCardIcon class="reason-icon" />
              <div>
                <h4 class="reason-title">Fondos Insuficientes</h4>
                <p class="reason-description">
                  Tu tarjeta no tiene fondos suficientes para completar la transacción
                </p>
              </div>
            </div>

            <div class="reason-item">
              <ShieldExclamationIcon class="reason-icon" />
              <div>
                <h4 class="reason-title">Transacción Rechazada</h4>
                <p class="reason-description">
                  Tu banco rechazó la transacción por motivos de seguridad
                </p>
              </div>
            </div>

            <div class="reason-item">
              <ClockIcon class="reason-icon" />
              <div>
                <h4 class="reason-title">Tiempo Agotado</h4>
                <p class="reason-description">
                  La sesión de pago expiró antes de completar la transacción
                </p>
              </div>
            </div>

            <div class="reason-item">
              <ExclamationTriangleIcon class="reason-icon" />
              <div>
                <h4 class="reason-title">Datos Incorrectos</h4>
                <p class="reason-description">Los datos de la tarjeta ingresados no son válidos</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-container">
          <button @click="retryPayment" class="primary-button">Intentar Pago Nuevamente</button>
          <button @click="changePaymentMethod" class="secondary-button">
            Cambiar Método de Pago
          </button>
          <router-link to="/appointments" class="tertiary-button">Ver Mis Citas</router-link>
        </div>

        <!-- Important Notice -->
        <div class="important-notice">
          <InformationCircleIcon class="notice-icon" />
          <div class="notice-content">
            <h3 class="notice-title">¡Importante!</h3>
            <div class="notice-text">
              <p class="mb-2">
                <strong>Tu cita sigue reservada</strong>
                por las próximas 2 horas. Puedes completar el pago durante este tiempo.
              </p>
              <p>
                Si no completas el pago, la cita será liberada automáticamente y estará disponible
                para otros pacientes.
              </p>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="support-section">
          <h3 class="support-title">¿Necesitas Ayuda?</h3>
          <p class="support-description">
            Si continúas teniendo problemas con el pago, nuestro equipo de soporte está aquí para
            ayudarte.
          </p>
          <div class="support-actions">
            <router-link to="/support" class="support-button">Contactar Soporte</router-link>
            <a href="tel:+51999999999" class="phone-button">
              <PhoneIcon class="phone-icon" />
              Llamar Ahora
            </a>
          </div>
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
  import { useRouter } from 'vue-router'
  import {
    XCircleIcon,
    ExclamationTriangleIcon,
    CreditCardIcon,
    ShieldExclamationIcon,
    ClockIcon,
    InformationCircleIcon,
    PhoneIcon
  } from '@heroicons/vue/24/solid'
  import { usePaymentCallback } from '../composables/usePaymentCallback'
  import { useNotifications } from '@/composables/useNotifications'
  import PaymentSummaryCard from '../components/PaymentSummaryCard.vue'
  import AppointmentDetailsCard from '../components/AppointmentDetailsCard.vue'

  // Composables
  const router = useRouter()
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
    isFailure,
    processCurrentRoute,
    clearError
  } = paymentCallback

  // Lifecycle
  onMounted(async () => {
    const success = await processCurrentRoute()

    if (success && isFailure.value) {
      notifications.showError(
        'Pago No Procesado',
        'No se pudo completar el pago, pero tu cita sigue reservada por 2 horas'
      )
    }
  })

  // Methods
  const retryProcess = async () => {
    clearError()
    await processCurrentRoute()
  }

  const retryPayment = () => {
    if (appointment.value) {
      // Redirigir al flujo de pago con el appointment ID
      router.push({
        name: 'appointment-booking',
        query: { retry: 'true', appointmentId: appointment.value.id.toString() }
      })
    } else {
      notifications.showError(
        'Error',
        'No se pudo obtener la información de la cita para reintentar el pago'
      )
    }
  }

  const changePaymentMethod = () => {
    if (appointment.value) {
      // Redirigir al flujo de pago con opción de cambiar método
      router.push({
        name: 'appointment-booking',
        query: {
          retry: 'true',
          appointmentId: appointment.value.id.toString(),
          changeMethod: 'true'
        }
      })
    } else {
      notifications.showError('Error', 'No se pudo obtener la información de la cita')
    }
  }
</script>

<style scoped>
  .payment-failure-page {
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
    border: 4px solid #fecaca;
    border-top: 4px solid #dc2626;
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

  .failure-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .failure-header {
    text-align: center;
    padding: 2rem 0;
  }

  .failure-icon {
    width: 5rem;
    height: 5rem;
    color: #ef4444;
    margin: 0 auto 1rem;
  }

  .failure-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .failure-subtitle {
    font-size: 1.125rem;
    color: #4b5563;
  }

  .failure-reasons {
    background-color: #fef2f2;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .reasons-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #7f1d1d;
    margin-bottom: 1rem;
  }

  .reasons-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .reason-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .reason-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #dc2626;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .reason-title {
    font-weight: 500;
    color: #7f1d1d;
    margin-bottom: 0.25rem;
  }

  .reason-description {
    color: #991b1b;
    font-size: 0.875rem;
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
    background-color: #dc2626;
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
    background-color: #b91c1c;
  }

  .secondary-button {
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

  .secondary-button:hover {
    background-color: var(--color-sf-green-light);
  }

  .tertiary-button {
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

  .tertiary-button:hover {
    background-color: #d1d5db;
  }

  .retry-button {
    background-color: #dc2626;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }

  .retry-button:hover {
    background-color: #b91c1c;
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

  .important-notice {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .notice-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #2563eb;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .notice-content {
    flex: 1;
  }

  .notice-title {
    font-weight: 600;
    color: #1e3a8a;
    margin-bottom: 0.5rem;
  }

  .notice-text {
    color: #1e40af;
    font-size: 0.875rem;
  }

  .support-section {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.1),
      0 1px 2px 0 rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  .support-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .support-description {
    color: #4b5563;
    margin-bottom: 1rem;
  }

  .support-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
  }

  @media (min-width: 640px) {
    .support-actions {
      flex-direction: row;
    }
  }

  .support-button {
    background-color: #4b5563;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  .support-button:hover {
    background-color: #374151;
  }

  .phone-button {
    background-color: #059669;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .phone-button:hover {
    background-color: #047857;
  }

  .phone-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>

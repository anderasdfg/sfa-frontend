<template>
  <div class="payment-pending-page">
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
          <button @click="retryProcess" class="retry-button">
            Reintentar
          </button>
          <router-link to="/appointments" class="back-button">
            Volver a Citas
          </router-link>
        </div>
      </div>

      <!-- Pending Content -->
      <div v-else-if="paymentSummary && isPending" class="pending-content">
        <!-- Pending Header -->
        <div class="pending-header">
          <ClockIcon class="pending-icon" />
          <h1 class="pending-title">Pago en Proceso</h1>
          <p class="pending-subtitle">
            Tu pago está siendo procesado. Te notificaremos cuando se complete.
          </p>
        </div>

        <!-- Payment Summary -->
        <PaymentSummaryCard 
          :payment-summary="paymentSummary"
          :payment-status="paymentStatus"
          :status-message="statusMessage"
          class="mb-6"
        />

        <!-- Details Cards - mostrar según el tipo -->
        <TestOrderDetailsCard v-if="isTestOrder && testOrder" :test-order="testOrder" class="mb-6" />
        <AppointmentDetailsCard v-else-if="appointment" :appointment="appointment" class="mb-6" />

        <!-- Status Information -->
        <div class="status-info">
          <h3 class="status-info-title">¿Qué significa esto?</h3>
          <div class="status-info-content">
            <div class="info-item">
              <InformationCircleIcon class="info-icon" />
              <div>
                <h4 class="info-title">Pago en Verificación</h4>
                <p class="info-description">
                  Tu pago está siendo verificado por el sistema bancario. 
                  Este proceso puede tomar algunos minutos.
                </p>
              </div>
            </div>

            <div class="info-item">
              <BellIcon class="info-icon" />
              <div>
                <h4 class="info-title">Te Notificaremos</h4>
                <p class="info-description">
                  Recibirás una notificación por correo electrónico cuando 
                  el pago sea confirmado.
                </p>
              </div>
            </div>

            <div class="info-item">
              <CalendarIcon class="info-icon" />
              <div>
                <h4 class="info-title">
                  <span v-if="isTestOrder">Tu Orden está Reservada</span>
                  <span v-else>Tu Cita está Reservada</span>
                </h4>
                <p class="info-description">
                  <span v-if="isTestOrder">
                    Mientras tanto, tu orden de examen permanece reservada y no será asignada a otro paciente.
                  </span>
                  <span v-else>
                    Mientras tanto, tu cita permanece reservada y no será asignada a otro paciente.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-container">
          <button @click="checkPaymentStatus" class="primary-button" :disabled="checking">
            <span v-if="checking">Verificando...</span>
            <span v-else>Verificar Estado</span>
          </button>
          <router-link v-if="isTestOrder" to="/test-orders" class="secondary-button">
            Ver Mis Exámenes
          </router-link>
          <router-link v-else to="/appointments" class="secondary-button">
            Ver Mis Citas
          </router-link>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <h3 class="timeline-title">Próximos Pasos</h3>
          <div class="timeline-content">
            <div class="timeline-item completed">
              <div class="timeline-marker"></div>
              <div class="timeline-content-item">
                <h4 class="timeline-item-title">Cita Reservada</h4>
                <p class="timeline-item-description">Tu cita ha sido reservada exitosamente</p>
              </div>
            </div>

            <div class="timeline-item active">
              <div class="timeline-marker"></div>
              <div class="timeline-content-item">
                <h4 class="timeline-item-title">Procesando Pago</h4>
                <p class="timeline-item-description">Verificando tu pago con el banco</p>
              </div>
            </div>

            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content-item">
                <h4 class="timeline-item-title">Confirmación</h4>
                <p class="timeline-item-description">Recibirás confirmación por correo</p>
              </div>
            </div>

            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content-item">
                <h4 class="timeline-item-title">Cita Confirmada</h4>
                <p class="timeline-item-description">Tu cita estará lista para la fecha programada</p>
              </div>
            </div>
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
          <router-link to="/appointments" class="primary-button">
            Ver Mis Citas
          </router-link>
          <router-link to="/support" class="secondary-button">
            Contactar Soporte
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { 
    ClockIcon, 
    XCircleIcon, 
    ExclamationTriangleIcon,
    InformationCircleIcon,
    BellIcon,
    CalendarIcon
  } from '@heroicons/vue/24/solid'
  import { usePaymentCallback } from '../composables/usePaymentCallback'
  import { useNotifications } from '@/composables/useNotifications'
  import PaymentSummaryCard from '../components/PaymentSummaryCard.vue'
  import AppointmentDetailsCard from '../components/AppointmentDetailsCard.vue'
  import TestOrderDetailsCard from '../components/TestOrderDetailsCard.vue'

  // Composables
  const paymentCallback = usePaymentCallback()
  const notifications = useNotifications()

  // Local state
  const checking = ref(false)

  // Destructuring para mejor legibilidad
  const {
    loading,
    error,
    appointment,
    testOrder,
    paymentSummary,
    paymentStatus,
    statusMessage,
    isPending,
    isTestOrder,
    processCurrentRoute,
    clearError
  } = paymentCallback

  // Lifecycle
  onMounted(async () => {
    const success = await processCurrentRoute()
    
    if (success && isPending.value) {
      notifications.showInfo(
        'Pago en Proceso',
        'Tu pago está siendo verificado. Te notificaremos cuando se complete.'
      )
    }
  })

  // Methods
  const retryProcess = async () => {
    clearError()
    await processCurrentRoute()
  }

  const checkPaymentStatus = async () => {
    checking.value = true
    
    try {
      // Simular verificación (en una implementación real, harías una llamada al API)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      notifications.showInfo(
        'Estado Verificado',
        'El pago sigue en proceso. Te notificaremos cuando se complete.'
      )
    } catch (error) {
      notifications.showError(
        'Error de Verificación',
        'No se pudo verificar el estado del pago. Intenta más tarde.'
      )
    } finally {
      checking.value = false
    }
  }
</script>

<style scoped>
  .payment-pending-page {
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
    border: 4px solid #fef3c7;
    border-top: 4px solid #d97706;
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

  .error-container, .invalid-container {
    text-align: center;
    padding: 4rem 0;
  }

  .error-icon, .invalid-icon {
    width: 4rem;
    height: 4rem;
    color: #ef4444;
    margin: 0 auto 1rem;
  }

  .error-title, .invalid-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .error-message, .invalid-message {
    color: #4b5563;
    margin-bottom: 1.5rem;
  }

  .error-actions, .invalid-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
  }

  @media (min-width: 640px) {
    .error-actions, .invalid-actions {
      flex-direction: row;
    }
  }

  .pending-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .pending-header {
    text-align: center;
    padding: 2rem 0;
  }

  .pending-icon {
    width: 5rem;
    height: 5rem;
    color: #eab308;
    margin: 0 auto 1rem;
  }

  .pending-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .pending-subtitle {
    font-size: 1.125rem;
    color: #4b5563;
  }

  .status-info {
    background-color: #fefce8;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .status-info-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 1rem;
  }

  .status-info-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .info-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #d97706;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .info-title {
    font-weight: 500;
    color: #92400e;
    margin-bottom: 0.25rem;
  }

  .info-description {
    color: #a16207;
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
    background-color: #d97706;
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
    background-color: #b45309;
  }

  .primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    background-color: #d97706;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }

  .retry-button:hover {
    background-color: #b45309;
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

  .timeline {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .timeline-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1.5rem;
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .timeline-marker {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .timeline-item.completed .timeline-marker {
    background-color: #10b981;
    border-color: #10b981;
  }

  .timeline-item.active .timeline-marker {
    background-color: #eab308;
    border-color: #eab308;
  }

  .timeline-item:not(.completed):not(.active) .timeline-marker {
    background-color: #e5e7eb;
    border-color: #d1d5db;
  }

  .timeline-content-item {
    flex: 1;
  }

  .timeline-item-title {
    font-weight: 500;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .timeline-item-description {
    font-size: 0.875rem;
    color: #4b5563;
  }

  .timeline-item.completed .timeline-item-title {
    color: #047857;
  }

  .timeline-item.active .timeline-item-title {
    color: #b45309;
  }
</style>

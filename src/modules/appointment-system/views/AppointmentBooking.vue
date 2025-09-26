<template>
  <div class="appointment-booking">
    <!-- Header Section -->
    <div class="booking-header">
      <div class="header-container">
        <h1 class="booking-title">Reserva tu cita</h1>
        <AppointmentSearchForm @search="handleSearch" :loading="searchLoading" />
      </div>
    </div>

    <!-- Results Section -->
    <div class="booking-content">
      <div class="content-container">
        <div v-if="searchLoading" class="loading-section">
          <ProgressSpinner />
          <p>Buscando disponibilidad...</p>
        </div>

        <div v-else-if="searchResults.length > 0" class="results-section">
          <h2 class="results-title">Doctores disponibles</h2>
          <DoctorAvailabilityCard
            v-for="(doctor, index) in searchResults"
            :key="index"
            :doctor="doctor"
            :selected-date="selectedDate"
            @select-appointment="handleAppointmentSelection"
          />
        </div>

        <div v-else-if="hasSearched" class="no-results">
          <div class="no-results-content">
            <i class="pi pi-calendar-times no-results-icon"></i>
            <h3>No hay citas disponibles</h3>
            <p>No encontramos doctores disponibles para los criterios seleccionados.</p>
            <Button
              label="Buscar de nuevo"
              icon="pi pi-refresh"
              @click="resetSearch"
              class="mt-3"
            />
          </div>
        </div>

        <div v-else class="welcome-section">
          <div class="welcome-content">
            <i class="pi pi-calendar-plus welcome-icon"></i>
            <h3>Encuentra tu cita médica ideal</h3>
            <p>Selecciona una especialidad para ver la disponibilidad.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Confirmation Modal -->
    <AppointmentConfirmationModal
      v-if="slotsStore.getSelectedAppointment"
      :visible="showConfirmationModal"
      :appointment="slotsStore.getSelectedAppointment"
      :loading="appointmentsComposable.loading.value || paymentsComposable.loading.value"
      @confirm="confirmAppointment"
      @cancel="cancelAppointmentSelection"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import ProgressSpinner from 'primevue/progressspinner'
  import Button from 'primevue/button'
  import AppointmentSearchForm from '../components/AppointmentSearchForm.vue'
  import DoctorAvailabilityCard from '../components/DoctorAvailabilityCard.vue'
  import AppointmentConfirmationModal from '../components/AppointmentConfirmationModal.vue'
  import type { AppointmentSlotQueryParams } from '@/types/slots.types'
  import type { AppointmentSelection, AppointmentBooking } from '../types'
  import { useAppoitmentSlots } from '../composables/useAppoitmentSlots'
  import { useAppointments } from '../composables/useAppointments'
  import { usePayments } from '../composables/usePayments'
  import { useSlotsStore } from '../stores/slots.store'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { useNotifications } from '@/composables/useNotifications'

  const router = useRouter()

  // Composables (instanciados una sola vez)
  const slotsComposable = useAppoitmentSlots()
  const appointmentsComposable = useAppointments()
  const paymentsComposable = usePayments()
  const slotsStore = useSlotsStore()
  const authStore = useAuthStore()
  const notifications = useNotifications()

  // Reactive state
  const hasSearched = ref(false)
  const selectedDate = ref<string>('')
  const showConfirmationModal = ref(false)

  // Computed properties que usan el estado del composable
  const searchLoading = computed(() => slotsComposable.loading.value)
  const searchResults = computed(() => slotsComposable.getAdaptedDoctors())

  // Methods
  const handleSearch = async (criteria: AppointmentSlotQueryParams) => {
    hasSearched.value = true
    selectedDate.value = criteria.date

    console.log('Searching appointments with criteria:', criteria)

    try {
      await slotsComposable.loadSlots(criteria)
      console.log('Search results:', searchResults.value)
    } catch (error) {
      console.error('Error searching appointments:', error)
    }
  }

  const handleAppointmentSelection = (appointment: AppointmentSelection) => {
    slotsStore.setSelectedAppointment(appointment)
    console.log('Se acaba de seleccionar un slot')
    console.log('Usuario autenticado?', authStore.isAuthenticated)

    if (!authStore.isAuthenticated) {
      // Redirigir al login con la URL actual para volver después del login
      router.push('/auth/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
      return
    }

    showConfirmationModal.value = true
  }

  const confirmAppointment = async (appointmentData: AppointmentBooking) => {
    try {
      console.log('Creating appointment:', appointmentData)

      // Usar el composable para crear la cita
      const success = await appointmentsComposable.createAppointment(appointmentData)
      console.log('Appointment created:', success)
      if (success) {
        // Mostrar notificación de éxito
        notifications.showSuccess(
          'Cita Confirmada',
          'Tu cita médica ha sido reservada exitosamente. Redirigiendo al pago...'
        )

        // Procesar pago automáticamente
        const appointment = appointmentsComposable.createdAppointment.value
        console.log('🔍 Appointment for payment:', appointment)
        
        if (appointment) {
          const paymentSuccess = await paymentsComposable.createAndRedirectToPayment(appointment)

          if (paymentSuccess) {
            // Limpiar estado después de redirección exitosa
            slotsStore.clearSelectedAppointment()
            appointmentsComposable.clearState()
          } else {
            // Mostrar error de pago pero mantener la cita creada
            notifications.showError(
              'Error en el Pago',
              paymentsComposable.error.value ||
                'No se pudo procesar el pago. La cita fue creada exitosamente.'
            )
          }
        }
      } else {
        notifications.showError(
          'Error al Confirmar Cita',
          appointmentsComposable.error.value || 'No se pudo crear la cita'
        )
      }
    } catch (error) {
      console.error('Unexpected error confirming appointment:', error)
      notifications.showError(
        'Error Inesperado',
        'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
      )
    } finally {
      showConfirmationModal.value = false
      slotsStore.clearSelectedAppointment()
    }
  }

  const cancelAppointmentSelection = () => {
    showConfirmationModal.value = false
    slotsStore.clearSelectedAppointment()
  }

  const resetSearch = () => {
    hasSearched.value = false
    //searchResults.value = []
    selectedDate.value = ''
  }

  // Watcher para detectar cuando el usuario se autentica y hay una cita seleccionada
  watch(
    () => authStore.isAuthenticated,
    isAuthenticated => {
      if (isAuthenticated && slotsStore.hasSelectedAppointment) {
        console.log('Usuario autenticado con cita seleccionada, abriendo modal')
        showConfirmationModal.value = true
      }
    },
    { immediate: true }
  )

  // Al montar el componente, verificar si hay una cita seleccionada y el usuario está autenticado
  onMounted(() => {
    if (authStore.isAuthenticated && slotsStore.hasSelectedAppointment) {
      console.log('Componente montado: Usuario autenticado con cita seleccionada')
      showConfirmationModal.value = true
    }
  })
</script>

<style scoped>
  .appointment-booking {
    min-height: 100vh;
    background: #f8f9fa;
  }

  .booking-header {
    background: linear-gradient(
      135deg,
      var(--color-sf-green-normal) 0%,
      var(--color-sf-green-dark) 100%
    );
    color: white;
    padding: 3rem 5% 4rem;
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .booking-title {
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2rem;
  }

  .booking-content {
    padding: 2rem 5%;
    margin-top: -2rem;
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-section {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .loading-section p {
    margin-top: 1rem;
    color: #718096;
  }

  .results-section {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    margin-top: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .results-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 1.5rem;
  }

  .no-results,
  .welcome-section {
    text-align: center;
    margin-top: 1rem;
    padding: 4rem 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .no-results-content,
  .welcome-content {
    max-width: 400px;
    margin: 0 auto;
  }

  .no-results-icon,
  .welcome-icon {
    font-size: 4rem;
    color: var(--color-sf-green-light);
    margin-bottom: 1rem;
  }

  .no-results h3,
  .welcome-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 1rem;
  }

  .no-results p,
  .welcome-content p {
    color: #718096;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .booking-header {
      padding: 2rem 2rem 3rem;
    }

    .booking-title {
      font-size: 2rem;
    }

    .booking-content {
      padding: 1rem 2rem;
    }

    .results-section {
      padding: 1.5rem;
    }
  }
</style>

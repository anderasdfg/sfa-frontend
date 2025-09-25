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
      v-if="selectedAppointment"
      :visible="showConfirmationModal"
      :appointment="selectedAppointment"
      @confirm="confirmAppointment"
      @cancel="cancelAppointmentSelection"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import ProgressSpinner from 'primevue/progressspinner'
  import Button from 'primevue/button'
  import AppointmentSearchForm from '../components/AppointmentSearchForm.vue'
  import DoctorAvailabilityCard from '../components/DoctorAvailabilityCard.vue'
  import AppointmentConfirmationModal from '../components/AppointmentConfirmationModal.vue'
  import type { AppointmentSlotQueryParams } from '@/types/slots.types'
  import type { Doctor, TimeSlot } from '../types'
  import { useAppoitmentSlots } from '../composables/useAppoitmentSlots'

  const router = useRouter()

  // Reactive state
  const searchLoading = ref(false)
  const searchResults = ref<Doctor[]>([])
  const hasSearched = ref(false)
  const selectedDate = ref<string>('')
  const selectedAppointment = ref<(TimeSlot & { doctor: Doctor }) | null>(null)
  const showConfirmationModal = ref(false)

  // Methods
  const handleSearch = async (criteria: AppointmentSlotQueryParams) => {
    searchLoading.value = true
    hasSearched.value = true
    selectedDate.value = criteria.date

    try {
      const slotsComposable = useAppoitmentSlots()
      await slotsComposable.loadSlots(criteria)
      searchResults.value = slotsComposable.getAdaptedDoctors()
    } catch (error) {
      console.error('Error searching appointments:', error)
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }

  const handleAppointmentSelection = (appointment: TimeSlot & { doctor: Doctor }) => {
    selectedAppointment.value = appointment
    showConfirmationModal.value = true
  }

  const confirmAppointment = async (appointmentData: any) => {
    try {
      // Aquí se haría la llamada a la API para confirmar la cita
      console.log('Confirming appointment:', appointmentData)

      // Simular confirmación
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirigir a página de confirmación o dashboard
      router.push('/auth/login?redirect=/patient/appointments')
    } catch (error) {
      console.error('Error confirming appointment:', error)
    } finally {
      showConfirmationModal.value = false
      selectedAppointment.value = null
    }
  }

  const cancelAppointmentSelection = () => {
    showConfirmationModal.value = false
    selectedAppointment.value = null
  }

  const resetSearch = () => {
    hasSearched.value = false
    searchResults.value = []
    selectedDate.value = ''
  }

  // Lifecycle
  onMounted(() => {
    // Aquí se pueden cargar datos iniciales si es necesario
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

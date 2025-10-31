<template>
  <Card class="appointments-card">
    <template #title>
      <div class="flex items-center justify-between">
        <span>Citas de Hoy</span>
        <Button
          icon="pi pi-plus"
          class="p-button-sm p-button-text"
          @click="handleNewAppointment"
          label="Nueva Cita"
        />
      </div>
    </template>
    <template #content>
      <div v-if="loading" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <p class="text-gray-500 mt-3">Cargando citas...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle text-4xl text-red-400 mb-3"></i>
        <p class="text-red-600">{{ error }}</p>
        <Button label="Reintentar" class="mt-3" @click="handleRetry" />
      </div>
      <div v-else-if="filteredAppointments.length > 0" class="appointments-list">
        <div
          v-for="appointment in filteredAppointments"
          :key="appointment.id"
          class="appointment-item"
        >
          <div class="appointment-time">
            {{ formatTime(appointment.slot.scheduled_at) }}
          </div>
          <div class="appointment-details">
            <div class="appointment-patient">
              {{ appointment.patient_data.first_name }} {{ appointment.patient_data.last_name }}
            </div>
            <div class="appointment-type">
              {{ appointment.modality }}
            </div>
          </div>
          <div class="appointment-actions">
            <VideoMeetingButton
              v-if="appointment.modality === 'teleconsulta'"
              :appointment-id="appointment.id"
              role="doctor"
              button-text="Iniciar consulta"
              :title="`Consulta - ${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`"
            />
            <Button
              v-else
              icon="pi pi-user"
              class="p-button-sm p-button-text"
              @click="handleViewAppointment(appointment.id)"
              label="Ver consulta"
            />
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <i class="pi pi-calendar text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">No hay citas programadas para hoy</p>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
  import { onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner'
  import { useDoctorAppointments } from '../composables/useDoctorAppointments'
  import { formatTime } from '@/shared/lib/formatters'
  import VideoMeetingButton from '@/shared/components/VideoMeetingButton.vue'

  const router = useRouter()
  const { todayAppointments, loading, error, fetchTodayAppointments } = useDoctorAppointments()

  // Filtrar citas que no estén realizadas
  const filteredAppointments = computed(() => {
    return todayAppointments.value.filter(appointment => appointment.status !== 'realizada')
  })

  const handleViewAppointment = (appointmentId: number) => {
    router.push(`/appointments/${appointmentId}/prepare`)
  }

  const handleNewAppointment = () => {
    router.push('/appointments/new')
  }

  const handleRetry = async () => {
    await fetchTodayAppointments()
  }

  onMounted(async () => {
    await fetchTodayAppointments()
  })
</script>

<style scoped>
  .appointments-card {
    height: 100%;
  }

  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .appointment-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .appointment-item:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .appointment-time {
    font-weight: 600;
    color: #374151;
    margin-right: 1rem;
    min-width: 4rem;
  }

  .appointment-details {
    flex: 1;
  }

  .appointment-patient {
    font-weight: 500;
    color: #111827;
  }

  .appointment-type {
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: capitalize;
  }

  .appointment-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .empty-state,
  .loading-state,
  .error-state {
    text-align: center;
    padding: 2rem;
  }

  .empty-state,
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>

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
      <div v-if="props.loading" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <p class="text-gray-500 mt-3">Cargando actividades...</p>
      </div>
      <div v-else-if="props.error" class="error-state">
        <i class="pi pi-exclamation-triangle text-4xl text-red-400 mb-3"></i>
        <p class="text-red-600">{{ props.error }}</p>
        <Button label="Reintentar" class="mt-3" @click="handleRetry" />
      </div>
      <div v-else-if="filteredActivities.length > 0" class="appointments-list">
        <div
          v-for="activity in filteredActivities"
          :key="`${activity.type}-${activity.id}`"
          class="appointment-item"
          :class="{ 'test-order-item': activity.type === 'test_order' }"
        >
          <div class="appointment-time">
            {{ formatTime(activity.scheduled_at) }}
          </div>
          <div class="appointment-details">
            <div class="appointment-patient">
              {{ activity.patient_name }}
              <span class="activity-badge" :class="activity.type === 'test_order' ? 'test-badge' : 'appointment-badge'">
                {{ activity.type === 'test_order' ? 'Examen' : 'Cita' }}
              </span>
            </div>
            <div class="appointment-type">
              {{ activity.type === 'test_order' ? activity.diagnostic_test_name : activity.modality }}
            </div>
          </div>
          <div class="appointment-actions">
            <!-- Para citas médicas -->
            <template v-if="activity.type === 'appointment'">
              <VideoMeetingButton
                v-if="activity.modality === 'teleconsulta' && canStartAppointmentConsultation(activity)"
                :appointment-id="activity.id"
                role="doctor"
                :button-text="activity.status === 'en_proceso' ? 'Entrar a consulta' : 'Iniciar consulta'"
                :title="`Consulta - ${activity.patient_name}`"
              />
              <Button
                v-else-if="canStartAppointmentConsultation(activity)"
                icon="pi pi-play"
                class="p-button-sm p-button-success"
                @click="handleStartConsultation(activity)"
                :label="activity.status === 'en_proceso' ? 'Entrar a consulta' : 'Iniciar consulta'"
              />
              <Button
                v-else
                icon="pi pi-eye"
                class="p-button-sm p-button-text"
                @click="handleViewAppointment(activity.id)"
                label="Ver detalles"
              />
            </template>

            <!-- Para órdenes de examen -->
            <template v-else-if="activity.type === 'test_order'">
              <Button
                v-if="canStartTestProcessing(activity)"
                icon="pi pi-play"
                class="p-button-sm p-button-success"
                @click="handleStartTestProcessing(activity)"
                label="Iniciar examen"
              />
              <Button
                v-else-if="canCompleteTestProcessing(activity)"
                icon="pi pi-check"
                class="p-button-sm p-button-warning"
                @click="handleCompleteTestProcessing(activity)"
                label="Completar examen"
              />
              <Button
                v-else-if="canUploadResults(activity)"
                icon="pi pi-upload"
                class="p-button-sm p-button-info"
                @click="handleUploadResults(activity)"
                label="Subir resultados"
              />
              <Button
                v-else
                icon="pi pi-eye"
                class="p-button-sm p-button-text"
                @click="handleViewTestOrder(activity.id)"
                label="Ver detalles"
              />
            </template>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <i class="pi pi-calendar text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">No hay actividades programadas para hoy</p>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDoctorActivityActions } from '../composables/useDoctorActivityActions'
  import { useDoctorActivityFilters } from '../composables/useDoctorActivityFilters'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner'
  import { formatTime } from '@/shared/lib/formatters'
  import VideoMeetingButton from '@/shared/components/VideoMeetingButton.vue'
  import type { DoctorActivityItem } from '../composables/useDoctorAppointments'

  interface Props {
    activities: DoctorActivityItem[]
    loading: boolean
    error: string | null
  }

  interface Emits {
    refreshActivities: []
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const router = useRouter()

  // Composable para las acciones de actividades
  const {
    canStartTestProcessing,
    canCompleteTestProcessing,
    canUploadResults,
    startConsultation,
    startTestProcessing,
    completeTestProcessing,
    uploadResults
  } = useDoctorActivityActions()

  // Composable para filtros y utilidades
  const { filterActiveActivities } = useDoctorActivityFilters()

  // Función específica para appointments - puede iniciar consulta si está en: pagada, en_proceso, en_espera
  const canStartAppointmentConsultation = (activity: DoctorActivityItem): boolean => {
    if (activity.type !== 'appointment') return false
    return ['pagada', 'pagado', 'en_proceso', 'en_espera'].includes(activity.status)
  }

  // Filtrar actividades que no estén realizadas
  const filteredActivities = computed(() => {
    return filterActiveActivities(props.activities)
  })

  // Handlers que usan el composable y emiten eventos
  const handleStartConsultation = async (activity: DoctorActivityItem) => {
    const success = await startConsultation(activity)
    if (success) {
      // Emitir evento para refrescar las actividades en el componente padre
      //emit('refreshActivities')
      
      // Siempre navegar a consulta después de cambiar el estado exitosamente
      router.push(`/appointments/${activity.id}/prepare`)
    }
  }

  const handleStartTestProcessing = async (activity: DoctorActivityItem) => {
    const success = await startTestProcessing(activity)
    if (success) {
      // Emitir evento para refrescar las actividades en el componente padre
      emit('refreshActivities')
    }
  }

  const handleCompleteTestProcessing = async (activity: DoctorActivityItem) => {
    const success = await completeTestProcessing(activity)
    if (success) {
      // Emitir evento para refrescar las actividades en el componente padre
      emit('refreshActivities')
    }
  }

  const handleUploadResults = async (activity: DoctorActivityItem) => {
    await uploadResults(activity)
    // No necesita refresh ya que por ahora solo muestra mensaje informativo
  }

  const handleViewAppointment = (appointmentId: number) => {
    router.push(`/appointments/${appointmentId}/prepare`)
  }

  const handleViewTestOrder = (testOrderId: number) => {
    router.push(`/test-orders/${testOrderId}`)
  }

  const handleNewAppointment = () => {
    router.push('/appointments/new')
  }

  const handleRetry = () => {
    // Emit event to parent to retry loading
    window.location.reload()
  }
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

  .test-order-item {
    border-left: 4px solid #f59e0b;
  }

  .activity-badge {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-left: 0.5rem;
  }

  .appointment-badge {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .test-badge {
    background-color: #fef3c7;
    color: #92400e;
  }
</style>

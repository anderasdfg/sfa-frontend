<template>
  <div class="appointments-container">
    <ul v-if="appointments.length > 0" class="appointments-list">
      <li v-for="appointment in appointments" :key="appointment.id" class="appointment-item">
        <div class="appointment-time">
          <div class="time">{{ formatTime(appointment.slot?.scheduled_at) }}</div>
          <div class="date">{{ formatDate(appointment.slot?.scheduled_at) }}</div>
        </div>
        <div class="appointment-details">
          <div class="appointment-doctor">{{ getDoctorName(appointment) }}</div>
          <div class="appointment-specialty">
            {{ getSpecialty(appointment) }}
          </div>
        </div>
        <div class="appointment-status">
          <div class="status-container">
            <Tag
              :value="getStatusLabel(appointment.status)"
              :severity="getStatusSeverity(appointment.status)"
              class="status-tag"
            />
            <Button
              v-if="appointment.status === 'reservada'"
              label="Pagar ahora"
              size="small"
              :loading="processingPayment === appointment.id"
              :disabled="!!processingPayment"
              @click="handlePayment(appointment)"
              class="p-button-sm p-button-text"
            />
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="empty-state">
      <p class="text-gray-500"> 
        <i class="pi pi-calendar text-4xl text-gray-300 mb-3 mr-2"></i> 
        {{ emptyMessage || 'No tienes citas programadas' }}
      </p>
      <Button
        v-if="showScheduleButton"
        :label="scheduleButtonText || 'Agendar mi primera cita'"
        class="mt-3"
        @click="$emit('schedule-appointment')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Appointment } from '@/types/appointments.types'
  import Tag from 'primevue/tag'
  import Button from 'primevue/button'
  import { usePayments } from '@/modules/appointment-system/composables/usePayments'
  import { useNotifications } from '@/composables/useNotifications'
  import { formatTime } from '@/shared/lib/formatters'
  import { getDoctorName, getSpecialty, formatDate } from '@/utils/appointment.utils'

  interface Props {
    appointments: Appointment[]
    emptyMessage?: string
    showScheduleButton?: boolean
    scheduleButtonText?: string
  }

  withDefaults(defineProps<Props>(), {
    appointments: () => [],
    emptyMessage: 'No tienes citas programadas',
    showScheduleButton: true,
    scheduleButtonText: 'Agendar mi primera cita'
  })

  defineEmits<{
    (e: 'schedule-appointment'): void
  }>()

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      reservada: 'Programada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      in_progress: 'En progreso',
      pagada: 'Pagada'
    }
    return statusMap[status] || status
  }

  const paymentsComposable = usePayments()
  const notifications = useNotifications()
  const processingPayment = ref<number | null>(null)

  const getStatusSeverity = (status: string): string => {
    const severityMap: Record<string, string> = {
      reservada: 'info',
      completed: 'success',
      cancelled: 'danger',
      in_progress: 'warning',
      pagada: 'success'
    }
    return severityMap[status] || 'info'
  }

  const handlePayment = async (appointment: Appointment) => {
    try {
      processingPayment.value = appointment.id
      const success = await paymentsComposable.createAndRedirectToPayment(appointment)

      if (!success) {
        notifications.showError(
          'Error en el pago',
          paymentsComposable.error.value ||
            'No se pudo procesar el pago. Por favor, intente nuevamente.'
        )
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      notifications.showError(
        'Error',
        'Ocurrió un error al procesar el pago. Por favor, intente nuevamente.'
      )
    } finally {
      processingPayment.value = null
    }
  }
</script>

<style scoped>
  .appointments-container {
    width: 100%;
  }

  .appointments-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    gap: 1rem;
  }

  .status-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .status-tag {
    margin-right: 0.5rem;
  }

  .appointment-details {
    flex: 1;
  }

  .appointment-doctor {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }
  .appointment-specialty {
    font-size: 0.9rem;
    color: #7f8c8d;
  }

  .appointment-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    padding: 0.5rem 0;
    text-align: center;
  }

  .appointment-time .time {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.2;
  }

  .appointment-time .date {
    font-size: 0.8rem;
    font-weight: 400;
    color: #718096;
    margin-top: 2px;
  }
</style>

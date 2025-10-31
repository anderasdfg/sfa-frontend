<template>
  <div class="today-appointments-view">
    <div class="header">
      <h1>Citas de Hoy</h1>
      <button @click="loadTodayAppointments" class="btn-refresh">
        <i class="pi pi-refresh"></i> Actualizar
      </button>
    </div>

    <div v-if="loadingAppointments" class="loading-state">
      Cargando citas...
    </div>

    <div v-else-if="todayAppointments.length === 0" class="empty-state">
      No hay citas programadas para hoy
    </div>

    <div v-else class="appointments-table">
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Doctor</th>
            <th>Especialidad</th>
            <th>Estado</th>
            <th>Llegada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apt in todayAppointments" :key="apt.id">
            <td>{{ formatTime(apt.slot?.scheduled_at ? String(apt.slot.scheduled_at) : undefined) }}</td>
            <td>
              <strong>{{ apt.patient_data?.first_name }} {{ apt.patient_data?.last_name }}</strong>
            </td>
            <td>Dr. {{ apt.doctor_data?.first_name }} {{ apt.doctor_data?.last_name }}</td>
            <td>{{ apt.specialty || '-' }}</td>
            <td>
              <span :class="`status-badge status-${apt.status}`">
                {{ getStatusLabel(apt.status) }}
              </span>
            </td>
            <td>
              <span v-if="apt.patient_arrived" class="arrived-badge">
                ✓ {{ formatTime(apt.arrival_time) }}
              </span>
              <span v-else class="not-arrived">-</span>
            </td>
            <td>
              <div class="action-buttons">
                <ConfirmArrivalButton
                  v-if="!apt.patient_arrived && apt.status === 'pagada'"
                  :appointment-id="apt.id"
                  :patient-arrived="apt.patient_arrived"
                  @confirmed="handleArrivalConfirmed"
                  @error="handleError"
                />
                <VideoMeetingButton
                  v-if="apt.modality === 'teleconsulta' && apt.patient_arrived"
                  :appointment-id="apt.id"
                  role="doctor"
                  button-text="🎥"
                  :title="`Consulta - ${apt.patient_data?.first_name}`"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import { PatientQueueService } from '@/services/patientQueue.service'
import type { Appointment } from '@/types/appointments.types'
import ConfirmArrivalButton from '@/modules/appointment-system/components/ConfirmArrivalButton.vue'
import VideoMeetingButton from '@/shared/components/VideoMeetingButton.vue'

const todayAppointments = ref<Appointment[]>([])
const loadingAppointments = ref(false)

const loadTodayAppointments = async () => {
  loadingAppointments.value = true
  try {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const response = await AppointmentService.getAppointments({
      date_from: dateString,
      date_to: dateString
    })

    if (response && response.data && Array.isArray(response.data)) {
      todayAppointments.value = response.data
    } else {
      todayAppointments.value = []
    }
  } catch (e) {
    console.error('Error loading appointments:', e)
    todayAppointments.value = []
  } finally {
    loadingAppointments.value = false
  }
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    reservada: 'Reservada',
    pagada: 'Pagada',
    realizada: 'Realizada',
    cancelada: 'Cancelada',
    confirmada: 'Confirmada'
  }
  return labels[status] || status
}

const handleArrivalConfirmed = async (appointmentId: number) => {
  const appointment = todayAppointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    try {
      await PatientQueueService.addToQueue({
        appointment_id: appointmentId,
        doctor_id: appointment.doctor_id,
        service_id: appointment.slot?.id || 1
      })
      await loadTodayAppointments()
    } catch (e) {
      console.error('Error adding to queue:', e)
      alert('Error al agregar a la cola')
    }
  }
}

const handleError = (message: string) => {
  alert(message)
}

onMounted(() => {
  loadTodayAppointments()
  
  // Actualizar cada 30 segundos
  setInterval(() => {
    loadTodayAppointments()
  }, 30000)
})
</script>

<style scoped>
.today-appointments-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #1a202c;
  margin: 0;
}

.btn-refresh {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #3182ce;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem;
  color: #718096;
  font-size: 1.125rem;
}

.appointments-table {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.appointments-table table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table th {
  text-align: left;
  padding: 1rem;
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
}

.appointments-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.appointments-table tbody tr:hover {
  background: #f7fafc;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.status-reservada {
  background: #feebc8;
  color: #7c2d12;
}

.status-pagada {
  background: #c6f6d5;
  color: #22543d;
}

.status-realizada {
  background: #e9d8fd;
  color: #44337a;
}

.status-cancelada {
  background: #fed7d7;
  color: #742a2a;
}

.arrived-badge {
  color: #38a169;
  font-weight: 500;
}

.not-arrived {
  color: #a0aec0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>

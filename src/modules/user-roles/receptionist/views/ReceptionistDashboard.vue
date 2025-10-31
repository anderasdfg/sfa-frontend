<template>
  <div class="receptionist-dashboard">
    <div class="dashboard-header">
      <h1>Panel de Recepción</h1>
      <p class="subtitle">Gestión de citas y pacientes del día</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #ebf8ff">
          <i class="pi pi-calendar" style="color: #3182ce"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Citas Hoy</div>
          <div class="stat-value">{{ todayStats.total }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #c6f6d5">
          <i class="pi pi-check-circle" style="color: #38a169"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Pacientes Llegados</div>
          <div class="stat-value">{{ todayStats.arrived }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #feebc8">
          <i class="pi pi-clock" style="color: #d69e2e"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">En Espera</div>
          <div class="stat-value">{{ todayStats.waiting }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #e9d8fd">
          <i class="pi pi-users" style="color: #805ad5"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Doctores Presentes</div>
          <div class="stat-value">{{ todayStats.doctorsPresent }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div class="actions-grid">
        <button @click="goToQueue" class="action-btn">
          <i class="pi pi-list"></i>
          <span>Cola de Pacientes</span>
        </button>
        <button @click="goToCheckIn" class="action-btn">
          <i class="pi pi-clock"></i>
          <span>Registrar Asistencia</span>
        </button>
        <button @click="goToAppointments" class="action-btn">
          <i class="pi pi-calendar"></i>
          <span>Ver Agenda</span>
        </button>
        <button @click="goToNewAppointment" class="action-btn">
          <i class="pi pi-plus"></i>
          <span>Nueva Cita</span>
        </button>
      </div>
    </div>

    <!-- Citas del Día -->
    <div class="today-appointments">
      <div class="section-header">
        <h2>Citas de Hoy</h2>
        <button @click="loadTodayAppointments" class="btn-refresh">
          <i class="pi pi-refresh"></i> Actualizar
        </button>
      </div>

      <div v-if="loadingAppointments" class="loading">
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
              <td>{{ apt.doctor_data?.first_name }} {{ apt.doctor_data?.last_name }}</td>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppointmentService } from '@/services/appointments.service'
import { DoctorAttendanceService } from '@/services/doctorAttendance.service'
import { PatientQueueService } from '@/services/patientQueue.service'
import type { Appointment } from '@/types/appointments.types'
import ConfirmArrivalButton from '@/modules/appointment-system/components/ConfirmArrivalButton.vue'
import VideoMeetingButton from '@/shared/components/VideoMeetingButton.vue'

const router = useRouter()
const todayAppointments = ref<Appointment[]>([])
const loadingAppointments = ref(false)
const queueStats = ref({ waiting: 0, in_consultation: 0 })
const attendanceStats = ref({ present: 0 })

const todayStats = computed(() => ({
  total: todayAppointments.value.length,
  arrived: todayAppointments.value.filter(a => a.patient_arrived).length,
  waiting: queueStats.value.waiting,
  doctorsPresent: attendanceStats.value.present
}))

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

const loadQueueStats = async () => {
  try {
    const stats = await PatientQueueService.getStatistics()
    queueStats.value = {
      waiting: stats.waiting,
      in_consultation: stats.in_consultation
    }
  } catch (e) {
    console.error('Error loading queue stats:', e)
  }
}

const loadAttendanceStats = async () => {
  try {
    const attendances = await DoctorAttendanceService.getTodayAttendances()
    attendanceStats.value = {
      present: attendances.filter(a => a.status === 'presente' || a.status === 'tardanza').length
    }
  } catch (e) {
    console.error('Error loading attendance stats:', e)
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
  await loadTodayAppointments()
  await loadQueueStats()
  
  // Agregar a la cola automáticamente
  const appointment = todayAppointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    try {
      await PatientQueueService.addToQueue({
        appointment_id: appointmentId,
        doctor_id: appointment.doctor_id
      })
    } catch (e) {
      console.error('Error adding to queue:', e)
    }
  }
}

const handleError = (message: string) => {
  alert(message)
}

const goToQueue = () => router.push('/patient-queue')
const goToCheckIn = () => router.push('/doctor-attendance/check-in')
const goToAppointments = () => router.push('/appointments')
const goToNewAppointment = () => router.push('/appointments/new')

onMounted(() => {
  loadTodayAppointments()
  loadQueueStats()
  loadAttendanceStats()
  
  // Actualizar cada 30 segundos
  setInterval(() => {
    loadTodayAppointments()
    loadQueueStats()
    loadAttendanceStats()
  }, 30000)
})
</script>

<style scoped>
.receptionist-dashboard {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1a202c;
}

.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h2 {
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #4299e1;
  background: #ebf8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-btn i {
  font-size: 2rem;
  color: #4299e1;
}

.action-btn span {
  font-weight: 500;
  color: #2d3748;
}

.today-appointments {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #1a202c;
  margin: 0;
}

.btn-refresh {
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #3182ce;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.appointments-table {
  overflow-x: auto;
}

.appointments-table table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table th {
  text-align: left;
  padding: 0.75rem;
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
}

.appointments-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
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

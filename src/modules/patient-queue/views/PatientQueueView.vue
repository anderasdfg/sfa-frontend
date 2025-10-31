<template>
  <div class="patient-queue-view">
    <div class="header">
      <h1>Cola de Pacientes</h1>
      <div class="actions">
        <button @click="refreshQueue" class="btn-refresh">
          <span>🔄</span> Actualizar
        </button>
        <router-link to="/patient-queue/statistics" class="btn-stats">
          📊 Estadísticas
        </router-link>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Doctor:</label>
        <select v-model="filters.doctor_id" @change="loadQueue">
          <option :value="undefined">Todos</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.first_name }} {{ doctor.last_name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Estado:</label>
        <select v-model="filters.status" @change="loadQueue">
          <option :value="undefined">Todos</option>
          <option value="waiting">En espera</option>
          <option value="in_consultation">En consulta</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Fecha:</label>
        <input type="date" v-model="filters.date" @change="loadQueue" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando cola...</div>

    <!-- Error -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Lista de pacientes en cola -->
    <div v-if="!loading && !error" class="queue-list">
      <div v-if="queue.length === 0" class="empty-state">
        No hay pacientes en la cola
      </div>

      <div v-for="item in queue" :key="item.id" class="queue-item" :class="`status-${item.status}`">
        <div class="queue-position">
          <span class="position-number">{{ item.queue_position }}</span>
        </div>

        <div class="patient-info">
          <h3>{{ item.patient?.first_name }} {{ item.patient?.last_name }}</h3>
          <p class="patient-details">
            📋 {{ item.patient?.medical_record_number }} | 
            📞 {{ item.patient?.phone }}
          </p>
        </div>

        <div class="appointment-info">
          <p><strong>Doctor:</strong> {{ item.doctor?.first_name }} {{ item.doctor?.last_name }}</p>
          <p><strong>Hora cita:</strong> {{ formatTime(item.appointment?.appointment_date) }}</p>
          <p v-if="item.estimated_wait_minutes">
            <strong>Tiempo estimado:</strong> {{ item.estimated_wait_minutes }} min
          </p>
        </div>

        <div class="status-badge">
          <span :class="`badge badge-${item.status}`">
            {{ getStatusLabel(item.status) }}
          </span>
        </div>

        <div class="actions">
          <button
            v-if="item.status === 'waiting'"
            @click="callPatient(item.id)"
            class="btn-call"
          >
            📞 Llamar
          </button>
          <button
            v-if="item.status === 'in_consultation'"
            @click="completePatient(item.id)"
            class="btn-complete"
          >
            ✅ Completar
          </button>
          <button
            v-if="item.status === 'waiting'"
            @click="removeFromQueue(item.id)"
            class="btn-remove"
          >
            ❌ Remover
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PatientQueueService } from '@/services/patientQueue.service'
import { DoctorService } from '@/services/doctors.service'
import { AppointmentService } from '@/services/appointments.service'
import type { PatientQueue } from '@/types/patientQueue.types'
import type { Doctor } from '@/types/doctor.types'
import { PatientQueueStatus } from '@/types/enums'

const queue = ref<PatientQueue[]>([])
const doctors = ref<Doctor[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filters = ref({
  doctor_id: undefined as number | undefined,
  status: undefined as PatientQueueStatus | undefined,
  date: new Date().toISOString().split('T')[0]
})

const loadQueue = async () => {
  loading.value = true
  error.value = null
  try {
    const queueData = await PatientQueueService.getQueue(filters.value)
    
    // Enriquecer cada item con datos del appointment
    const enrichedQueue = await Promise.all(
      queueData.map(async (item) => {
        try {
          const appointment = await AppointmentService.getAppointmentById(item.appointment_id)
          return {
            ...item,
            appointment,
            patient: appointment.patient_data,
            doctor: appointment.doctor_data
          }
        } catch (e) {
          console.error(`Error loading appointment ${item.appointment_id}:`, e)
          return item
        }
      })
    )
    
    queue.value = enrichedQueue
  } catch (e: any) {
    error.value = e.message || 'Error al cargar la cola'
  } finally {
    loading.value = false
  }
}

const loadDoctors = async () => {
  try {
    doctors.value = await DoctorService.getDoctors()
  } catch (e) {
    console.error('Error loading doctors:', e)
  }
}

const refreshQueue = () => {
  loadQueue()
}

const callPatient = async (id: number) => {
  try {
    await PatientQueueService.callPatient(id)
    await loadQueue()
  } catch (e: any) {
    alert(e.message || 'Error al llamar al paciente')
  }
}

const completePatient = async (id: number) => {
  try {
    await PatientQueueService.completePatient(id)
    await loadQueue()
  } catch (e: any) {
    alert(e.message || 'Error al completar atención')
  }
}

const removeFromQueue = async (id: number) => {
  if (!confirm('¿Está seguro de remover este paciente de la cola?')) return
  
  try {
    await PatientQueueService.removeFromQueue(id)
    await loadQueue()
  } catch (e: any) {
    alert(e.message || 'Error al remover paciente')
  }
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    waiting: 'En espera',
    in_consultation: 'En consulta',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return labels[status] || status
}

onMounted(() => {
  loadQueue()
  loadDoctors()
})
</script>

<style scoped>
.patient-queue-view {
  padding: 2rem;
  max-width: 1400px;
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
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh,
.btn-stats {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh {
  background: #4299e1;
  color: white;
  border: none;
}

.btn-refresh:hover {
  background: #3182ce;
}

.btn-stats {
  background: #48bb78;
  color: white;
}

.btn-stats:hover {
  background: #38a169;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.875rem;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
}

.error {
  color: #e53e3e;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.125rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.queue-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.queue-item.status-in_consultation {
  border-color: #4299e1;
  background: #ebf8ff;
}

.queue-position {
  flex-shrink: 0;
}

.position-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #4299e1;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
}

.patient-info {
  flex: 1;
}

.patient-info h3 {
  font-size: 1.125rem;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.patient-details {
  color: #718096;
  font-size: 0.875rem;
}

.appointment-info {
  flex: 1;
}

.appointment-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #4a5568;
}

.status-badge {
  flex-shrink: 0;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-waiting {
  background: #fef5e7;
  color: #d69e2e;
}

.badge-in_consultation {
  background: #ebf8ff;
  color: #3182ce;
}

.badge-completed {
  background: #f0fff4;
  color: #38a169;
}

.badge-cancelled {
  background: #fff5f5;
  color: #e53e3e;
}

.queue-item .actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-call,
.btn-complete,
.btn-remove {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-call {
  background: #4299e1;
  color: white;
}

.btn-call:hover {
  background: #3182ce;
}

.btn-complete {
  background: #48bb78;
  color: white;
}

.btn-complete:hover {
  background: #38a169;
}

.btn-remove {
  background: #fc8181;
  color: white;
}

.btn-remove:hover {
  background: #f56565;
}
</style>

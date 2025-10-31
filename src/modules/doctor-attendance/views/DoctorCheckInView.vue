<template>
  <div class="check-in-view">
    <div class="header">
      <h1>Registrar Check-In de Doctor</h1>
      <router-link to="/doctor-attendance" class="btn-back">
        ← Volver
      </router-link>
    </div>

    <div class="check-in-form">
      <div class="form-group">
        <label>Doctor *</label>
        <select v-model="formData.doctor_id" required>
          <option :value="undefined">Seleccione un doctor</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.first_name }} {{ doctor.last_name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Fecha *</label>
        <input type="date" v-model="formData.date" required />
      </div>

      <div class="form-group">
        <label>Hora de Entrada *</label>
        <input type="time" v-model="formData.check_in_time" required />
      </div>

      <div class="form-group">
        <label>Notas (opcional)</label>
        <textarea v-model="formData.notes" rows="4" placeholder="Observaciones..."></textarea>
      </div>

      <div class="form-actions">
        <button @click="handleSubmit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Registrando...' : '✅ Registrar Check-In' }}
        </button>
        <button @click="setCurrentTime" class="btn-now" type="button">
          🕐 Usar hora actual
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>
    </div>

    <!-- Asistencias de hoy -->
    <div class="today-attendances">
      <h2>Check-Ins de Hoy</h2>
      <div v-if="todayAttendances.length === 0" class="empty-state">
        No hay registros de hoy
      </div>
      <div v-else class="attendance-cards">
        <div v-for="attendance in todayAttendances" :key="attendance.id" class="attendance-card">
          <div class="card-header">
            <h3>{{ attendance.doctor?.first_name }} {{ attendance.doctor?.last_name }}</h3>
            <span :class="`status-badge status-${attendance.status}`">
              {{ getStatusLabel(attendance.status) }}
            </span>
          </div>
          <div class="card-body">
            <p><strong>Check-In:</strong> {{ attendance.check_in_time }}</p>
            <p><strong>Check-Out:</strong> {{ attendance.check_out_time || 'Pendiente' }}</p>
            <p v-if="attendance.notes"><strong>Notas:</strong> {{ attendance.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DoctorAttendanceService } from '@/services/doctorAttendance.service'
import { DoctorService } from '@/services/doctors.service'
import type { DoctorAttendance } from '@/types/doctorAttendance.types'
import type { Doctor } from '@/types/doctor.types'

const router = useRouter()
const doctors = ref<Doctor[]>([])
const todayAttendances = ref<DoctorAttendance[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const formData = ref({
  doctor_id: undefined as number | undefined,
  date: new Date().toISOString().split('T')[0],
  check_in_time: '',
  notes: ''
})

const loadDoctors = async () => {
  try {
    doctors.value = await DoctorService.getDoctors()
  } catch (e) {
    console.error('Error loading doctors:', e)
  }
}

const loadTodayAttendances = async () => {
  try {
    todayAttendances.value = await DoctorAttendanceService.getTodayAttendances()
  } catch (e) {
    console.error('Error loading today attendances:', e)
  }
}

const setCurrentTime = () => {
  const now = new Date()
  formData.value.check_in_time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const handleSubmit = async () => {
  error.value = null
  success.value = null

  if (!formData.value.doctor_id || !formData.value.date || !formData.value.check_in_time) {
    error.value = 'Por favor complete todos los campos requeridos'
    return
  }

  loading.value = true
  try {
    await DoctorAttendanceService.checkIn({
      doctor_id: formData.value.doctor_id,
      date: formData.value.date,
      check_in_time: formData.value.check_in_time + ':00',
      notes: formData.value.notes || undefined
    })

    success.value = 'Check-in registrado exitosamente'
    
    // Reset form
    formData.value = {
      doctor_id: undefined,
      date: new Date().toISOString().split('T')[0],
      check_in_time: '',
      notes: ''
    }

    // Reload today attendances
    await loadTodayAttendances()

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/doctor-attendance')
    }, 2000)
  } catch (e: any) {
    error.value = e.message || 'Error al registrar check-in'
  } finally {
    loading.value = false
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    presente: 'Presente',
    ausente: 'Ausente',
    tardanza: 'Tardanza',
    permiso: 'Permiso',
    vacaciones: 'Vacaciones'
  }
  return labels[status] || status
}

onMounted(() => {
  loadDoctors()
  loadTodayAttendances()
  setCurrentTime()
})
</script>

<style scoped>
.check-in-view {
  padding: 2rem;
  max-width: 1200px;
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

.btn-back {
  padding: 0.75rem 1.5rem;
  background: #4a5568;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #2d3748;
}

.check-in-form {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-submit,
.btn-now {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  background: #48bb78;
  color: white;
  flex: 1;
}

.btn-submit:hover:not(:disabled) {
  background: #38a169;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-now {
  background: #4299e1;
  color: white;
}

.btn-now:hover {
  background: #3182ce;
}

.error-message,
.success-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.error-message {
  background: #fed7d7;
  color: #742a2a;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
}

.today-attendances {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.today-attendances h2 {
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.attendance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.attendance-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  font-size: 1rem;
  color: #1a202c;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-presente {
  background: #c6f6d5;
  color: #22543d;
}

.status-tardanza {
  background: #feebc8;
  color: #7c2d12;
}

.card-body p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #4a5568;
}
</style>

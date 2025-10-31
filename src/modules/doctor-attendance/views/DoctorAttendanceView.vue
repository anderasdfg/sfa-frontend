<template>
  <div class="doctor-attendance-view">
    <div class="header">
      <div class="actions">
        <router-link to="/doctor-attendance/check-in" class="btn-check-in">
          ✅ Registrar Check-In
        </router-link>
        <router-link to="/doctor-attendance/statistics" class="btn-stats">
          📊 Estadísticas
        </router-link>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Doctor:</label>
        <select v-model="filters.doctor_id" @change="loadAttendances">
          <option :value="undefined">Todos</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.first_name }} {{ doctor.last_name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Estado:</label>
        <select v-model="filters.status" @change="loadAttendances">
          <option :value="undefined">Todos</option>
          <option value="presente">Presente</option>
          <option value="ausente">Ausente</option>
          <option value="tardanza">Tardanza</option>
          <option value="permiso">Permiso</option>
          <option value="vacaciones">Vacaciones</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Desde:</label>
        <input type="date" v-model="filters.date_from" @change="loadAttendances" />
      </div>

      <div class="filter-group">
        <label>Hasta:</label>
        <input type="date" v-model="filters.date_to" @change="loadAttendances" />
      </div>

      <button @click="showTodayOnly" class="btn-today">Hoy</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando asistencias...</div>

    <!-- Error -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Lista de asistencias -->
    <div v-if="!loading && !error" class="attendance-list">
      <div v-if="attendances.length === 0" class="empty-state">No hay registros de asistencia</div>

      <table v-else class="attendance-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Doctor</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Estado</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attendance in attendances" :key="attendance.id">
            <td>{{ formatDate(attendance.date) }}</td>
            <td>
              <strong>
                {{ attendance.doctor?.first_name }} {{ attendance.doctor?.last_name }}
              </strong>
            </td>
            <td>{{ attendance.check_in_time }}</td>
            <td>{{ attendance.check_out_time || '-' }}</td>
            <td>
              <span :class="`status-badge status-${attendance.status}`">
                {{ getStatusLabel(attendance.status) }}
              </span>
            </td>
            <td>{{ attendance.notes || '-' }}</td>
            <td>
              <button
                v-if="!attendance.check_out_time"
                @click="checkOut(attendance.id)"
                class="btn-checkout"
              >
                🚪 Check-Out
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { DoctorAttendanceService } from '@/services/doctorAttendance.service'
  import { DoctorService } from '@/services/doctors.service'
  import type { DoctorAttendance } from '@/types/doctorAttendance.types'
  import type { Doctor } from '@/types/doctor.types'
  import { DoctorAttendanceStatus } from '@/types/enums'

  const attendances = ref<DoctorAttendance[]>([])
  const doctors = ref<Doctor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref({
    doctor_id: undefined as number | undefined,
    status: undefined as DoctorAttendanceStatus | undefined,
    date_from: undefined as string | undefined,
    date_to: undefined as string | undefined
  })

  const loadAttendances = async () => {
    loading.value = true
    error.value = null
    try {
      attendances.value = await DoctorAttendanceService.getAttendances(filters.value)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar asistencias'
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

  const showTodayOnly = () => {
    const today = new Date().toISOString().split('T')[0]
    filters.value.date_from = today
    filters.value.date_to = today
    loadAttendances()
  }

  const checkOut = async (attendanceId: number) => {
    const now = new Date()
    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`

    try {
      await DoctorAttendanceService.checkOut({
        attendance_id: attendanceId,
        check_out_time: checkOutTime
      })
      await loadAttendances()
    } catch (e: any) {
      alert(e.message || 'Error al registrar salida')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
    showTodayOnly()
    loadDoctors()
  })
</script>

<style scoped>
  .doctor-attendance-view {
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
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .btn-check-in,
  .btn-stats {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-check-in {
    background: #48bb78;
    color: white;
  }

  .btn-check-in:hover {
    background: #38a169;
  }

  .btn-stats {
    background: #4299e1;
    color: white;
  }

  .btn-stats:hover {
    background: #3182ce;
  }

  .filters {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
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

  .btn-today {
    padding: 0.5rem 1rem;
    background: #805ad5;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-today:hover {
    background: #6b46c1;
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

  .attendance-table {
    width: 100%;
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .attendance-table thead {
    background: #4a5568;
    color: white;
  }

  .attendance-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .attendance-table td {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .attendance-table tbody tr:hover {
    background: #f7fafc;
  }

  .status-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    display: inline-block;
  }

  .status-presente {
    background: #c6f6d5;
    color: #22543d;
  }

  .status-ausente {
    background: #fed7d7;
    color: #742a2a;
  }

  .status-tardanza {
    background: #feebc8;
    color: #7c2d12;
  }

  .status-permiso {
    background: #bee3f8;
    color: #2c5282;
  }

  .status-vacaciones {
    background: #e9d8fd;
    color: #44337a;
  }

  .btn-checkout {
    padding: 0.5rem 1rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-checkout:hover {
    background: #3182ce;
  }
</style>

<template>
  <div class="doctor-attendance-view">
    <!-- Filtros colapsables -->
    <div class="filters-section">
      <div class="filters-header" @click="showFilters = !showFilters">
        <div class="filters-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filtros</span>
        </div>
        <button class="btn-clear-filters" @click.stop="clearFilters">Limpiar filtros</button>
      </div>

      <div v-show="showFilters" class="filters-content">
        <div class="filter-group">
          <label>Doctor</label>
          <select v-model="filters.doctor_id" @change="loadAttendances">
            <option :value="undefined">Todos los doctores</option>
            <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.first_name }} {{ doctor.last_name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Estado</label>
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
          <label>Desde</label>
          <input type="date" v-model="filters.date_from" @change="loadAttendances" />
        </div>

        <div class="filter-group">
          <label>Hasta</label>
          <input type="date" v-model="filters.date_to" @change="loadAttendances" />
        </div>

        <button @click="showTodayOnly" class="btn-today">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Hoy
        </button>
      </div>
    </div>

    <!-- Header con título y acciones -->
    <div class="content-header">
      <div class="header-info">
        <h2>Registro de Asistencia</h2>
        <p class="record-count">{{ attendances.length }} registros en total</p>
      </div>
      <div class="header-actions">
        <button class="btn-export">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar
        </button>
        <router-link to="/doctor-attendance/check-in" class="btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Registrar Check-In
        </router-link>
        <router-link to="/doctor-attendance/statistics" class="btn-secondary">
          Ver Estadísticas
        </router-link>
      </div>
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
            <th>FECHA</th>
            <th>DOCTOR</th>
            <th>ESPECIALIDAD</th>
            <th>CHECK-IN</th>
            <th>CHECK-OUT</th>
            <th>ESTADO</th>
            <th>NOTAS</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attendance in attendances" :key="attendance.id">
            <td class="date-cell">{{ formatDate(attendance.date) }}</td>
            <td>
              <div class="doctor-cell">
                <div class="doctor-avatar">
                  {{ getInitials(attendance.doctor?.first_name, attendance.doctor?.last_name) }}
                </div>
                <span class="doctor-name">
                  {{ attendance.doctor?.first_name }} {{ attendance.doctor?.last_name }}
                </span>
              </div>
            </td>
            <td class="specialty-cell">{{ attendance.doctor?.specialty_name || '-' }}</td>
            <td>{{ attendance.check_in_time }}</td>
            <td>{{ attendance.check_out_time || '-' }}</td>
            <td>
              <span :class="`status-badge status-${attendance.status}`">
                <span class="status-icon"></span>
                {{ getStatusLabel(attendance.status) }}
              </span>
            </td>
            <td class="notes-cell">{{ attendance.notes || '-' }}</td>
            <td>
              <div class="actions-cell">
                <button
                  v-if="!attendance.check_out_time"
                  @click="checkOut(attendance.id)"
                  class="btn-checkout"
                >
                  Check-Out
                </button>
                <button class="btn-menu">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
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
  import { DoctorAttendanceService } from '@/services/doctorAttendance.service'
  import { DoctorService } from '@/services/doctors.service'
  import type { DoctorAttendance } from '@/types/doctorAttendance.types'
  import type { Doctor } from '@/types/doctor.types'
  import { DoctorAttendanceStatus } from '@/types/enums'

  const attendances = ref<DoctorAttendance[]>([])
  const doctors = ref<Doctor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showFilters = ref(true)

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
      const data = await DoctorAttendanceService.getAttendances(filters.value)
      // Mapear los doctores a las asistencias
      attendances.value = data.map(attendance => ({
        ...attendance,
        doctor: doctors.value.find(d => d.id === attendance.doctor_id)
      }))
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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?'
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  const clearFilters = () => {
    filters.value = {
      doctor_id: undefined,
      status: undefined,
      date_from: undefined,
      date_to: undefined
    }
    loadAttendances()
  }

  onMounted(async () => {
    await loadDoctors()
    showTodayOnly()
  })
</script>

<style scoped>
  .doctor-attendance-view {
    padding: 1.5rem;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* Filtros colapsables */
  .filters-section {
    background: white;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    cursor: pointer;
    user-select: none;
  }

  .filters-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #2d3748;
    font-size: 0.875rem;
  }

  .filters-title svg {
    color: #718096;
  }

  .btn-clear-filters {
    padding: 0.375rem 0.75rem;
    background: transparent;
    color: #4299e1;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-clear-filters:hover {
    background: #ebf8ff;
  }

  .filters-content {
    display: flex;
    gap: 0.875rem;
    padding: 0 1.25rem 1.25rem;

    margin-top: 0;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
    min-width: 160px;
  }

  .filter-group label {
    font-weight: 500;
    color: #4a5568;
    font-size: 0.8125rem;
  }

  .filter-group select,
  .filter-group input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: white;
    transition: all 0.2s;
  }

  .filter-group select:focus,
  .filter-group input:focus {
    outline: none;
    border-color: var(--color-sf-green-normal);
    box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
  }

  .btn-today {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    color: #2d3748;
    border: 1px solid #cbd5e0;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    align-self: flex-end;
  }

  .btn-today:hover {
    background: #f7fafc;
    border-color: var(--color-sf-green-normal);
  }

  .btn-today svg {
    width: 16px;
    height: 16px;
  }

  /* Header con título y acciones */
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .header-info h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.25rem 0;
  }

  .record-count {
    font-size: 0.8125rem;
    color: #718096;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .btn-export,
  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    border: none;
  }

  .btn-export {
    background: white;
    color: #4a5568;
    border: 1px solid #cbd5e0;
  }

  .btn-export:hover {
    background: #f7fafc;
  }

  .btn-primary {
    background: var(--color-sf-green-normal);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-sf-green-dark);
  }

  .btn-secondary {
    background: #4a5568;
    color: white;
  }

  .btn-secondary:hover {
    background: #2d3748;
  }

  .btn-export svg,
  .btn-primary svg {
    width: 16px;
    height: 16px;
  }

  .loading,
  .error {
    text-align: center;
    padding: 1.5rem;
    font-size: 0.9375rem;
  }

  .error {
    color: #e53e3e;
  }

  .empty-state {
    text-align: center;
    padding: 2.5rem;
    color: #718096;
    font-size: 0.9375rem;
  }

  /* Tabla */
  .attendance-table {
    width: 100%;
    background: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  .attendance-table thead {
    background: #f7fafc;
    border-bottom: 2px solid #e2e8f0;
  }

  .attendance-table th {
    padding: 0.875rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.6875rem;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .attendance-table td {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.875rem;
    color: #2d3748;
  }

  .attendance-table tbody tr:hover {
    background: #f7fafc;
  }

  .attendance-table tbody tr:last-child td {
    border-bottom: none;
  }

  .date-cell {
    color: #4a5568;
    font-size: 0.8125rem;
  }

  /* Doctor cell con avatar */
  .doctor-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .doctor-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #4a5568;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .doctor-name {
    font-weight: 500;
    color: #2d3748;
  }

  .specialty-cell {
    color: #718096;
    font-size: 0.8125rem;
  }

  .notes-cell {
    color: #718096;
    font-size: 0.8125rem;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Status badges */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-icon {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-presente {
    background: #d1fae5;
    color: #065f46;
  }

  .status-presente .status-icon {
    background: #10b981;
  }

  .status-ausente {
    background: #fee2e2;
    color: #991b1b;
  }

  .status-ausente .status-icon {
    background: #ef4444;
  }

  .status-tardanza {
    background: #fef3c7;
    color: #92400e;
  }

  .status-tardanza .status-icon {
    background: #f59e0b;
  }

  .status-permiso {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-permiso .status-icon {
    background: #3b82f6;
  }

  .status-vacaciones {
    background: #e9d5ff;
    color: #6b21a8;
  }

  .status-vacaciones .status-icon {
    background: #a855f7;
  }

  /* Actions cell */
  .actions-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-checkout {
    padding: 0.4375rem 0.875rem;
    background: #2d3748;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-checkout:hover {
    background: #1a202c;
  }

  .btn-menu {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    color: #718096;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-menu:hover {
    background: #f7fafc;
    color: #2d3748;
  }
</style>

<template>
  <div class="attendance-statistics">
    <div class="header">
      <h1>Estadísticas de Asistencia</h1>
      <router-link to="/doctor-attendance" class="btn-back">
        ← Volver
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Doctor:</label>
        <select v-model="selectedDoctorId" @change="loadStatistics">
          <option :value="undefined">Todos los doctores</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.first_name }} {{ doctor.last_name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Desde:</label>
        <input type="date" v-model="dateFrom" @change="loadStatistics" />
      </div>

      <div class="filter-group">
        <label>Hasta:</label>
        <input type="date" v-model="dateTo" @change="loadStatistics" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando estadísticas...</div>

    <!-- Error -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Estadísticas -->
    <div v-if="!loading && !error && statistics" class="stats-grid">
      <div class="stat-card presente">
        <div class="stat-icon-wrapper presente-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <p class="stat-label">Presente</p>
        <p class="stat-value">{{ statistics.presente }}</p>
      </div>

      <div class="stat-card ausente">
        <div class="stat-icon-wrapper ausente-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <p class="stat-label">Ausente</p>
        <p class="stat-value">{{ statistics.ausente }}</p>
      </div>

      <div class="stat-card tardanza">
        <div class="stat-icon-wrapper tardanza-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <p class="stat-label">Tardanza</p>
        <p class="stat-value">{{ statistics.tardanza }}</p>
      </div>

      <div class="stat-card permiso">
        <div class="stat-icon-wrapper permiso-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <p class="stat-label">Permiso</p>
        <p class="stat-value">{{ statistics.permiso }}</p>
      </div>

      <div class="stat-card vacaciones">
        <div class="stat-icon-wrapper vacaciones-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
          </svg>
        </div>
        <p class="stat-label">Vacaciones</p>
        <p class="stat-value">{{ statistics.vacaciones }}</p>
      </div>

      <div class="stat-card total">
        <div class="stat-icon-wrapper total-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
        </div>
        <p class="stat-label">Total de Días</p>
        <p class="stat-value">{{ statistics.total }}</p>
      </div>

      <div class="stat-card rate">
        <div class="stat-icon-wrapper rate-bg">
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <p class="stat-label">Tasa de Asistencia</p>
        <p class="stat-value">{{ statistics.attendance_rate.toFixed(1) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DoctorAttendanceService } from '@/services/doctorAttendance.service'
import { DoctorService } from '@/services/doctors.service'
import type { DoctorAttendanceStatistics } from '@/types/doctorAttendance.types'
import type { Doctor } from '@/types/doctor.types'

const statistics = ref<DoctorAttendanceStatistics | null>(null)
const doctors = ref<Doctor[]>([])
const selectedDoctorId = ref<number | undefined>(undefined)
const dateFrom = ref<string | undefined>(undefined)
const dateTo = ref<string | undefined>(undefined)
const loading = ref(false)
const error = ref<string | null>(null)

const loadStatistics = async () => {
  loading.value = true
  error.value = null
  try {
    statistics.value = await DoctorAttendanceService.getStatistics(
      selectedDoctorId.value,
      dateFrom.value,
      dateTo.value
    )
  } catch (e: any) {
    error.value = e.message || 'Error al cargar estadísticas'
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

onMounted(() => {
  // Set default date range (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
  dateTo.value = today.toISOString().split('T')[0]

  loadStatistics()
  loadDoctors()
})
</script>

<style scoped>
.attendance-statistics {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.75rem;
  color: #1a202c;
  font-weight: 600;
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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  max-width: 1200px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s;
  position: relative;
}

.stat-card.presente {
  border-color: #9ae6b4;
}

.stat-card.ausente {
  border-color: #feb2b2;
}

.stat-card.tardanza {
  border-color: #fbd38d;
}

.stat-card.permiso {
  border-color: #90cdf4;
}

.stat-card.vacaciones {
  border-color: #d6bcfa;
}

.stat-card.total {
  border-color: #cbd5e0;
}

.stat-card.rate {
  border-color: #9ae6b4;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  width: 20px;
  height: 20px;
}

.presente-bg {
  background: #c6f6d5;
}

.presente-bg .stat-icon {
  color: #22543d;
}

.ausente-bg {
  background: #fed7d7;
}

.ausente-bg .stat-icon {
  color: #742a2a;
}

.tardanza-bg {
  background: #feebc8;
}

.tardanza-bg .stat-icon {
  color: #7c2d12;
}

.permiso-bg {
  background: #bee3f8;
}

.permiso-bg .stat-icon {
  color: #2c5282;
}

.vacaciones-bg {
  background: #e9d8fd;
}

.vacaciones-bg .stat-icon {
  color: #44337a;
}

.total-bg {
  background: #e6fffa;
}

.total-bg .stat-icon {
  color: #234e52;
}

.rate-bg {
  background: #c6f6d5;
}

.rate-bg .stat-icon {
  color: #22543d;
}

.stat-label {
  font-size: 0.8125rem;
  color: #4a5568;
  margin: 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  line-height: 1;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-card {
    padding: 1rem 0.875rem;
  }
  
  .stat-icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .stat-icon {
    width: 18px;
    height: 18px;
  }
}
</style>

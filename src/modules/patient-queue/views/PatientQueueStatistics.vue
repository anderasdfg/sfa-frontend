<template>
  <div class="queue-statistics">
    <div class="header">
      <h1>Estadísticas de Cola</h1>
      <Button
        icon="pi pi-arrow-left"
        label="Volver a la cola"
        @click="goBackToQueue"
        class="p-button-outlined"
      />
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Fecha</label>
          <Calendar
            v-model="selectedDate"
            dateFormat="dd/mm/yy"
            placeholder="Seleccionar fecha"
            :showIcon="true"
            showButtonBar
            @update:model-value="applyFilters"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Doctor</label>
          <Dropdown
            v-model="selectedDoctorId"
            :options="doctors"
            optionLabel="full_name"
            optionValue="id"
            placeholder="Todos los doctores"
            :showClear="true"
            @update:model-value="applyFilters"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <Dropdown
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los estados"
            :showClear="true"
            @update:model-value="applyFilters"
          />
        </div>

        <div class="filter-group filter-actions">
          <Button
            label="Limpiar filtros"
            icon="pi pi-filter-slash"
            @click="clearFilters"
            class="p-button-outlined p-button-secondary"
            :disabled="!hasActiveFilters"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando estadísticas...</div>

    <!-- Error -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Estadísticas -->
    <div v-if="!loading && !error && statistics" class="stats-grid">

      <div class="stat-card paid">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Pagadas</h3>
          <p class="stat-value">{{ statistics.paid }}</p>
        </div>
      </div>

      <div class="stat-card waiting">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h3>En Espera</h3>
          <p class="stat-value">{{ statistics.waiting }}</p>
        </div>
      </div>

      <div class="stat-card in-consultation">
        <div class="stat-icon">👨‍⚕️</div>
        <div class="stat-content">
          <h3>En Consulta</h3>
          <p class="stat-value">{{ statistics.in_consultation }}</p>
        </div>
      </div>

      <div class="stat-card completed">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Completados</h3>
          <p class="stat-value">{{ statistics.completed }}</p>
        </div>
      </div>

      <div class="stat-card cancelled">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <h3>Cancelados</h3>
          <p class="stat-value">{{ statistics.cancelled }}</p>
        </div>
      </div>

      <div class="stat-card appointments">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>Citas</h3>
          <p class="stat-value">{{ statistics.appointments }}</p>
        </div>
      </div>

      <div class="stat-card test-orders">
        <div class="stat-icon">🧪</div>
        <div class="stat-content">
          <h3>Exámenes</h3>
          <p class="stat-value">{{ statistics.testOrders }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import { DoctorService } from '@/services/doctors.service'
import { usePatientQueue } from '../composables/usePatientQueue'
import type { Doctor } from '@/types/doctor.types'

const router = useRouter()
const doctors = ref<Doctor[]>([])
const selectedDoctorId = ref<number | undefined>(undefined)
const selectedDate = ref<Date>(new Date())
const selectedStatus = ref<string>('')

// Status options similar to PatientQueueView
interface StatusOption {
  label: string
  value: string
}

const statusOptions: StatusOption[] = [
  { label: 'Todos', value: '' },
  { label: 'Pagado', value: 'pagado' },
  { label: 'En espera', value: 'en_espera' },
  { label: 'Atendiendo', value: 'en_proceso' },
  { label: 'Completado', value: 'completado' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Realizada', value: 'realizada' }
]

// Usar el composable de patient queue
const {
  activities,
  loading,
  error,
  fetchTodayPaidActivities
} = usePatientQueue()

// Utility function to format date to Lima timezone
const formatDateToLima = (date: Date): string => {
  return date.toLocaleDateString('en-CA', { 
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Function to get equivalent states
const getEquivalentStates = (selectedState: string): string[] => {
  const stateGroups: Record<string, string[]> = {
    'pagado': ['pagado', 'pagada'],
    'en_espera': ['en_espera'],
    'en_proceso': ['en_proceso'],
    'completado': ['completado', 'completada'],
    'cancelado': ['cancelado', 'cancelada'],
    'realizada': ['realizada']
  }
  
  return stateGroups[selectedState] || [selectedState]
}

// Computed para actividades filtradas
const filteredActivities = computed(() => {
  let filtered = [...activities.value]

  if (selectedDoctorId.value) {
    filtered = filtered.filter(item => item.doctor_id === selectedDoctorId.value)
  }

  if (selectedStatus.value) {
    const equivalentStates = getEquivalentStates(selectedStatus.value)
    filtered = filtered.filter(item => equivalentStates.includes(item.status))
  }

  if (selectedDate.value) {
    const selectedDateStr = formatDateToLima(selectedDate.value)
    filtered = filtered.filter(item => {
      const itemDate = formatDateToLima(new Date(item.scheduled_at))
      return itemDate === selectedDateStr
    })
  }

  return filtered
})

// Computed para estadísticas basado en actividades filtradas
const statistics = computed(() => {
  const activities = filteredActivities.value
  
  const total = activities.length
  const appointments = activities.filter(a => a.type === 'appointment').length
  const testOrders = activities.filter(a => a.type === 'test_order').length
  const waiting = activities.filter(a => a.status === 'en_espera').length
  const paid = activities.filter(a => a.status === 'pagada' || a.status === 'pagado').length
  const in_consultation = activities.filter(a => a.status === 'en_proceso').length
  const completed = activities.filter(a => 
    ['completado', 'completada', 'realizada'].includes(a.status)
  ).length
  const cancelled = activities.filter(a => 
    ['cancelado', 'cancelada'].includes(a.status)
  ).length
  
  return {
    total,
    appointments,
    testOrders,
    waiting,
    paid,
    in_consultation,
    completed,
    cancelled
  }
})

// Computed to check if there are active filters
const hasActiveFilters = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const filterDate = selectedDate.value ? new Date(selectedDate.value) : null
  filterDate?.setHours(0, 0, 0, 0)
  
  const hasDateFilter = filterDate && filterDate.getTime() !== today.getTime()
  const hasDoctorFilter = !!selectedDoctorId.value
  
  return !!(hasDateFilter || hasDoctorFilter || selectedStatus.value)
})

// Navigation functions
const goBackToQueue = () => {
  router.push('/patient-queue')
}

// Filter functions
const applyFilters = () => {
  // Los filtros se aplican automáticamente a través del computed filteredActivities
}

const clearFilters = () => {
  selectedStatus.value = ''
  selectedDate.value = new Date() // Resetear a hoy
  selectedDoctorId.value = undefined
}

const loadDoctors = async () => {
  try {
    const doctorsData = await DoctorService.getDoctors()
    doctors.value = doctorsData.map(doctor => ({
      ...doctor,
      full_name: `Dr. ${doctor.first_name} ${doctor.last_name}`
    }))
  } catch (e) {
    console.error('Error loading doctors:', e)
  }
}

onMounted(async () => {
  await Promise.all([
    fetchTodayPaidActivities(),
    loadDoctors()
  ])
})
</script>

<style scoped>
.queue-statistics {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header h1 {
  font-size: 2rem;
  color: #1a202c;
  margin: 0;
}

/* Filtros similares a PatientQueueView */
.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #4a5568;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1a202c;
  margin: 0;
}

.stat-card.waiting {
  border-left: 4px solid #d69e2e;
}

.stat-card.in-consultation {
  border-left: 4px solid #3182ce;
}

.stat-card.completed {
  border-left: 4px solid #38a169;
}

.stat-card.cancelled {
  border-left: 4px solid #e53e3e;
}

.stat-card.total {
  border-left: 4px solid #4a5568;
}

.stat-card.paid {
  border-left: 4px solid #38a169;
}

.stat-card.appointments {
  border-left: 4px solid #3182ce;
}

.stat-card.test-orders {
  border-left: 4px solid #d69e2e;
}

/* Responsive Design */
@media (max-width: 768px) {
  .queue-statistics {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .filters-section {
    padding: 1rem;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>

<template>
  <div class="patient-queue">
    <!-- Filtros y acciones -->
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
            v-model="selectedDoctor"
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

      <div class="queue-actions-section">
        <Button
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-outlined"
          @click="refreshQueue"
          :loading="loading"
        />
        <Button
          icon="pi pi-chart-line"
          label="Estadísticas"
          class="p-button-outlined"
          @click="showStats"
        />
      </div>
    </div>

    <!-- Lista de pacientes -->
    <div v-if="loading" class="loading-state">
      <ProgressSpinner />
      <p>Cargando cola de pacientes...</p>
    </div>

    <!-- Lista de actividades filtradas -->
    <div v-else-if="filteredQueue.length > 0" class="queue-list">
      <div
        v-for="item in filteredQueue"
        :key="`${item.id}-${item.type}`"
        class="appointment-card"
        :class="{ 'test-order-card': item.type === 'test_order' }"
      >
        <!-- Time section -->
        <div class="appointment-time">
          <div class="time">{{ formatTime(item.scheduled_at) }}</div>
          <div class="date">{{ formatDate(item.scheduled_at) }}</div>
        </div>

        <!-- Details section -->
        <div class="appointment-details">
          <div class="appointment-patient">
            {{ item.patient_name }}
            <span class="activity-badge" :class="item.type === 'test_order' ? 'test-badge' : 'appointment-badge'">
              {{ item.type === 'appointment' ? 'Cita' : 'Examen' }}
            </span>
          </div>
          <div class="appointment-specialty">
            {{ item.service_name }}
          </div>
          <div v-if="item.doctor_name" class="appointment-service">
            {{ item.doctor_name }}
          </div>
          <div v-if="item.duration_minutes" class="appointment-meta">
            <span v-if="item.duration_minutes" class="meta-item">
              <i class="pi pi-stopwatch"></i> {{ item.duration_minutes }} min
            </span>
          </div>
        </div>

        <!-- Status section -->
        <div class="appointment-status">
          <Tag
            :value="getStatusLabel(item.status)"
            :severity="getStatusSeverity(item.status)"
            class="status-tag"
          />
        </div>

        <!-- Actions section -->
        <div class="appointment-actions">
          <!-- Si está pagado, puede marcar que llegó -->
          <Button
            v-if="item.status === 'pagada' || item.status === 'pagado'"
            label="Paciente llegó"
            icon="pi pi-check"
            size="small"
            :loading="actionLoading === `${item.type}-${item.id}`"
            :disabled="!!actionLoading"
            @click="markAsArrived(item)"
            class="p-button-success p-button-sm"
          />
          
          <!-- Si está en espera, puede llamarlo -->
          <Button
            v-if="item.status === 'en_espera'"
            label="Llamar paciente"
            icon="pi pi-phone"
            size="small"
            @click="callPatient(item)"
            class="p-button-info p-button-sm"
          />

          <!-- Siempre mostrar datos del paciente -->
          <Button
            label="Datos del paciente"
            icon="pi pi-user"
            size="small"
            @click="viewPatientData(item)"
            class="p-button-outlined p-button-sm"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-users empty-icon"></i>
      <h3>No hay pacientes en cola</h3>
      <p>{{ getEmptyMessage() }}</p>
    </div>

    <!-- Modal de datos del paciente -->
    <PatientDataModal
      v-model:visible="showPatientModal"
      :patient-id="selectedPatientId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { DoctorService } from '@/services/doctors.service'
import { usePatientQueue } from '../composables/usePatientQueue'
import PatientDataModal from '../components/PatientDataModal.vue'
import type { PatientQueueActivity } from '../composables/usePatientQueue'
import type { Doctor } from '@/types/doctor.types'

const toast = useToast()
const router = useRouter()

// Use patient queue composable
const {
  activities,
  loading,
  error,
  fetchTodayPaidActivities,
  markPatientArrived
} = usePatientQueue()

// Local state for filters
const doctors = ref<Doctor[]>([])
const selectedDoctor = ref<number | null>(null)
const selectedStatus = ref<string>('')
const selectedDate = ref<Date>(new Date())
const actionLoading = ref<string>('')

// Modal state for patient data
const showPatientModal = ref(false)
const selectedPatientId = ref<number | null>(null)

// Status options
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

// Utility function to format date to Lima timezone
const formatDateToLima = (date: Date): string => {
  return date.toLocaleDateString('en-CA', { 
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Computed for filtered queue
const filteredQueue = computed(() => {
  let filtered = [...activities.value]

  if (selectedDoctor.value) {
    filtered = filtered.filter(item => item.doctor_id === selectedDoctor.value)
  }

  if (selectedStatus.value) {
    // Mapear estados equivalentes para filtrar por variaciones
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

  return filtered.sort((a, b) => 
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )
})

const hasActiveFilters = computed(() => {
  // No considerar la fecha como filtro activo si es hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const filterDate = selectedDate.value ? new Date(selectedDate.value) : null
  filterDate?.setHours(0, 0, 0, 0)
  
  const hasDateFilter = filterDate && filterDate.getTime() !== today.getTime()
  
  // Verificar si el doctor seleccionado es diferente al doctor por defecto
  const defaultDoctorId = activities.value.find(activity => activity.doctor_id && activity.doctor_id > 0)?.doctor_id
  const hasDoctorFilter = selectedDoctor.value && selectedDoctor.value !== defaultDoctorId
  
  return !!(hasDateFilter || hasDoctorFilter || selectedStatus.value)
})

// Methods
const refreshQueue = async () => {
  try {
    await fetchTodayPaidActivities()
    
    // Seleccionar el primer doctor por defecto si no hay uno seleccionado
    setDefaultDoctor()
    
    toast.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'La cola de pacientes ha sido actualizada',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar la cola de pacientes',
      life: 3000
    })
  }
}

const markAsArrived = async (activity: PatientQueueActivity) => {
  const loadingKey = `${activity.type}-${activity.id}`
  actionLoading.value = loadingKey
  
  try {
    await markPatientArrived(activity)
    
    toast.add({
      severity: 'success',
      summary: 'Paciente registrado',
      detail: `${activity.patient_name} ha sido marcado como presente`,
      life: 3000
    })
  } catch (error) {
    console.error('Error marking patient as arrived:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudo registrar la llegada del paciente',
      life: 3000
    })
  } finally {
    actionLoading.value = ''
  }
}

const callPatient = async (activity: PatientQueueActivity) => {
  try {
    // TODO: Implement actual call functionality
    toast.add({
      severity: 'info',
      summary: 'Llamando paciente',
      detail: `Llamando a ${activity.patient_name}...`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo realizar la llamada',
      life: 3000
    })
  }
}

const showStats = () => {
  // Redirigir a la vista de estadísticas usando el router de Vue
  router.push('/patient-queue/statistics')
}

const applyFilters = () => {
  // Los filtros se aplican automáticamente a través del computed filteredQueue
}

const loadDoctors = async () => {
  try {
    const doctorsData = await DoctorService.getDoctors()
    doctors.value = doctorsData.map(doctor => ({
      ...doctor,
      full_name: `Dr. ${doctor.first_name} ${doctor.last_name}`
    }))
  } catch (error) {
    console.error('Error loading doctors:', error)
  }
}

const clearFilters = () => {
  selectedStatus.value = ''
  selectedDate.value = new Date() // Resetear a hoy
  
  // Resetear al doctor por defecto en lugar de null
  selectedDoctor.value = null
  setDefaultDoctor()
}

const getEquivalentStates = (selectedState: string): string[] => {
  // Mapear estados equivalentes para incluir todas las variaciones
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

const getEmptyMessage = (): string => {
  if (selectedDoctor.value || selectedStatus.value) {
    return 'No se encontraron pacientes que coincidan con los filtros aplicados'
  }
  return 'No hay pacientes en cola para la fecha seleccionada'
}

const formatTime = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(date)
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

const viewPatientData = (activity: PatientQueueActivity) => {
  if (!activity.patient_id) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No se encontró el ID del paciente',
      life: 3000
    })
    return
  }

  selectedPatientId.value = activity.patient_id
  showPatientModal.value = true
}

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Estados pagados homologados
    'pagada': 'Pagado',
    'pagado': 'Pagado',
    
    // Estados de proceso
    'en_espera': 'En espera',
    'en_proceso': 'Atendiendo', // Cambio aquí: mostrar "Atendiendo" en lugar de "En proceso"
    
    // Estados completados homologados
    'completada': 'Completado',
    'completado': 'Completado',
    'realizada': 'Realizada',
    
    // Estados cancelados homologados
    'cancelada': 'Cancelado',
    'cancelado': 'Cancelado'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severityMap: Record<string, string> = {
    // Estados pagados - verde (success)
    'pagada': 'success',
    'pagado': 'success',
    
    // Estados en espera - amarillo/naranja (warning) 
    'en_espera': 'warning',
    
    // Estados atendiendo - azul (info)
    'en_proceso': 'info',
    
    // Estados completados - verde (success)
    'completada': 'success', 
    'completado': 'success',
    'realizada': 'success',
    
    // Estados cancelados - rojo (danger)
    'cancelada': 'danger',
    'cancelado': 'danger'
  }
  return severityMap[status] || 'secondary'
}

// Función para seleccionar el primer doctor por defecto
const setDefaultDoctor = () => {
  if (activities.value.length > 0 && !selectedDoctor.value) {
    // Encontrar el primer doctor disponible en las actividades
    const firstActivity = activities.value.find(activity => activity.doctor_id && activity.doctor_id > 0)
    if (firstActivity) {
      selectedDoctor.value = firstActivity.doctor_id
    }
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchTodayPaidActivities(),
    loadDoctors()
  ])
  
  // Seleccionar el primer doctor por defecto después de cargar las actividades
  setDefaultDoctor()
  
  // Handle errors from composable
  if (error.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 5000
    })
  }
})
</script>

<style scoped>
.patient-queue {
  max-width: 1200px;
  margin: 0 auto;
}

/* Filtros */
.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
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

.queue-actions-section {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
  color: #e53e3e;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

/* Lista de actividades */
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  gap: 1rem;
}

.appointment-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.test-order-card {
  border-left: 4px solid var(--color-sf-green-normal);
}

.appointment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  text-align: center;
}

.appointment-time .time {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
}

.appointment-time .date {
  font-size: 0.8rem;
  font-weight: 400;
  color: #718096;
  margin-top: 4px;
}

.appointment-details {
  flex: 1;
  min-width: 0;
}

.appointment-patient {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.appointment-specialty {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.appointment-service {
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.appointment-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.meta-item {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item i {
  color: #9ca3af;
}

.activity-badge {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.appointment-badge {
  background-color: #dbeafe;
  color: #1e40af;
}

.test-badge {
  background-color: #fef3c7;
  color: #92400e;
}

.appointment-status {
  display: flex;
  align-items: center;
}

.status-tag {
  white-space: nowrap;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .patient-queue {
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

  .queue-actions-section {
    flex-direction: column;
  }

  .queue-actions-section button {
    width: 100%;
  }

  .appointment-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .appointment-time {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .appointment-actions {
    width: 100%;
  }

  .appointment-actions button {
    flex: 1;
  }

  .appointment-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}


</style>

<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido, {{ userDisplayName }}!</h1>
          <p class="text-gray-600">
            {{ welcomeMessage }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">
            {{ currentDate }}
          </div>
          <div class="text-sm text-gray-500">
            {{ currentTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats for Doctor -->
    <div class="stats-grid mb-6">
      <Card v-for="stat in quickStats" :key="stat.key" class="stat-card">
        <template #content>
          <div class="flex items-center">
            <div class="stat-icon" :class="stat.iconClass">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          <div v-if="stat.change" class="stat-change" :class="stat.changeClass">
            <i :class="stat.changeIcon"></i>
            {{ stat.change }}
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Today's Appointments -->
      <Card class="appointments-card">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Citas de Hoy</span>
            <Button
              icon="pi pi-plus"
              class="p-button-sm p-button-text"
              @click="navigateToNewAppointment"
              label="Nueva Cita"
            />
          </div>
        </template>
        <template #content>
          <div v-if="todayAppointments.length > 0" class="appointments-list">
            <div
              v-for="appointment in todayAppointments"
              :key="appointment.id"
              class="appointment-item"
              @click="viewAppointment(appointment.id)"
            >
              <div class="appointment-time">
                {{ formatTime(appointment.appointment_date) }}
              </div>
              <div class="appointment-details">
                <div class="appointment-patient">
                  {{ appointment.patient_name }}
                </div>
                <div class="appointment-type">
                  {{ appointment.modality }}
                </div>
              </div>
              <div class="appointment-status">
                <Tag
                  :value="getStatusLabel(appointment.status)"
                  :severity="getStatusSeverity(appointment.status)"
                />
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="pi pi-calendar text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">No hay citas programadas para hoy</p>
          </div>
        </template>
      </Card>

      <!-- Quick Actions for Doctor -->
      <Card class="actions-card">
        <template #title>Acciones Rápidas</template>
        <template #content>
          <div class="quick-actions">
            <Button
              label="Nueva Cita"
              icon="pi pi-plus"
              class="action-button"
              @click="navigateToNewAppointment"
            />
            <Button
              label="Buscar Paciente"
              icon="pi pi-search"
              class="action-button"
              @click="navigateToPatients"
            />
            <Button
              label="Historial Médico"
              icon="pi pi-file-medical"
              class="action-button"
              @click="navigateToMedicalRecords"
            />
            <Button
              label="Mi Agenda"
              icon="pi pi-calendar"
              class="action-button"
              @click="navigateToSchedule"
            />
          </div>
        </template>
      </Card>

      <!-- Recent Activity -->
      <Card class="activity-card">
        <template #title>Actividad Reciente</template>
        <template #content>
          <div v-if="recentActivity.length > 0" class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.iconClass">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <div class="activity-description">
                  {{ activity.description }}
                </div>
                <div class="activity-time">
                  {{ formatRelativeTime(activity.timestamp) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="pi pi-clock text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">No hay actividad reciente</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useAuthStore } from '@/stores/auth/authStore'
import { formatTime, formatDate } from '@/shared/lib/formatters'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const currentTime = ref('')
const currentDate = ref('')
const todayAppointments = ref<any[]>([])
const recentActivity = ref<any[]>([])

// Computed properties
const userDisplayName = computed(() => authStore.getUserDisplayName)

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  let greeting = 'Buenos días'
  if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
  else if (hour >= 18) greeting = 'Buenas noches'
  
  return `${greeting}. Listo para atender a tus pacientes.`
})

const quickStats = computed(() => [
  {
    key: 'patients-today',
    icon: 'pi pi-users',
    iconClass: 'bg-blue-100 text-blue-600',
    label: 'Pacientes Hoy',
    value: todayAppointments.value.length.toString(),
    change: '+2 vs ayer',
    changeIcon: 'pi pi-arrow-up',
    changeClass: 'text-green-600',
  },
  {
    key: 'appointments-today',
    icon: 'pi pi-calendar',
    iconClass: 'bg-green-100 text-green-600',
    label: 'Citas Hoy',
    value: todayAppointments.value.length.toString(),
    change: null,
    changeIcon: '',
    changeClass: '',
  },
  {
    key: 'pending-reviews',
    icon: 'pi pi-file-edit',
    iconClass: 'bg-orange-100 text-orange-600',
    label: 'Historiales Pendientes',
    value: '3',
    change: null,
    changeIcon: '',
    changeClass: '',
  }
])

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = formatTime(now)
  currentDate.value = formatDate(now, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`

  const days = Math.floor(hours / 24)
  return `Hace ${days} días`
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'reservada': 'Reservada',
    'confirmada': 'Confirmada',
    'finalizada': 'Completada',
    'cancelada': 'Cancelada',
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusSeverity = (status: string): string => {
  const severities = {
    'reservada': 'info',
    'confirmada': 'success',
    'finalizada': 'success',
    'cancelada': 'danger',
  }
  return severities[status as keyof typeof severities] || 'info'
}

const navigateToNewAppointment = () => {
  router.push('/appointments/new')
}

const navigateToPatients = () => {
  router.push('/patients')
}

const navigateToMedicalRecords = () => {
  router.push('/medical-records')
}

const navigateToSchedule = () => {
  router.push('/appointments')
}

const viewAppointment = (appointmentId: number) => {
  router.push(`/appointments/${appointmentId}`)
}

const loadDoctorData = async () => {
  // Simular carga de datos del doctor
  todayAppointments.value = [
    {
      id: 1,
      patient_name: 'Juan Pérez',
      appointment_date: new Date(2025, 8, 24, 9, 0),
      modality: 'Presencial',
      status: 'confirmada'
    },
    {
      id: 2,
      patient_name: 'María García',
      appointment_date: new Date(2025, 8, 24, 10, 30),
      modality: 'Teleconsulta',
      status: 'reservada'
    }
  ]

  recentActivity.value = [
    {
      id: 1,
      description: 'Nueva cita programada con Juan Pérez',
      timestamp: new Date(Date.now() - 30 * 60000),
      icon: 'pi pi-calendar-plus',
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      description: 'Historial médico actualizado',
      timestamp: new Date(Date.now() - 120 * 60000),
      icon: 'pi pi-file-edit',
      iconClass: 'bg-green-100 text-green-600',
    }
  ]
}

// Lifecycle
let timeInterval: NodeJS.Timeout

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  await loadDoctorData()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  position: relative;
  overflow: visible;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-change {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.appointment-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.appointment-time {
  font-weight: 600;
  color: #374151;
  margin-right: 1rem;
  min-width: 4rem;
}

.appointment-details {
  flex: 1;
}

.appointment-patient {
  font-weight: 500;
  color: #111827;
}

.appointment-type {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: capitalize;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  margin-right: 0.75rem;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 0.875rem;
  color: #374151;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  justify-content: flex-start;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

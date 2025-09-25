<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido, {{ userFullName }}!</h1>
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

    <!-- Quick Stats for Patient -->
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
        </template>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- My Appointments -->
      <Card class="appointments-card">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Mis Próximas Citas</span>
            <Button
              icon="pi pi-plus"
              class="p-button-sm p-button-text"
              @click="navigateToNewAppointment"
              label="Agendar"
            />
          </div>
        </template>
        <template #content>
          <div v-if="myAppointments.length > 0" class="appointments-list">
            <div
              v-for="appointment in myAppointments"
              :key="appointment.id"
              class="appointment-item"
            >
              <div class="appointment-time">
                {{ formatTime(appointment.appointment_date) }}
              </div>
              <div class="appointment-details">
                <div class="appointment-doctor">
                  Dr. {{ appointment.doctor_name }}
                </div>
                <div class="appointment-specialty">
                  {{ appointment.specialty }}
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
            <p class="text-gray-500">No tienes citas programadas</p>
            <Button 
              label="Agendar mi primera cita" 
              class="mt-3"
              @click="navigateToNewAppointment"
            />
          </div>
        </template>
      </Card>

      <!-- Quick Actions for Patient -->
      <Card class="actions-card">
        <template #title>Acciones Rápidas</template>
        <template #content>
          <div class="quick-actions">
            <Button
              label="Agendar Cita"
              icon="pi pi-calendar-plus"
              class="action-button"
              @click="navigateToNewAppointment"
            />
            <Button
              label="Mi Historial Médico"
              icon="pi pi-file"
              class="action-button"
              @click="navigateToMedicalHistory"
            />
            <Button
              label="Mis Recetas"
              icon="pi pi-file-medical"
              class="action-button"
              @click="navigateToPrescriptions"
            />
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
const myAppointments = ref<any[]>([])

// Computed properties
const userFullName = computed(() => authStore.getUserFullName)

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  let greeting = 'Buenos días'
  if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
  else if (hour >= 18) greeting = 'Buenas noches'
  
  return `${greeting}. Gestiona tus citas y consulta tu historial médico.`
})

const quickStats = computed(() => [
  {
    key: 'next-appointment',
    icon: 'pi pi-calendar',
    iconClass: 'bg-blue-100 text-blue-600',
    label: 'Próxima Cita',
    value: myAppointments.value.length > 0 ? 'Hoy 10:30' : 'Sin citas'
  },
  {
    key: 'total-appointments',
    icon: 'pi pi-clock',
    iconClass: 'bg-green-100 text-green-600',
    label: 'Citas Este Mes',
    value: '3'
  },
  {
    key: 'medical-records',
    icon: 'pi pi-file',
    iconClass: 'bg-purple-100 text-purple-600',
    label: 'Consultas Realizadas',
    value: '12'
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

const getStatusLabel = (status: string): string => {
  const labels = {
    'reservada': 'Reservada',
    'confirmada': 'Confirmada',
    'finalizada': 'Completada',
    'cancelada': 'Cancelada',
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severities = {
    'reservada': 'info',
    'confirmada': 'success',
    'finalizada': 'success',
    'cancelada': 'danger',
  }
  return severities[status] || 'info'
}

const navigateToNewAppointment = () => {
  router.push('/appointments/new')
}

const navigateToMedicalHistory = () => {
  router.push(`/medical-records/patient/${authStore.user?.id}`)
}

const navigateToPrescriptions = () => {
  router.push('/prescriptions')
}

const loadPatientData = async () => {
  // Simular carga de datos del paciente
  myAppointments.value = [
    {
      id: 1,
      doctor_name: 'García',
      specialty: 'Cardiología',
      appointment_date: new Date(2025, 8, 24, 10, 30),
      status: 'confirmada'
    }
  ]
}

// Lifecycle
let timeInterval: NodeJS.Timeout

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  await loadPatientData()
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

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
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

.appointment-doctor {
  font-weight: 500;
  color: #111827;
}

.appointment-specialty {
  font-size: 0.875rem;
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

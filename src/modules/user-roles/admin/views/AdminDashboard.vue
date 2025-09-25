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

    <!-- Quick Stats for Admin -->
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
      <!-- System Overview -->
      <Card class="overview-card">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Resumen del Sistema</span>
            <Button
              icon="pi pi-refresh"
              class="p-button-sm p-button-text"
              @click="refreshData"
            />
          </div>
        </template>
        <template #content>
          <div class="overview-grid">
            <div class="overview-item">
              <div class="overview-number">{{ totalUsers }}</div>
              <div class="overview-label">Total Usuarios</div>
            </div>
            <div class="overview-item">
              <div class="overview-number">{{ totalDoctors }}</div>
              <div class="overview-label">Doctores Activos</div>
            </div>
            <div class="overview-item">
              <div class="overview-number">{{ totalPatients }}</div>
              <div class="overview-label">Pacientes Registrados</div>
            </div>
            <div class="overview-item">
              <div class="overview-number">{{ todayAppointments }}</div>
              <div class="overview-label">Citas Hoy</div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Actions for Admin -->
      <Card class="actions-card">
        <template #title>Gestión Rápida</template>
        <template #content>
          <div class="quick-actions">
            <Button
              label="Nuevo Usuario"
              icon="pi pi-user-plus"
              class="action-button"
              @click="navigateToNewUser"
            />
            <Button
              label="Gestionar Doctores"
              icon="pi pi-users"
              class="action-button"
              @click="navigateToDoctors"
            />
            <Button
              label="Ver Reportes"
              icon="pi pi-chart-bar"
              class="action-button"
              @click="navigateToReports"
            />
            <Button
              label="Configuración"
              icon="pi pi-cog"
              class="action-button"
              @click="navigateToSettings"
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
import { useAuthStore } from '@/stores/auth/authStore'
import { formatTime, formatDate } from '@/shared/lib/formatters'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const currentTime = ref('')
const currentDate = ref('')
const totalUsers = ref(0)
const totalDoctors = ref(0)
const totalPatients = ref(0)
const todayAppointments = ref(0)
const recentActivity = ref<any[]>([])

// Computed properties
const userFullName = computed(() => authStore.getUserFullName)

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  let greeting = 'Buenos días'
  if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
  else if (hour >= 18) greeting = 'Buenas noches'
  
  return `${greeting}. Gestiona tu clínica de manera eficiente.`
})

const quickStats = computed(() => [
  {
    key: 'total-revenue',
    icon: 'pi pi-dollar',
    iconClass: 'bg-green-100 text-green-600',
    label: 'Ingresos del Mes',
    value: '$45,000',
    change: '+12% vs mes anterior',
    changeIcon: 'pi pi-arrow-up',
    changeClass: 'text-green-600',
  },
  {
    key: 'total-appointments',
    icon: 'pi pi-calendar',
    iconClass: 'bg-blue-100 text-blue-600',
    label: 'Citas del Mes',
    value: '324',
    change: '+8% vs mes anterior',
    changeIcon: 'pi pi-arrow-up',
    changeClass: 'text-green-600',
  },
  {
    key: 'patient-satisfaction',
    icon: 'pi pi-heart',
    iconClass: 'bg-purple-100 text-purple-600',
    label: 'Satisfacción',
    value: '4.8/5',
    change: '+0.2 vs mes anterior',
    changeIcon: 'pi pi-arrow-up',
    changeClass: 'text-green-600',
  },
  {
    key: 'system-uptime',
    icon: 'pi pi-server',
    iconClass: 'bg-orange-100 text-orange-600',
    label: 'Tiempo Activo',
    value: '99.9%',
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

const navigateToNewUser = () => {
  router.push('/admin/users/new')
}

const navigateToDoctors = () => {
  router.push('/admin/doctors')
}

const navigateToReports = () => {
  router.push('/admin/reports')
}

const navigateToSettings = () => {
  router.push('/admin/settings')
}

const refreshData = async () => {
  await loadAdminData()
}

const loadAdminData = async () => {
  // Simular carga de datos del administrador
  totalUsers.value = 1234
  totalDoctors.value = 45
  totalPatients.value = 1189
  todayAppointments.value = 28

  recentActivity.value = [
    {
      id: 1,
      description: 'Nuevo doctor registrado: Dr. Martínez',
      timestamp: new Date(Date.now() - 15 * 60000),
      icon: 'pi pi-user-plus',
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      description: 'Sistema actualizado a v2.1.0',
      timestamp: new Date(Date.now() - 45 * 60000),
      icon: 'pi pi-upload',
      iconClass: 'bg-green-100 text-green-600',
    },
    {
      id: 3,
      description: 'Backup automático completado',
      timestamp: new Date(Date.now() - 120 * 60000),
      icon: 'pi pi-database',
      iconClass: 'bg-purple-100 text-purple-600',
    }
  ]
}

// Lifecycle
let timeInterval: NodeJS.Timeout

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  await loadAdminData()
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.overview-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.overview-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.overview-label {
  font-size: 0.875rem;
  color: #6b7280;
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
  
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>

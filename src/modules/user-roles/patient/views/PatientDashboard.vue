<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">¡Bienvenido, {{ userFullName }}!</h1>
          <p class="text-white">
            {{ welcomeMessage }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-white">
            {{ currentDate }}
          </div>
          <div class="text-sm text-gray-white">
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
          <div v-if="loadingAppointments" class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <p class="mt-2">Cargando citas...</p>
          </div>
          <div v-else-if="appointmentsError" class="text-center p-4 text-red-500">
            <i class="pi pi-exclamation-triangle text-2xl"></i>
            <p class="mt-2">{{ appointmentsError }}</p>
            <Button 
              label="Reintentar" 
              icon="pi pi-refresh" 
              class="p-button-text p-button-sm mt-2" 
              @click="loadPatientData" 
            />
          </div>
          <AppointmentsList
            v-else
            :appointments="myAppointments"
            @schedule-appointment="navigateToNewAppointment"
          />
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
  import AppointmentsList from '../components/AppointmentsList.vue'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { formatDate, formatTime } from '@/shared/lib/formatters'
  import { usePatientAppointments } from '../composables/usePatientAppointments'

  const router = useRouter()
  const authStore = useAuthStore()

  // Composable for appointments
  const { 
    appointments: myAppointments, 
    loading: loadingAppointments, 
    error: appointmentsError, 
    fetchPatientAppointments 
  } = usePatientAppointments()

  // Reactive data
  const currentTime = ref('')
  const currentDate = ref('')

  // Computed properties
  const userFullName = computed(() => authStore.getUserFullName)

  const welcomeMessage = computed(() => {
    const hour = new Date().getHours()
    let greeting = 'Buenos días'
    if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
    else if (hour >= 18) greeting = 'Buenas noches'

    return `${greeting}. Gestiona tus citas y consulta tu historial médico.`
  })

  const quickStats = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get upcoming appointments (future or today)
    const upcomingAppointments = myAppointments.value.filter(apt => {
      const aptDate = new Date(apt.slot?.scheduled_at || apt.appointment_date)
      return aptDate >= new Date(now.setHours(0, 0, 0, 0))
    })
    
    // Get appointments for current month
    const monthlyAppointments = myAppointments.value.filter(apt => {
      const aptDate = new Date(apt.slot?.scheduled_at || apt.appointment_date)
      return aptDate.getMonth() === currentMonth && 
             aptDate.getFullYear() === currentYear
    })
    
    // Get completed appointments (assuming status 'completed' or 'pagada')
    const completedAppointments = myAppointments.value.filter(apt => 
      ['completed', 'completada', 'pagada'].includes(apt.status?.toLowerCase())
    )
    
    // Format next appointment
    const nextAppointment = upcomingAppointments.length > 0 
      ? upcomingAppointments[0]
      : null
      
    const formatNextAppointment = () => {
      if (!nextAppointment) return 'Sin citas'
      
      const aptDate = new Date(nextAppointment.slot?.scheduled_at || nextAppointment.appointment_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const isToday = aptDate >= today && 
                     aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      
      return isToday 
        ? `Hoy ${formatTime(aptDate)}`
        : `${aptDate.getDate()}/${aptDate.getMonth() + 1} ${formatTime(aptDate)}`
    }
    
    return [
      {
        key: 'next-appointment',
        icon: 'pi pi-calendar',
        iconClass: 'bg-blue-100 text-blue-600',
        label: 'Próxima Cita',
        value: formatNextAppointment()
      },
      {
        key: 'total-appointments',
        icon: 'pi pi-clock',
        iconClass: 'bg-green-100 text-green-600',
        label: 'Citas Este Mes',
        value: monthlyAppointments.length.toString()
      },
      {
        key: 'medical-records',
        icon: 'pi pi-check-circle',
        iconClass: 'bg-purple-100 text-purple-600',
        label: 'Consultas Realizadas',
        value: completedAppointments.length.toString()
      }
    ]
  })

  // Methods
  const updateTime = () => {
    const now = new Date()
    currentTime.value = formatTime(now)
    currentDate.value = formatDate(now, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateToNewAppointment = () => {
    router.push('/appointment-booking')
  }

  const navigateToMedicalHistory = () => {
    router.push(`/medical-records/patient/${authStore.user?.id}`)
  }

  const navigateToPrescriptions = () => {
    router.push('/prescriptions')
  }

  const loadPatientData = async () => {
    await fetchPatientAppointments()
  }

  // Lifecycle
  let timeInterval: NodeJS.Timeout | undefined

  onMounted(async () => {
    updateTime()
    timeInterval = setInterval(updateTime, 1000)
    try {
      await loadPatientData()
    } catch (error) {
      console.error('Error loading patient data:', error)
    }
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
    border-radius: 0.75rem;
    color: white;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-light) 0%,
      var(--color-sf-green-normal) 100%
    );
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

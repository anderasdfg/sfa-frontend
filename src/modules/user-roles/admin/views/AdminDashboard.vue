<template>
  <div class="admin-dashboard">
    <DashboardHeader />

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando dashboard...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="loadDashboard" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="dashboard-content">
      <!-- Stats Cards -->
      <StatsCards
        :waiting-patients="dashboardData.waiting_patients_count"
        :average-wait-time="dashboardData.average_wait_time"
        :available-doctors="dashboardData.available_doctors"
        :daily-revenue="dashboardData.daily_revenue"
      />

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Left Column -->
        <div class="left-column">
          <WaitingRoom :patients="dashboardData.waiting_room" />
          <DayStatistics :statistics="dashboardData.day_statistics" />
        </div>

        <!-- Middle Column -->
        <div class="middle-column">
          <UpcomingAppointments :appointments="dashboardData.upcoming_appointments" />
          <HourlyAppointments :hourly-data="dashboardData.hourly_appointments" />
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <MedicalAvailability :availability="dashboardData.medical_availability" />
          <AvailableDoctors :doctors="dashboardData.available_doctors_now" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { StatisticsService } from '@/services/statistics.service'
  import { AppointmentService } from '@/services/appointments.service'
  import type { AdminDashboard } from '@/types/statistics.types'
  import DashboardHeader from '../components/DashboardHeader.vue'
  import StatsCards from '../components/StatsCards.vue'
  import WaitingRoom from '../components/WaitingRoom.vue'
  import UpcomingAppointments from '../components/UpcomingAppointments.vue'
  import MedicalAvailability from '../components/MedicalAvailability.vue'
  import AvailableDoctors from '../components/AvailableDoctors.vue'
  import DayStatistics from '../components/DayStatistics.vue'
  import HourlyAppointments from '../components/HourlyAppointments.vue'

  const dashboardData = ref<AdminDashboard>({
    current_datetime: new Date().toISOString(),
    waiting_patients_count: 0,
    average_wait_time: 0,
    available_doctors: '0/0',
    daily_revenue: 0,
    waiting_room: [],
    upcoming_appointments: [],
    medical_availability: { available: 0, in_consultation: 0, busy: 0 },
    available_doctors_now: [],
    day_statistics: { patients_attended: 0, absences: 0, occupied_rooms: 0 },
    hourly_appointments: []
  })
  const loading = ref(true)
  const error = ref<string | null>(null)
  let refreshInterval: number | null = null

  const loadDashboard = async () => {
    try {
      loading.value = true
      error.value = null

      // Cargar datos del dashboard
      const dashboard = await StatisticsService.getAdminDashboard()

      // Obtener citas del día desde el endpoint de appointments
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      const appointmentsResponse = await AppointmentService.getAppointments({
        date_from: todayStr,
        date_to: todayStr
      })

      const appointments = appointmentsResponse.data || []
      console.log('Appointments from API:', appointments)

      // Filtrar solo citas futuras y con estado pagada
      const now = new Date()
      console.log('Current time:', now)
      console.log('Total appointments:', appointments.length)

      const upcomingAppointments = appointments
        .filter((apt: any) => {
          // Solo citas pagadas o reservadas
          if (apt.status !== 'pagada' && apt.status !== 'reservada') {
            console.log(`Appointment ${apt.id} filtered out: status = ${apt.status}`)
            return false
          }

          const aptDateTime = apt.slot?.scheduled_at || apt.appointment_date
          console.log(`Appointment ${apt.id} datetime:`, aptDateTime)

          // Remover la Z para interpretar como hora local de Perú
          const localDateString =
            typeof aptDateTime === 'string' && aptDateTime.endsWith('Z')
              ? aptDateTime.slice(0, -1)
              : aptDateTime
          const aptDate = new Date(localDateString)
          const isFuture = aptDate > now

          console.log(
            `Appointment ${apt.id}: ${localDateString} -> ${aptDate.toISOString()} > ${now.toISOString()} = ${isFuture}`
          )

          return isFuture
        })
        .slice(0, 4)
        .map((apt: any) => {
          const aptDateTime = apt.slot?.scheduled_at || apt.appointment_date
          const localDateString =
            typeof aptDateTime === 'string' && aptDateTime.endsWith('Z')
              ? aptDateTime.slice(0, -1)
              : aptDateTime
          return {
            id: apt.id,
            time: new Date(localDateString).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            patient_name: `${apt.patient_data?.first_name || ''} ${apt.patient_data?.last_name || ''}`,
            doctor_name: `Dr. ${apt.doctor_data?.last_name || ''}`,
            specialty: apt.specialty || apt.doctor_data?.specialty_name || 'Medicina General',
            status: apt.status === 'pagada' ? 'Pagada' : 'Reservada',
            modality: apt.modality === 'presencial' ? 'Presencial' : 'Telemedicina'
          }
        })

      // Reemplazar las citas del dashboard con las obtenidas del endpoint
      dashboardData.value = {
        ...dashboard,
        upcoming_appointments: upcomingAppointments
      }

      console.log('Upcoming appointments:', upcomingAppointments)
    } catch (err) {
      console.error('Error cargando dashboard:', err)
      error.value = 'No se pudo cargar el dashboard. Por favor, intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadDashboard()
    // Refrescar cada 30 segundos
    refreshInterval = window.setInterval(() => {
      loadDashboard()
    }, 150 * 1000)
  })

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
</script>

<style scoped>
  .admin-dashboard {
    padding: 1.5rem 2rem;
    min-height: 100vh;
    max-width: 100%;
    overflow-x: hidden;
  }

  .queue-display-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .banner-icon {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
  }

  .banner-text h3 {
    color: white;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  .banner-text p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    margin: 0;
  }

  .btn-open-display {
    background: white;
    color: #667eea;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-open-display:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .btn-open-display i {
    font-size: 1rem;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .loading-container {
    color: #059669;
  }

  .loading-container p {
    font-size: 1rem;
    color: #6b7280;
  }

  .error-container {
    color: #dc2626;
  }

  .error-container i {
    font-size: 3rem;
  }

  .error-container p {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }

  .btn-retry {
    padding: 0.75rem 1.5rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
  }

  .btn-retry:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
  }

  .dashboard-content {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .main-grid {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(400px, 2fr) minmax(280px, 1fr);
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  .left-column,
  .middle-column,
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }

  @media (max-width: 1400px) {
    .main-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .right-column {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
  }

  @media (max-width: 968px) {
    .main-grid {
      grid-template-columns: 1fr;
    }

    .right-column {
      grid-column: 1;
      display: flex;
      flex-direction: column;
    }
  }
</style>

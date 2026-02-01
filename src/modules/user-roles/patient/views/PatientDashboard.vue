<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section">
      <h1 class="welcome-title">¡Bienvenido, {{ userFullName }}!</h1>
      <p class="welcome-subtitle">{{ welcomeMessage }}</p>
    </div>

    <!-- Quick Stats for Patient -->
    <div class="stats-grid">
      <div v-for="stat in quickStats" :key="stat.key" class="stat-card">
        <div class="stat-icon-wrapper" :class="stat.iconClass">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-description">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- My Appointments -->
      <div class="appointments-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Mis Próximas Citas</h2>
            <p class="section-subtitle">Tienes {{ upcomingAppointmentsCount }} citas programadas</p>
          </div>
          <button class="btn-link" @click="navigateToAppointments">
            Ver todas
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>

        <div v-if="loadingAppointments" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Cargando citas...</p>
        </div>

        <div v-else-if="appointmentsError" class="error-state">
          <i class="pi pi-exclamation-triangle"></i>
          <p>{{ appointmentsError }}</p>
          <button class="btn-retry" @click="loadPatientData">
            <i class="pi pi-refresh"></i>
            Reintentar
          </button>
        </div>

        <div v-else-if="upcomingAppointments.length === 0" class="empty-appointments">
          <button class="btn-add-appointment" @click="navigateToNewAppointment">
            <i class="pi pi-plus"></i>
            Agendar nueva cita
          </button>
        </div>

        <div v-else class="appointments-list">
          <div
            v-for="appointment in upcomingAppointments.slice(0, 3)"
            :key="appointment.id"
            class="appointment-card"
          >
            <div class="appointment-avatar">
              {{ getDoctorInitials(appointment) }}
            </div>
            <div class="appointment-info">
              <p class="appointment-doctor">{{ getDoctorName(appointment) }}</p>
              <p class="appointment-specialty">
                {{
                  appointment.doctor_data?.specialty_name ||
                  appointment.doctor?.specialty_name ||
                  appointment.specialty ||
                  'Consulta general'
                }}
              </p>
              <div class="appointment-meta">
                <span class="appointment-date">
                  <i class="pi pi-calendar"></i>
                  {{ formatAppointmentDate(appointment) }}
                </span>
                <span class="appointment-time">
                  <i class="pi pi-clock"></i>
                  {{ formatAppointmentTime(appointment) }}
                </span>
              </div>
            </div>
            <div class="appointment-actions">
              <span :class="`status-badge status-${appointment.status?.toLowerCase()}`">
                <i :class="getStatusIcon(appointment.status)"></i>
                {{ getStatusLabel(appointment.status) }}
              </span>
              <button 
                v-if="isTeleconsulta(appointment) && appointment.video_meeting_url && !['reservada', 'realizada', 'cancelada'].includes(appointment.status?.toLowerCase())"
                class="btn-video-meeting"
                @click="goToVideoConsultation(appointment.video_meeting_url, appointment)"
              >
                <i class="pi pi-video"></i>
                Ingresar a Consulta
              </button>
              <button class="btn-details">Ver detalles</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Sidebar -->
      <div class="sidebar">
        <!-- Quick Actions -->
        <div class="actions-section">
          <h3 class="sidebar-title">Acciones Rápidas</h3>
          <div class="quick-actions">
            <button class="action-card action-primary" @click="navigateToNewAppointment">
              <div class="action-icon">
                <i class="pi pi-plus"></i>
              </div>
              <div class="action-content">
                <p class="action-title">Agendar Cita</p>
                <p class="action-subtitle">Reserva una nueva consulta</p>
              </div>
            </button>

            <button class="action-card" @click="navigateToMedicalHistory">
              <div class="action-icon">
                <i class="pi pi-file"></i>
              </div>
              <div class="action-content">
                <p class="action-title">Mi Historial Médico</p>
                <p class="action-subtitle">Ver expediente completo</p>
              </div>
            </button>

            <button class="action-card" @click="navigateToPrescriptions">
              <div class="action-icon">
                <i class="pi pi-file-edit"></i>
              </div>
              <div class="action-content">
                <p class="action-title">Mis Recetas</p>
                <p class="action-subtitle">Consultar prescripciones</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Health Reminder -->
        <div class="reminder-card">
          <div class="reminder-icon">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="reminder-content">
            <p class="reminder-title">Recordatorio</p>
            <p class="reminder-text">
              No olvides completar tu perfil médico para una mejor atención.
            </p>
            <button class="btn-reminder" @click="navigateToMedicalHistory">Completar ahora</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { formatDate, formatTime } from '@/shared/lib/formatters'
  import { usePatientAppointments } from '../composables/usePatientAppointments'
  import { PatientQueueService } from '@/services/patientQueue.service'

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

  const upcomingAppointments = computed(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    
    return myAppointments.value
      .filter(apt => {
        const dateString = apt.slot?.scheduled_at || apt.appointment_date
        
        // Si la fecha viene en formato UTC (con Z), la parseamos correctamente
        // removiendo la Z para que se interprete como hora local de Perú
        let aptDate: Date
        if (typeof dateString === 'string' && dateString.endsWith('Z')) {
          // Remover la Z para interpretar como hora local
          const localDateString = dateString.slice(0, -1)
          aptDate = new Date(localDateString)
        } else {
          aptDate = new Date(dateString)
        }
        
        // Filtrar citas de hoy en adelante (no por hora, sino por día completo)
        const isUpcoming = aptDate >= todayStart
        const isNotCompleted = apt.status?.toLowerCase() !== 'realizada'
        return isUpcoming && isNotCompleted
      })
      .sort((a, b) => {
        const dateA = new Date(a.slot?.scheduled_at || a.appointment_date)
        const dateB = new Date(b.slot?.scheduled_at || b.appointment_date)
        return dateA.getTime() - dateB.getTime()
      })
  })

  const upcomingAppointmentsCount = computed(() => upcomingAppointments.value.length)

  const quickStats = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Get appointments for current month
    const monthlyAppointments = myAppointments.value.filter(apt => {
      const aptDate = new Date(apt.slot?.scheduled_at || apt.appointment_date)
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
    })

    // Get completed appointments
    const completedAppointments = myAppointments.value.filter(apt =>
      ['realizada', 'completada', 'pagada'].includes(apt.status?.toLowerCase())
    )

    // Get pending exams count (placeholder)
    const pendingExams = 0

    return [
      {
        key: 'next-appointment',
        icon: 'pi pi-calendar',
        iconClass: 'icon-blue',
        label: 'Próxima Cita',
        value:
          upcomingAppointments.value.length > 0
            ? upcomingAppointments.value.length.toString()
            : 'Sin citas',
        description: upcomingAppointments.value.length > 0 ? 'Programadas' : 'Agenda tu consulta'
      },
      {
        key: 'total-appointments',
        icon: 'pi pi-clock',
        iconClass: 'icon-green',
        label: 'Citas Este Mes',
        value: monthlyAppointments.length.toString(),
        description: 'Ninguna programada'
      },
      {
        key: 'medical-records',
        icon: 'pi pi-file',
        iconClass: 'icon-purple',
        label: 'Consultas Realizadas',
        value: completedAppointments.length.toString(),
        description: 'Total histórico'
      },
      {
        key: 'pending-exams',
        icon: 'pi pi-chart-line',
        iconClass: 'icon-orange',
        label: 'Exámenes Pendientes',
        value: pendingExams.toString(),
        description: 'Resultados disponibles'
      }
    ]
  })

  const getDoctorName = (appointment: any) => {
    const doctor = appointment.doctor_data || appointment.doctor
    if (doctor) {
      return `${doctor.first_name} ${doctor.last_name}`
    }
    return 'Doctor no asignado'
  }

  const getDoctorInitials = (appointment: any) => {
    const doctor = appointment.doctor_data || appointment.doctor
    if (doctor) {
      const first = doctor.first_name?.charAt(0) || ''
      const last = doctor.last_name?.charAt(0) || ''
      return (first + last).toUpperCase()
    }
    return 'D'
  }

  const formatAppointmentDate = (appointment: any) => {
    const date = new Date(appointment.slot?.scheduled_at || appointment.appointment_date)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatAppointmentTime = (appointment: any) => {
    const date = new Date(appointment.slot?.scheduled_at || appointment.appointment_date)
    return formatTime(date)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmada: 'Confirmada',
      pendiente: 'Pendiente',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
      pagada: 'Pagada'
    }
    return labels[status?.toLowerCase()] || status
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      confirmada: 'pi pi-check-circle',
      pendiente: 'pi pi-clock',
      realizada: 'pi pi-check',
      cancelada: 'pi pi-times-circle',
      pagada: 'pi pi-check-circle'
    }
    return icons[status?.toLowerCase()] || 'pi pi-info-circle'
  }

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

  const navigateToAppointments = () => {
    router.push('/appointments')
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

  const isTeleconsulta = (appointment: any) => {
    return appointment.modality?.toLowerCase() === 'virtual' || 
           appointment.modality?.toLowerCase() === 'teleconsulta'
  }

  const goToVideoConsultation = async (url: string, appointment: any) => {
    if (!url) return

    try {
      // Si el paciente no ha marcado llegada, hacerlo automáticamente
      if (!appointment.patient_arrived) {
        await PatientQueueService.markArrival(appointment.id, {
          arrival_time: new Date().toISOString()
        })
      }

      // Abrir la videoconsulta
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al procesar ingreso a consulta:', error)
      // Aun con error, abrir la videoconsulta
      window.open(url, '_blank')
    }
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
    padding: 0.75rem 1rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Welcome Section */
  .welcome-section {
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-normal) 0%,
      var(--color-sf-green-dark) 100%
    );
    margin-bottom: 1rem;
  }

  .welcome-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin: 0 0 0.25rem 0;
  }

  .welcome-subtitle {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    background: white;
    padding: 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
  }

  .icon-blue {
    background: #dbeafe;
    color: #2563eb;
  }

  .icon-green {
    background: #d1fae5;
    color: #059669;
  }

  .icon-purple {
    background: #e9d5ff;
    color: #7c3aed;
  }

  .icon-orange {
    background: #fed7aa;
    color: #ea580c;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-description {
    font-size: 0.6875rem;
    color: #94a3b8;
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1rem;
  }

  /* Appointments Section */
  .appointments-section {
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.125rem 0;
  }

  .section-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
  }

  .btn-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.625rem;
    background: transparent;
    color: var(--color-sf-green-normal);
    border: none;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-link:hover {
    background: #f0fdf4;
  }

  .loading-state,
  .error-state {
    text-align: center;
    padding: 1.5rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .error-state {
    color: #ef4444;
  }

  .btn-retry {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--color-sf-green-normal);
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-appointments {
    text-align: center;
    padding: 2rem 1rem;
  }

  .btn-add-appointment {
    padding: 0.75rem 1.5rem;
    background: var(--color-sf-green-normal);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-add-appointment:hover {
    background: var(--color-sf-green-dark);
  }

  /* Appointments List */
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .appointment-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .appointment-card:hover {
    background: #f8fafc;
    border-color: var(--color-sf-green-light);
  }

  .appointment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8125rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .appointment-info {
    flex: 1;
    min-width: 0;
  }

  .appointment-doctor {
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.125rem 0;
    font-size: 0.875rem;
  }

  .appointment-specialty {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0 0 0.375rem 0;
  }

  .appointment-meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.6875rem;
    color: #64748b;
  }

  .appointment-date,
  .appointment-time {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .appointment-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.375rem;
  }

  .status-badge {
    padding: 0.1875rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .status-confirmada {
    background: #d1fae5;
    color: #065f46;
  }

  .status-pagada {
    background: #d1fae5;
    color: #065f46;
  }

  .status-pendiente {
    background: #fef3c7;
    color: #92400e;
  }

  .btn-details {
    padding: 0.3125rem 0.625rem;
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-details:hover {
    background: #e2e8f0;
  }

  .btn-video-meeting {
    padding: 0.3125rem 0.625rem;
    background: var(--color-sf-green-light);
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-video-meeting:hover {
    background: var(--color-sf-green-dark);
  }

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .actions-section {
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
  }

  .sidebar-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.75rem 0;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .action-card:hover {
    background: #f8fafc;
    border-color: var(--color-sf-green-light);
  }

  .action-card.action-primary {
    background: var(--color-sf-green-normal);
    border-color: var(--color-sf-green-normal);
  }

  .action-card.action-primary:hover {
    background: var(--color-sf-green-dark);
  }

  .action-card.action-primary .action-icon {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .action-card.action-primary .action-title,
  .action-card.action-primary .action-subtitle {
    color: white;
  }

  .action-icon {
    width: 36px;
    height: 36px;
    border-radius: 0.5rem;
    background: #f1f5f9;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.0625rem 0;
    font-size: 0.8125rem;
  }

  .action-subtitle {
    font-size: 0.6875rem;
    color: #64748b;
    margin: 0;
  }

  /* Reminder Card */
  .reminder-card {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 0.5rem;
    padding: 0.875rem;
    display: flex;
    gap: 0.75rem;
  }

  .reminder-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fef3c7;
    color: #d97706;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .reminder-content {
    flex: 1;
  }

  .reminder-title {
    font-weight: 600;
    color: #92400e;
    margin: 0 0 0.375rem 0;
    font-size: 0.8125rem;
  }

  .reminder-text {
    font-size: 0.75rem;
    color: #78350f;
    margin: 0 0 0.625rem 0;
    line-height: 1.4;
  }

  .btn-reminder {
    padding: 0.4375rem 0.875rem;
    background: #d97706;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-reminder:hover {
    background: #b45309;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard {
      padding: 1rem;
    }
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

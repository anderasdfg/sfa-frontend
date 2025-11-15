<template>
  <div class="patient-queue-management">
    <!-- Header with Display Button -->
    <div class="queue-header">
      <div class="header-left">
        <h1 class="page-title">Cola de Pacientes</h1>
        <p class="page-subtitle">{{ formattedDate }}</p>
      </div>
      <button @click="openQueueDisplay" class="btn-display">
        <i class="pi pi-desktop"></i>
        Abrir Display
      </button>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <!--  <div class="card-header-section">
        <h2 class="card-title">Cola de Pacientes</h2>
        <p class="card-subtitle">{{ formattedDate }}</p>
        <button class="btn-export" @click="handleExport">
          <i class="pi pi-download"></i>
          Exportar
        </button>
      </div> -->

      <div class="filters-row">
        <div class="filter-item">
          <label>Fecha</label>
          <input type="date" v-model="filters.date" @change="loadQueue" />
        </div>
        <div class="filter-item">
          <label>Doctor</label>
          <select v-model="filters.doctor_id" @change="loadQueue">
            <option :value="undefined">Todos los doctores</option>
            <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>Especialidad</label>
          <select v-model="filters.specialty_id" @change="loadQueue">
            <option :value="undefined">Todas</option>
            <option v-for="specialty in specialties" :key="specialty.id" :value="specialty.id">
              {{ specialty.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando cola de pacientes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="loadQueue" class="btn-retry">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else-if="queueData">
      <!-- Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card purple">
          <i class="pi pi-clock metric-icon-inline"></i>
          <div class="metric-info">
            <div class="metric-label">Citas Programadas</div>
            <div class="metric-value">{{ queueData.metrics.scheduled_count }}</div>
          </div>
        </div>

        <div class="metric-card yellow">
          <i class="pi pi-users metric-icon-inline"></i>
          <div class="metric-info">
            <div class="metric-label">En Sala de Espera</div>
            <div class="metric-value">{{ queueData.metrics.waiting_count }}</div>
          </div>
        </div>

        <div class="metric-card blue">
          <i class="pi pi-chart-line metric-icon-inline"></i>
          <div class="metric-info">
            <div class="metric-label">En Consulta</div>
            <div class="metric-value">{{ queueData.metrics.in_consultation_count }}</div>
          </div>
        </div>

        <div class="metric-card green">
          <i class="pi pi-check-circle metric-icon-inline"></i>
          <div class="metric-info">
            <div class="metric-label">Completados Hoy</div>
            <div class="metric-value">{{ queueData.metrics.completed_today_count }}</div>
          </div>
        </div>
      </div>

      <!-- Queue Sections -->
      <div class="queue-sections">
        <!-- Scheduled Appointments -->
        <ScheduledAppointmentsSection
          :appointments="queueData.scheduled_appointments"
          @mark-arrival="handleMarkArrival"
          @send-reminder="handleSendReminder"
        />

        <!-- Waiting Room -->
        <WaitingRoomSection
          :patients="queueData.waiting_patients"
          @call-to-consultation="handleCallToConsultation"
        />

        <!-- In Consultation -->
        <InConsultationSection :patients="queueData.in_consultation" />
      </div>
    </div>

    <!-- Arrival Confirmation Modal -->
    <ArrivalConfirmationModal
      :is-open="showArrivalModal"
      :appointment="selectedAppointment"
      @close="closeArrivalModal"
      @confirm="confirmArrival"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { PatientQueueService } from '@/services/patientQueue.service'
  import type {
    QueueOverview,
    QueueFilters,
    ScheduledAppointment
  } from '@/types/patient-queue.types'
  import ScheduledAppointmentsSection from '../components/ScheduledAppointmentsSection.vue'
  import WaitingRoomSection from '../components/WaitingRoomSection.vue'
  import InConsultationSection from '../components/InConsultationSection.vue'
  import ArrivalConfirmationModal from '../components/ArrivalConfirmationModal.vue'

  const queueData = ref<QueueOverview | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const filters = ref<QueueFilters>({
    date: new Date().toISOString().split('T')[0]
  })

  const doctors = ref<Array<{ id: number; name: string }>>([])
  const specialties = ref<Array<{ id: number; name: string }>>([])
  const showArrivalModal = ref(false)
  const selectedAppointment = ref<ScheduledAppointment | null>(null)

  let refreshInterval: number | null = null

  const formattedDate = computed(() => {
    const now = new Date()
    return now.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })

  const loadQueue = async () => {
    try {
      loading.value = true
      error.value = null
      queueData.value = await PatientQueueService.getQueueOverview(filters.value)
      console.log('Queue data loaded:', queueData.value)
    } catch (err) {
      console.error('Error loading queue:', err)
      error.value = err instanceof Error ? err.message : 'Error al cargar la cola de pacientes'
    } finally {
      loading.value = false
    }
  }

  const handleMarkArrival = (appointmentId: number) => {
    // Buscar la cita en los datos actuales
    const appointment = queueData.value?.scheduled_appointments.find(
      apt => apt.id === appointmentId
    )
    if (appointment) {
      selectedAppointment.value = appointment
      showArrivalModal.value = true
    }
  }

  const closeArrivalModal = () => {
    showArrivalModal.value = false
    selectedAppointment.value = null
  }

  const confirmArrival = async (data: {
    appointmentId: number
    paymentStatus: string
    notes: string
    arrivalTime: string
  }) => {
    try {
      // Llamar al servicio para marcar la llegada con los datos adicionales
      await PatientQueueService.markArrival(data.appointmentId, {
        payment_status: data.paymentStatus,
        notes: data.notes,
        arrival_time: data.arrivalTime
      })
      // Recargar la cola para reflejar los cambios
      await loadQueue()
    } catch (error) {
      console.error('Error marking arrival:', error)
    }
  }

  const handleSendReminder = async (appointmentId: number) => {
    try {
      await PatientQueueService.sendReminder(appointmentId)
    } catch (error) {
      console.error('Error sending reminder:', error)
    }
  }

  const handleCallToConsultation = async (queueId: number) => {
    try {
      await PatientQueueService.callPatient(queueId)
      await loadQueue()
    } catch (error) {
      console.error('Error calling patient:', error)
    }
  }

  const openQueueDisplay = () => {
    const width = 1920
    const height = 1080
    const left = (screen.width - width) / 2
    const top = (screen.height - height) / 2

    window.open(
      '/queue-display',
      'QueueDisplay',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  onMounted(() => {
    loadQueue()
    // Refrescar cada 30 segundos
    refreshInterval = window.setInterval(() => {
      loadQueue()
    }, 30000)
  })

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
</script>

<style scoped>
  .patient-queue-management {
    padding: 1rem;
    min-height: 100vh;
  }

  .queue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header-left {
    flex: 1;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  .page-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    text-transform: capitalize;
  }

  .btn-display {
    background: #059669;
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .btn-display:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .btn-display i {
    font-size: 1rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-register {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-register:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    min-width: 250px;
  }

  .search-box i {
    color: #9ca3af;
  }

  .search-box input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 0.875rem;
  }

  .filters-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .btn-export {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: white;
    color: #059669;
    border: 1px solid #059669;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-export:hover {
    background: #f0fdf4;
  }

  .filters-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-item label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .filter-item input,
  .filter-item select {
    padding: 0.625rem 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
  }

  .filter-item input:focus,
  .filter-item select:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .metric-card {
    background: white;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    border-left: 3px solid;
  }

  .metric-card.purple {
    border-left-color: #8b5cf6;
  }

  .metric-card.yellow {
    border-left-color: #f59e0b;
  }

  .metric-card.blue {
    border-left-color: #3b82f6;
  }

  .metric-card.green {
    border-left-color: #10b981;
  }

  .metric-icon-inline {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .purple .metric-icon-inline {
    color: #8b5cf6;
  }

  .yellow .metric-icon-inline {
    color: #f59e0b;
  }

  .blue .metric-icon-inline {
    color: #3b82f6;
  }

  .green .metric-icon-inline {
    color: #10b981;
  }

  .metric-info {
    flex: 1;
    min-width: 0;
  }

  .metric-label {
    font-size: 0.8125rem;
    color: #6b7280;
    margin-bottom: 0.125rem;
    font-weight: 400;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .loading-container i {
    font-size: 2.5rem;
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

  .queue-sections {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 1200px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .filters-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .queue-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .header-right {
      width: 100%;
      flex-direction: column;
    }

    .search-box {
      width: 100%;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

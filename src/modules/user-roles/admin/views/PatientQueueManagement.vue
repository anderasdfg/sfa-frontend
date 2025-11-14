<template>
  <div class="patient-queue-management">
    <!-- Header -->
    <div class="queue-header">
      <div class="header-left">
        <h1 class="page-title">Cola de Pacientes</h1>
        <p class="page-subtitle">{{ formattedDate }}</p>
      </div>
      <div class="header-right">
        <button class="btn-register" @click="handleRegisterArrival">
          <i class="pi pi-plus"></i>
          Registrar Llegada
        </button>
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input
            type="text"
            placeholder="Buscar paciente..."
            v-model="searchQuery"
          />
        </div>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="card-header-section">
        <h2 class="card-title">Cola de Pacientes</h2>
        <p class="card-subtitle">{{ formattedDate }}</p>
        <button class="btn-export" @click="handleExport">
          <i class="pi pi-download"></i>
          Exportar
        </button>
      </div>

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
            <option
              v-for="specialty in specialties"
              :key="specialty.id"
              :value="specialty.id"
            >
              {{ specialty.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-grid" v-if="queueData">
      <div class="metric-card purple">
        <div class="metric-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">Citas Programadas</div>
          <div class="metric-value">{{ queueData.metrics.scheduled_count }}</div>
        </div>
      </div>

      <div class="metric-card yellow">
        <div class="metric-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">En Sala de Espera</div>
          <div class="metric-value">{{ queueData.metrics.waiting_count }}</div>
        </div>
      </div>

      <div class="metric-card blue">
        <div class="metric-icon">
          <i class="pi pi-heart-fill"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">En Consulta</div>
          <div class="metric-value">{{ queueData.metrics.in_consultation_count }}</div>
        </div>
      </div>

      <div class="metric-card green">
        <div class="metric-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">Completados Hoy</div>
          <div class="metric-value">{{ queueData.metrics.completed_today_count }}</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando cola de pacientes...</p>
    </div>

    <!-- Queue Sections -->
    <div v-else-if="queueData" class="queue-sections">
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
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { PatientQueueService } from '@/services/patientQueue.service'
  import type { QueueOverview, QueueFilters } from '@/types/patient-queue.types'
  import ScheduledAppointmentsSection from '../components/queue/ScheduledAppointmentsSection.vue'
  import WaitingRoomSection from '../components/queue/WaitingRoomSection.vue'
  import InConsultationSection from '../components/queue/InConsultationSection.vue'

  const queueData = ref<QueueOverview | null>(null)
  const loading = ref(true)
  const searchQuery = ref('')
  const filters = ref<QueueFilters>({
    date: new Date().toISOString().split('T')[0],
  })

  const doctors = ref<Array<{ id: number; name: string }>>([])
  const specialties = ref<Array<{ id: number; name: string }>>([])

  let refreshInterval: number | null = null

  const formattedDate = computed(() => {
    const now = new Date()
    return now.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  const loadQueue = async () => {
    try {
      loading.value = true
      queueData.value = await PatientQueueService.getQueueOverview(filters.value)
    } catch (error) {
      console.error('Error loading queue:', error)
    } finally {
      loading.value = false
    }
  }

  const handleMarkArrival = async (appointmentId: number) => {
    try {
      await PatientQueueService.markArrival(appointmentId)
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

  const handleRegisterArrival = () => {
    // TODO: Abrir modal para registrar llegada manual
    console.log('Registrar llegada manual')
  }

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Exportar cola')
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
    padding: 1.5rem 2rem;
    background: #f5f5f5;
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
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
  }

  .metric-card.purple {
    border-left-color: #8b5cf6;
    background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  }

  .metric-card.yellow {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  }

  .metric-card.blue {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  }

  .metric-card.green {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  }

  .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .purple .metric-icon {
    background: #ede9fe;
    color: #7c3aed;
  }

  .yellow .metric-icon {
    background: #fef3c7;
    color: #d97706;
  }

  .blue .metric-icon {
    background: #dbeafe;
    color: #2563eb;
  }

  .green .metric-icon {
    background: #d1fae5;
    color: #059669;
  }

  .metric-content {
    flex: 1;
  }

  .metric-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .metric-value {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
  }

  .loading-container {
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

<template>
  <div class="queue-display">
    <!-- Header -->
    <div class="display-header">
      <div class="clinic-info">
        <img src="https://www.clinicasanmiguel.pe/img/logo.png" alt="Logo" class="brand-logo" />
        <div>
          <h1 class="clinic-name">Turnos en espera</h1>
          <!--  <p class="clinic-subtitle">Sistema de Gestión de Turnos</p> -->
        </div>
      </div>
      <div class="current-time">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="display-content">
      <p class="section-subtitle">Por favor observe su número de turno en la pantalla</p>

      <!-- Calling Patients (Parpadean) -->
      <div v-if="callingPatients.length > 0" class="calling-section">
        <div v-for="patient in callingPatients" :key="patient.queue_id" class="calling-card">
          <div :class="['turn-badge', `color-${getColorIndex(patient.turn_number)}`]">
            <div class="turn-label">TURNO</div>
            <div class="turn-number">{{ patient.turn_number }}</div>
          </div>
          <div class="calling-info">
            <div class="calling-direction">
              <span class="direction-label">DIRÍJASE A</span>
              <span class="room-name">{{ patient.consultation_room }}</span>
            </div>
            <div class="status-badge calling">LLAMANDO</div>
          </div>
        </div>
      </div>

      <!-- Waiting Patients -->
      <div v-if="waitingPatients.length > 0" class="waiting-section">
        <h3 class="waiting-title">Próximos Turnos</h3>
        <div class="waiting-grid">
          <div
            v-for="patient in waitingPatients.slice(0, 8)"
            :key="patient.queue_id"
            class="waiting-card"
          >
            <div class="waiting-turn">{{ patient.turn_number }}</div>
            <div class="waiting-specialty">{{ patient.specialty }}</div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="footer-info">
        <div class="info-item">
          <i class="pi pi-users"></i>
          <div>
            <div class="info-label">Próximos Turnos</div>
            <div class="info-value">{{ nextTurns }}</div>
          </div>
        </div>
        <div class="info-item">
          <i class="pi pi-clock"></i>
          <div>
            <div class="info-label">En Sala de Espera</div>
            <div class="info-value">{{ waitingCount }} pacientes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Banner -->
    <div v-if="showAlert" class="alert-banner">
      <i class="pi pi-exclamation-circle"></i>
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { PatientQueueService } from '@/services/patientQueue.service'

  interface QueuePatient {
    queue_id: number
    turn_number: string
    patient_name: string
    specialty: string
    consultation_room?: string
    status: string
  }

  const callingPatients = ref<QueuePatient[]>([])
  const waitingPatients = ref<QueuePatient[]>([])
  const currentTime = ref('')
  const currentDate = ref('')
  const showAlert = ref(false)
  const alertMessage = ref('')

  let refreshInterval: number | null = null
  let timeInterval: number | null = null

  const waitingCount = computed(() => waitingPatients.value.length)

  const nextTurns = computed(() => {
    return waitingPatients.value
      .slice(0, 3)
      .map(p => p.turn_number)
      .join(', ')
  })

  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    currentDate.value = now.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getColorIndex = (turnNumber: string): number => {
    const prefix = turnNumber.charAt(0)
    return prefix.charCodeAt(0) % 4
  }

  const loadQueueData = async () => {
    try {
      const response = await PatientQueueService.getQueueOverview({
        date: new Date().toISOString().split('T')[0]
      })

      // Pacientes siendo llamados (en consulta reciente - últimos 2 minutos)
      const now = new Date()
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000)

      callingPatients.value = response.in_consultation
        .filter((p: any) => {
          const calledAt = new Date(p.started_at)
          return calledAt > twoMinutesAgo
        })
        .map((p: any) => ({
          queue_id: p.queue_id,
          turn_number: p.turn_number || 'N/A',
          patient_name: p.patient_name,
          specialty: p.specialty,
          consultation_room: p.consultation_room,
          status: 'calling'
        }))

      // Pacientes en espera
      waitingPatients.value = response.waiting_patients.map((p: any) => ({
        queue_id: p.queue_id,
        turn_number: p.turn_number || 'N/A',
        patient_name: p.patient_name,
        specialty: p.specialty,
        status: 'waiting'
      }))
    } catch (error) {
      console.error('Error loading queue data:', error)
      showAlert.value = true
      alertMessage.value = 'Error al cargar los datos de la cola'
      setTimeout(() => {
        showAlert.value = false
      }, 5000)
    }
  }

  onMounted(() => {
    updateTime()
    loadQueueData()

    // Actualizar hora cada segundo
    timeInterval = window.setInterval(updateTime, 1000)

    // Actualizar cola cada 3 segundos
    refreshInterval = window.setInterval(loadQueueData, 3000)
  })

  onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval)
    if (refreshInterval) clearInterval(refreshInterval)
  })
</script>

<style scoped>
  .queue-display {
    min-height: 100vh;
    background: #f3f4f6;
    padding: 2rem;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
  }

  .display-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 20px;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .clinic-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .clinic-logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .clinic-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .clinic-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
  }

  .current-time {
    text-align: right;
  }

  .time {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
  }

  .date {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
    text-transform: capitalize;
  }

  .display-content {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  .section-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0 0 2rem 0;
    text-align: center;
  }

  .calling-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .calling-card {
    display: flex;
    align-items: stretch;
    border-radius: 16px;
    background: white;
    border: 3px solid #10b981;
    overflow: hidden;
    animation: pulse 1.5s ease-in-out infinite;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    50% {
      transform: scale(1.01);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .turn-badge {
    min-width: 200px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .turn-badge.color-0 {
    background: #10b981;
  }

  .turn-badge.color-1 {
    background: #3b82f6;
  }

  .turn-badge.color-2 {
    background: #a855f7;
  }

  .turn-badge.color-3 {
    background: #f59e0b;
  }

  .turn-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .turn-number {
    font-size: 4rem;
    font-weight: 900;
    color: white;
    line-height: 1;
  }

  .calling-info {
    flex: 1;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .calling-direction {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .direction-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .room-name {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
  }

  .status-badge {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.calling {
    background: #fef2f2;
    color: #ef4444;
    animation: blink 1s ease-in-out infinite;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .waiting-section {
    margin-top: 2rem;
  }

  .waiting-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
  }

  .waiting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .waiting-card {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.2s;
  }

  .waiting-card:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .waiting-turn {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .waiting-specialty {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .footer-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #e5e7eb;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .info-item i {
    font-size: 2rem;
    color: #667eea;
  }

  .info-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .info-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .alert-banner {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #ef4444;
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 1024px) {
    .calling-card {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .arrow-section {
      transform: rotate(90deg);
    }

    .waiting-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
</style>

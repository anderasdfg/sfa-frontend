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
      <p class="section-subtitle">Por favor observe su nombre en la pantalla y diríjase al consultorio indicado</p>

      <!-- Doctors Sections with Scroll -->
      <div class="doctors-container">
        <div 
          v-for="doctor in activeDoctors" 
          :key="doctor.doctor_name"
          class="doctor-section"
        >
          <!-- Doctor Header -->
          <div class="doctor-header">
            <div class="doctor-info">
              <h3 class="doctor-name">{{ doctor.doctor_name }}</h3>
              <span class="doctor-specialty">{{ doctor.specialty }}</span>
            </div>
            <div class="doctor-status">
              <div :class="['status-indicator', doctor.status]">
                <span class="status-dot"></span>
              <span class="status-text">
                <template v-if="doctor.status === 'busy' && doctor.current_patient">
                  <div class="current-patient-info">
                    <div class="patient-name-small">{{ doctor.current_patient }}</div>
                    <div class="consultation-time">{{ doctor.consultation_time }} min en consulta</div>
                  </div>
                </template>
                <template v-else-if="doctor.status === 'available'">
                  Disponible
                </template>
                <template v-else-if="doctor.status === 'finished'">
                  Terminó consulta
                </template>
              </span>
              </div>
            </div>
          </div>

          <!-- Calling Patient (if any) -->
          <div v-if="doctor.calling_patient" class="calling-patient">
            <div class="calling-card">
              <div class="patient-name-large">
                {{ doctor.calling_patient.patient_name }}
              </div>
              <div class="calling-info">
                <div class="calling-direction">
                  <span class="direction-label">
                    <template v-if="doctor.calling_patient.being_called">
                      POR FAVOR DIRÍJASE A
                    </template>
                    <template v-else>
                      DIRÍJASE A
                    </template>
                  </span>
                  <span class="room-name">{{ doctor.calling_patient.consultation_room }}</span>
                </div>
                <div class="status-badge calling">
                  <template v-if="doctor.calling_patient.being_called">
                    SIENDO LLAMADO
                  </template>
                  <template v-else>
                    LLAMANDO
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Waiting Patients for this Doctor -->
          <div v-if="doctor.waiting_patients.filter(p => !p.being_called).length > 0" class="waiting-patients">
            <h4 class="waiting-subtitle">Próximos pacientes</h4>
            <div class="patients-scroll">
              <div 
                v-for="(patient, index) in doctor.waiting_patients.filter(p => !p.being_called).slice(0, 5)"
                :key="patient.queue_id"
                class="waiting-patient"
              >
                <div class="patient-position">{{ index + 1 }}</div>
                <div class="patient-name">{{ patient.patient_name }}</div>
                <div class="patient-turn">{{ patient.turn_number }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Footer Info -->
      <div class="footer-info">
        <div class="info-item">
          <i class="pi pi-users"></i>
          <div>
            <div class="info-label">Médicos Activos</div>
            <div class="info-value">{{ activeDoctors.length }}</div>
          </div>
        </div>
        <div class="info-item">
          <i class="pi pi-clock"></i>
          <div>
            <div class="info-label">Pacientes en Espera</div>
            <div class="info-value">{{ totalWaiting }}</div>
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
    doctor_name: string
    specialty: string
    consultation_room?: string
    status: string
    started_at?: string
    consultation_minutes?: number
    being_called?: boolean
  }

  interface DoctorDisplay {
    doctor_name: string
    specialty: string
    status: 'available' | 'busy' | 'finished'
    current_patient?: string
    consultation_time?: number
    waiting_patients: QueuePatient[]
    calling_patient?: QueuePatient
  }

  const doctorsDisplay = ref<DoctorDisplay[]>([])
  const currentTime = ref('')
  const currentDate = ref('')
  const showAlert = ref(false)
  const alertMessage = ref('')

  let refreshInterval: number | null = null
  let timeInterval: number | null = null

  const totalWaiting = computed(() => 
    doctorsDisplay.value.reduce((total, doctor) => 
      total + doctor.waiting_patients.filter(p => !p.being_called).length, 0
    )
  )

  const activeDoctors = computed(() => 
    doctorsDisplay.value.filter(doctor => {
      const hasWaitingPatients = doctor.waiting_patients.some(p => !p.being_called)
      return hasWaitingPatients || doctor.calling_patient || doctor.status === 'busy'
    })
  )

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

  const loadQueueData = async () => {
    try {
      const response = await PatientQueueService.getQueueOverview({
        date: new Date().toISOString().split('T')[0]
      })

      const doctorsMap = new Map<string, DoctorDisplay>()
      const now = new Date()

      // Procesar pacientes en consulta
      response.in_consultation.forEach((p: any) => {
        const key = `${p.doctor_name}-${p.specialty}`
        if (!doctorsMap.has(key)) {
          doctorsMap.set(key, {
            doctor_name: p.doctor_name,
            specialty: p.specialty,
            status: 'busy',
            current_patient: p.patient_name,
            consultation_time: p.consultation_minutes || 0,
            waiting_patients: []
          })
        }

        // Los pacientes en consulta ya no usan el estilo llamativo
        // Solo se muestran en el estado del médico
      })

      // Procesar pacientes en espera
      response.waiting_patients.forEach((p: any) => {
        const key = `${p.doctor_name}-${p.specialty}`
        if (!doctorsMap.has(key)) {
          doctorsMap.set(key, {
            doctor_name: p.doctor_name,
            specialty: p.specialty,
            status: 'available',
            waiting_patients: []
          })
        }

        const patient = {
          queue_id: p.queue_id,
          turn_number: p.turn_number || 'N/A',
          patient_name: p.patient_name,
          doctor_name: p.doctor_name,
          specialty: p.specialty,
          status: p.being_called ? 'being-called' : 'waiting',
          being_called: p.being_called
        }
        
        if (p.being_called) {
          // Si está siendo llamado, también lo consideramos como "calling_patient"
          // Usar el consultation_room del paciente si está disponible, sino buscar alternativas
          let consultationRoom = p.consultation_room || 'Consultorio Principal'
          
          // Si no viene consultation_room, buscar si hay un paciente en consulta del mismo doctor
          if (!p.consultation_room) {
            const doctorInConsultation = response.in_consultation.find((cp: any) => 
              cp.doctor_name === p.doctor_name && cp.consultation_room
            )
            
            if (doctorInConsultation) {
              consultationRoom = doctorInConsultation.consultation_room
            } else {
              // Si no hay consultorio específico, usar un formato más genérico
              consultationRoom = `Consultorio ${p.specialty}`
            }
          }
          
          doctorsMap.get(key)!.calling_patient = {
            ...patient,
            consultation_room: consultationRoom,
            being_called: true
          }
        }
        
        doctorsMap.get(key)!.waiting_patients.push(patient)
      })

      // Procesar pacientes completados recientes para mostrar estado "finished"
      response.completed_patients.forEach((p: any) => {
        const completedAt = new Date(p.completed_at)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
        
        if (completedAt > fiveMinutesAgo) {
          const key = `${p.doctor_name}-${p.specialty}`
          if (!doctorsMap.has(key)) {
            doctorsMap.set(key, {
              doctor_name: p.doctor_name,
              specialty: p.specialty,
              status: 'finished',
              waiting_patients: []
            })
          } else if (doctorsMap.get(key)!.waiting_patients.length === 0) {
            doctorsMap.get(key)!.status = 'finished'
          }
        }
      })

      doctorsDisplay.value = Array.from(doctorsMap.values())
        .sort((a, b) => a.doctor_name.localeCompare(b.doctor_name))
        
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

  .doctors-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .doctors-container::-webkit-scrollbar {
    width: 8px;
  }

  .doctors-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .doctors-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .doctors-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .doctor-section {
    background: #f8fafc;
    border-radius: 16px;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
  }

  .doctor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .doctor-info h3.doctor-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }

  .doctor-specialty {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
  }

  .doctor-status {
    display: flex;
    align-items: center;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .status-indicator.available {
    background: #f0fdf4;
    color: #16a34a;
  }

  .status-indicator.busy {
    background: #dbeafe;
    color: #2563eb;
  }

  .status-indicator.finished {
    background: #f0f9ff;
    color: #0284c7;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: block;
  }

  .status-indicator.available .status-dot {
    background: #16a34a;
  }

  .status-indicator.busy .status-dot {
    background: #2563eb;
    animation: pulse-status 2s ease-in-out infinite;
  }

  .status-indicator.finished .status-dot {
    background: #0284c7;
  }

  @keyframes pulse-status {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }

  .consultation-time {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .current-patient-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .patient-name-small {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .current-patient-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .patient-name-small {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .calling-patient {
    margin-bottom: 1.5rem;
  }

  .calling-card {
    display: flex;
    align-items: stretch;
    border-radius: 16px;
    background: white;
    border: 3px solid #f59e0b;
    overflow: hidden;
    animation: pulse 1.5s ease-in-out infinite;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .patient-name-large {
    min-width: 250px;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f59e0b;
    color: white;
    font-size: 1.75rem;
    font-weight: 700;
    text-align: center;
  }

  .current-patient-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .patient-name-small {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

@keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
    }
    50% {
      transform: scale(1.01);
      box-shadow: 0 8px 12px rgba(245, 158, 11, 0.4);
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
    background: #f59e0b;
    color: white;
    font-weight: 700;
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

  .waiting-patients {
    margin-top: 1rem;
  }

  .waiting-subtitle {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
  }

  .patients-scroll {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .patients-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .patients-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .patients-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .waiting-patient {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    transition: all 0.2s;
  }

  .waiting-patient:hover {
    border-color: #3b82f6;
    transform: translateX(4px);
  }

  .patient-position {
    width: 32px;
    height: 32px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .patient-name {
    flex: 1;
    font-weight: 600;
    color: #1f2937;
    font-size: 1rem;
  }

  .patient-turn {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
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
    .doctor-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .calling-card {
      flex-direction: column;
    }

    .patient-name-large {
      min-width: auto;
      width: 100%;
    }

    .doctors-container {
      max-height: 50vh;
    }

    .waiting-patient {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
</style>

<template>
  <div class="doctor-queue-section">
    <div class="section-header">
      <div class="header-left">
        <i class="pi pi-user-md"></i>
        <h3>{{ doctorName }}</h3>
        <span class="count-badge">{{ totalPatients }}</span>
      </div>
      <div class="specialty-badge">
        {{ specialty }}
      </div>
    </div>

    <div v-if="totalPatients === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>No hay pacientes para este médico</p>
    </div>

    <div v-else class="patients-list">
      <!-- Citas Programadas -->
      <template v-for="patient in scheduledAppointments" :key="`scheduled-${patient.id}`">
        <div class="appointment-item scheduled">
          <div class="patient-info">
            <div class="patient-name">{{ patient.patient_name }}</div>
            <div class="appointment-details">
              <span class="time">
                <i class="pi pi-clock"></i>
                {{ formatTime(patient.appointment_time) }}
              </span>
              <span class="separator">•</span>
              <span class="appointment-type">{{ capitalizeFirst(patient.appointment_type) }}</span>
            </div>
          </div>

          <div class="status-badge scheduled">
            <span>Programada</span>
          </div>

          <div class="appointment-actions">
            <button class="btn-reminder" @click="emit('send-reminder', patient.id)">
              <i class="pi pi-bell"></i>
              Recordar
            </button>
            <button class="btn-mark-arrival" @click="emit('mark-arrival', patient.id)">
              Marcar Llegada
            </button>
          </div>
        </div>
      </template>

      <!-- Pacientes en Espera -->
      <template v-for="patient in waitingPatients" :key="`waiting-${patient.queue_id}`">
        <div 
          class="patient-item waiting"
          :class="{
            urgent: patient.is_urgent,
            'payment-pending': patient.payment_pending,
            'being-called': patient.being_called
          }"
        >
          <div class="patient-info">
            <div class="patient-header">
              <div class="patient-name">{{ patient.patient_name }}</div>
            </div>
            <div class="patient-details">
              <span class="appointment-time">
                Cita: {{ formatTime(patient.appointment_time) }}
              </span>
              <span class="separator">•</span>
              <span class="arrived-time">
                Llegó: {{ formatTime(patient.arrived_at, true) }}
              </span>
              <span class="separator">•</span>
              <span class="waiting-time" :class="{ urgent: patient.is_urgent }">
                Esperando: {{ patient.waiting_minutes }} min
              </span>
            </div>
          </div>

          <div class="status-badges-container">
            <div v-if="patient.being_called" class="status-badge being-called">
              <span class="pulse-dot"></span>
              <span>Siendo Llamado</span>
            </div>
            <div v-else class="status-badge waiting">
              <span>En Espera</span>
            </div>
            <span v-if="patient.is_urgent" class="badge urgent-badge">URGENTE</span>
            <span v-if="patient.payment_pending" class="badge payment-badge">PAGO PENDIENTE</span>
          </div>

          <div class="patient-actions">
            <button 
              v-if="!patient.being_called" 
              class="btn-mark-calling" 
              @click="emit('mark-being-called', patient.queue_id)"
            >
              <i class="pi pi-volume-up"></i>
              Llamar
            </button>
            <button 
              v-else 
              class="btn-unmark-calling" 
              @click="emit('unmark-being-called', patient.queue_id)"
            >
              <i class="pi pi-times"></i>
              Cancelar
            </button>
            <button class="btn-call" @click="emit('call-to-consultation', patient.queue_id)">
              <i class="pi pi-sign-in"></i>
              A Consulta
            </button>
          </div>
        </div>
      </template>

      <!-- Pacientes en Consulta -->
      <template v-for="patient in inConsultationPatients" :key="`consultation-${patient.queue_id}`">
        <div class="patient-item consultation-active">
          <div class="patient-info">
            <div class="patient-header">
              <div class="patient-name">{{ patient.patient_name }}</div>
            </div>
            <div class="patient-details">
              <span class="room">{{ patient.consultation_room }}</span>
              <span class="separator">•</span>
              <span class="start-time">
                Inicio: {{ formatTime(patient.started_at, true) }}
              </span>
              <span class="separator">•</span>
              <span class="duration">{{ patient.consultation_minutes }} min</span>
            </div>
          </div>

          <div class="consultation-badges-container">
            <div class="status-badge consultation">
              <span>En Consulta</span>
            </div>
          </div>
          
          <button class="btn-complete" @click="emit('complete-consultation', patient.queue_id)">
            <i class="pi pi-check-circle"></i>
            Completar
          </button>
        </div>
      </template>

      <!-- Pacientes Completados -->
      <template v-for="patient in completedPatients" :key="`completed-${patient.queue_id}`">
        <div class="patient-item completed">
          <div class="patient-info">
            <div class="patient-header">
              <div class="patient-name">{{ patient.patient_name }}</div>
            </div>
            <div class="patient-details">
              <span class="room">{{ patient.consultation_room }}</span>
              <span class="separator">•</span>
              <span class="completion-time">
                Completado: {{ formatTime(patient.completed_at, true) }}
              </span>
              <span class="separator">•</span>
              <span class="total-time">Total: {{ patient.total_time_minutes }} min</span>
            </div>
          </div>

          <div class="status-badge completed">
            <span>Completado</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { 
  ScheduledAppointment, 
  WaitingPatient, 
  InConsultationPatient,
  CompletedPatient 
} from '@/types/patient-queue.types'



interface Props {
  doctorName: string
  specialty: string
  scheduledAppointments: ScheduledAppointment[]
  waitingPatients: WaitingPatient[]
  inConsultationPatients: InConsultationPatient[]
  completedPatients: CompletedPatient[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'mark-arrival': [appointmentId: number]
  'send-reminder': [appointmentId: number]
  'call-to-consultation': [queueId: number]
  'complete-consultation': [queueId: number]
  'mark-being-called': [queueId: number]
  'unmark-being-called': [queueId: number]
}>()

const totalPatients = computed(() => 
  props.scheduledAppointments.length + 
  props.waitingPatients.length + 
  props.inConsultationPatients.length +
  props.completedPatients.length
)



const formatTime = (dateString: string, subtractFiveHours: boolean = false): string => {
  if (!dateString) return ''
  // Remover la Z para interpretar como hora local de Perú
  const localDateString = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString
  const date = new Date(localDateString)
  
  // Restar 5 horas si se especifica
  if (subtractFiveHours) {
    date.setHours(date.getHours() - 5)
  }
  
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const capitalizeFirst = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
</script>

<style scoped>
.doctor-queue-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-left i {
  color: #059669;
  font-size: 1.25rem;
}

.header-left h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.count-badge {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.specialty-badge {
  background: #f0fdf4;
  color: #059669;
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid #bbf7d0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.patients-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Estilos para citas programadas */
.appointment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.appointment-item:hover {
  background: #f3f4f6;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  text-transform: uppercase;
  font-weight: 600;
}

.status-badge.scheduled {
  background: #ede9fe;
  color: #7c3aed;
}

.status-badge.waiting {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.consultation {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed {
  background: #f0fdf4;
  color: #059669;
}

.status-badge.being-called {
  background: #f59e0b;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: blink-badge 1.5s ease-in-out infinite;
}

@keyframes blink-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-reminder,
.btn-mark-arrival {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-reminder {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-reminder:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-mark-arrival {
  background: #059669;
  color: white;
}

.btn-mark-arrival:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
}

/* Estilos para pacientes en espera */
.appointment-item,
.patient-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #d1d5db;
  transition: all 0.2s;
}

.appointment-item {
  padding: 1rem;
}

.appointment-item.scheduled {
  border-left-color: #7c3aed;
}

.patient-item {
  padding: 1.25rem;
}

.patient-item.waiting {
  border-left-color: #d97706;
}

.patient-item.urgent {
  border-left-color: #ef4444;
}

.patient-item.payment-pending {
  border-left-color: #f59e0b;
}

.patient-item.consultation-active {
  border-left-color: #3b82f6;
}

.patient-item.completed {
  border-left-color: #059669;
  opacity: 0.8;
}

.patient-item.being-called {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  animation: gentle-pulse 2s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  50% { 
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  }
}

.patient-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.patient-info {
  flex: 1;
}

.patient-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.patient-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.patient-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.patient-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  flex-wrap: wrap;
}

.separator {
  color: #d1d5db;
}

.time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.appointment-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.appointment-type {
  color: #6b7280;
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.urgent-badge {
  background: #fee2e2;
  color: #dc2626;
}

.payment-badge {
  background: #fef3c7;
  color: #d97706;
}

.status-badges-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.consultation-badges-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.waiting-time.urgent {
  color: #dc2626;
  font-weight: 600;
}

.active-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2563eb;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.btn-call {
  padding: 0.75rem 1.5rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-call:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
}

.btn-complete {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-complete:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.patient-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-mark-calling {
  padding: 0.75rem 1rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-mark-calling:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.btn-unmark-calling {
  padding: 0.75rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-unmark-calling:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
}

.btn-call {
  background: #059669;
}

.btn-call i {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .appointment-item,
  .patient-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .appointment-actions {
    width: 100%;
  }

  .btn-reminder,
  .btn-mark-arrival,
  .btn-call,
  .btn-complete,
  .btn-mark-calling,
  .btn-unmark-calling {
    flex: 1;
  }

  .patient-actions {
    width: 100%;
    flex-direction: column;
  }

  .patient-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .status-badges-container,
  .consultation-badges-container {
    width: 100%;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }
}
</style>
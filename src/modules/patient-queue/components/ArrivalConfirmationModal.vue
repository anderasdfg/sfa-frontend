<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Registrar Llegada de Paciente</h2>
        <button class="btn-close" @click="closeModal">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Patient Info Card -->
        <div class="patient-info-card">
          <div class="patient-name">{{ appointment?.patient_name }}</div>
          <div class="appointment-info">
            <span>{{ appointment?.doctor_name }}</span>
            <span class="separator">•</span>
            <span>{{ appointment?.specialty }}</span>
          </div>
          <div class="scheduled-time">
            <i class="pi pi-clock"></i>
            Cita programada: {{ formatTime(appointment?.appointment_time) }}
          </div>
        </div>

        <!-- Arrival Time -->
        <div class="form-group">
          <label>Hora de Llegada</label>
          <div class="time-display">{{ currentTime }}</div>
        </div>

        <!-- Payment Status -->
        <div class="form-group">
          <label>Estado de Pago</label>
          <div class="payment-buttons">
            <button
              :class="['payment-btn', { active: paymentStatus === 'paid' }]"
              @click="paymentStatus = 'paid'"
            >
              <i class="pi pi-check"></i>
              Pagado
            </button>
            <button
              :class="['payment-btn', { active: paymentStatus === 'pending' }]"
              @click="paymentStatus = 'pending'"
            >
              Pendiente
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label>Notas (opcional)</label>
          <textarea
            v-model="notes"
            placeholder="Ej: Llegó 15 min tarde, presenta fiebre..."
            rows="3"
            class="notes-input"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">Cancelar</button>
        <button class="btn-confirm" @click="confirmArrival">
          <i class="pi pi-check"></i>
          Confirmar Llegada
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { ScheduledAppointment } from '@/types/patient-queue.types'

interface Props {
  isOpen: boolean
  appointment: ScheduledAppointment | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', data: { appointmentId: number; paymentStatus: string; notes: string; arrivalTime: string }): void
}>()

const paymentStatus = ref<'paid' | 'pending'>('paid')
const notes = ref('')
const currentTime = ref('')

let timeInterval: number | null = null

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTime = (dateString?: string): string => {
  if (!dateString) return ''
  const localDateString = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString
  const date = new Date(localDateString)
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const confirmArrival = () => {
  if (!props.appointment) return

  emit('confirm', {
    appointmentId: props.appointment.id,
    paymentStatus: paymentStatus.value,
    notes: notes.value,
    arrivalTime: new Date().toISOString(),
  })
  closeModal()
}

const resetForm = () => {
  paymentStatus.value = 'paid'
  notes.value = ''
}

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    updateCurrentTime()
    timeInterval = window.setInterval(updateCurrentTime, 1000)
  } else {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
  }
})

onMounted(() => {
  updateCurrentTime()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.patient-info-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.patient-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.appointment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.separator {
  color: #d1d5db;
}

.scheduled-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  background: white;
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.scheduled-time i {
  color: #8b5cf6;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.time-display {
  background: #d1fae5;
  color: #065f46;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
}

.payment-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.payment-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.payment-btn:hover {
  border-color: #059669;
  background: #f0fdf4;
}

.payment-btn.active {
  border-color: #059669;
  background: #d1fae5;
  color: #065f46;
}

.payment-btn i {
  font-size: 1rem;
}

.notes-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.notes-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.notes-input::placeholder {
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-confirm {
  background: #059669;
  color: white;
}

.btn-confirm:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
}

@media (max-width: 640px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>

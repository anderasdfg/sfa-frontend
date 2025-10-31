<template>
  <button
    @click="confirmArrival"
    :disabled="disabled || loading"
    class="btn-confirm-arrival"
    :class="{ 'btn-confirmed': isConfirmed }"
  >
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppointmentService } from '@/services/appointments.service'

interface Props {
  appointmentId: number
  patientArrived?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  patientArrived: false,
  disabled: false
})

const emit = defineEmits<{
  confirmed: [appointmentId: number]
  error: [message: string]
}>()

const loading = ref(false)
const isConfirmed = ref(props.patientArrived)

const buttonText = computed(() => {
  if (loading.value) return '⏳ Confirmando...'
  if (isConfirmed.value) return '✅ Llegada Confirmada'
  return '📍 Confirmar Llegada'
})

const confirmArrival = async () => {
  if (isConfirmed.value || loading.value) return

  loading.value = true
  try {
    await AppointmentService.confirmArrival(props.appointmentId)
    isConfirmed.value = true
    emit('confirmed', props.appointmentId)
  } catch (e: any) {
    emit('error', e.message || 'Error al confirmar llegada')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.btn-confirm-arrival {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #4299e1;
  color: white;
}

.btn-confirm-arrival:hover:not(:disabled) {
  background: #3182ce;
}

.btn-confirm-arrival:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm-arrival.btn-confirmed {
  background: #48bb78;
}

.btn-confirm-arrival.btn-confirmed:hover {
  background: #38a169;
}
</style>

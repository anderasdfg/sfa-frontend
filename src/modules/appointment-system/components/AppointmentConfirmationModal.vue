<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="'Confirmar Cita Médica'"
    :style="{ width: '500px' }"
    :closable="false"
    class="confirmation-dialog"
  >
    <div class="confirmation-content">
      <!-- Appointment Summary -->
      <div class="appointment-summary">
        <div class="summary-header">
          <Avatar
            :image="appointment.doctorAvatar"
            size="large"
            shape="circle"
            class="doctor-avatar"
          />
          <div class="doctor-info">
            <h3 class="doctor-name">{{ appointment.doctorName }}</h3>
            <p class="doctor-specialty">{{ appointment.doctorSpecialty }}</p>
            <Tag
              :value="appointment.modality"
              :severity="
                appointment.modality === AppointmentModality.TELECONSULTA ? 'info' : 'success'
              "
              class="consultation-tag"
            />
          </div>
        </div>

        <div class="appointment-details">
          <div class="detail-item">
            <i class="pi pi-calendar detail-icon"></i>
            <div>
              <span class="detail-label">Fecha</span>
              <span class="detail-value">{{ formattedDate }}</span>
            </div>
          </div>

          <div class="detail-item">
            <i class="pi pi-clock detail-icon"></i>
            <div>
              <span class="detail-label">Hora</span>
              <span class="detail-value">{{ appointment.time }}</span>
            </div>
          </div>

          <div class="detail-item">
            <i class="pi pi-tag detail-icon"></i>
            <div>
              <span class="detail-label">Precio</span>
              <span class="detail-value">S/ {{ appointment.price }}</span>
            </div>
          </div>

          <div class="detail-item">
            <i class="pi pi-map-marker detail-icon"></i>
            <div>
              <span class="detail-label">Ubicación</span>
              <span class="detail-value">{{ appointment.doctorLocation }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="terms-section">
        <div class="terms-checkbox">
          <Checkbox id="acceptTerms" v-model="acceptTerms" binary />
          <label for="acceptTerms" class="terms-label">
            Acepto los
            <a href="#" class="terms-link">términos y condiciones</a>
            y la
            <a href="#" class="terms-link">política de privacidad</a>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button label="Cancelar" icon="pi pi-times" @click="handleCancel" class="p-button-text" />
        <Button
          label="Confirmar Cita"
          icon="pi pi-check"
          @click="handleConfirm"
          :loading="loading"
          :disabled="!isFormValid"
          class="confirm-button"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import Dialog from 'primevue/dialog'
  import Avatar from 'primevue/avatar'
  import Tag from 'primevue/tag'
  import Checkbox from 'primevue/checkbox'
  import Button from 'primevue/button'
  import type { AppointmentSelection, AppointmentBooking } from '../types'
  import { AppointmentStatus, AppointmentModality } from '@/types/enums'

  // Props
  const props = defineProps<{
    visible: boolean
    appointment: AppointmentSelection
    loading?: boolean
  }>()

  // Emits
  const emit = defineEmits<{
    confirm: [booking: AppointmentBooking]
    cancel: []
  }>()

  // Reactive state
  const dialogVisible = ref(props.visible)
  const acceptTerms = ref(false)

  // Computed
  const formattedDate = computed(() => {
    if (!props.appointment?.appointmentDate) return ''

    const date = new Date(props.appointment.appointmentDate)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  })

  const isFormValid = computed(() => {
    return acceptTerms.value
  })

  const handleConfirm = async () => {
    if (!acceptTerms.value) return

    try {
      const booking: AppointmentBooking = {
        doctorId: props.appointment.doctorId,
        slotId: props.appointment.slotId,
        appointmentDate: props.appointment.appointmentDate,
        status: AppointmentStatus.RESERVADA,
        modality: props.appointment.modality,
        scheduledAt: new Date(),
        patientId: props.appointment.patientId
      }
      console.log('Data for Booking:', booking)
      emit('confirm', booking)
    } catch (error) {
      console.error('Error in modal:', error)
    }
  }

  const handleCancel = () => {
    emit('cancel')
  }

  watch(dialogVisible, newValue => {
    if (!newValue) {
      emit('cancel')
    }
  })
</script>

<style scoped>
  @import '@/modules/appointment-system/styles/AppointmentConfirmationModal.css';
</style>

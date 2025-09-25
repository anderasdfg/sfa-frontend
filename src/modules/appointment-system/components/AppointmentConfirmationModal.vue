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
            :image="appointment.doctor.avatar"
            size="large"
            shape="circle"
            class="doctor-avatar"
          />
          <div class="doctor-info">
            <h3 class="doctor-name">{{ appointment.doctor.name }}</h3>
            <p class="doctor-specialty">{{ appointment.doctor.specialtyName }}</p>
            <Tag
              :value="appointment.doctor.consultationType"
              :severity="
                appointment.doctor.consultationType === 'TELECONSULTA' ? 'info' : 'success'
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
              <span class="detail-value">{{ appointment.doctor.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Patient Information Form -->
      <!-- <div class="patient-form">
        <h4 class="form-title">Información del Paciente</h4>

        <div class="form-grid">
          <div class="form-field">
            <label for="patientName" class="field-label">Nombre Completo *</label>
            <InputText
              id="patientName"
              v-model="patientForm.name"
              placeholder="Ingresa tu nombre completo"
              :class="{ 'p-invalid': errors.name }"
            />
            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
          </div>

          <div class="form-field">
            <label for="patientEmail" class="field-label">Correo Electrónico *</label>
            <InputText
              id="patientEmail"
              v-model="patientForm.email"
              type="email"
              placeholder="correo@ejemplo.com"
              :class="{ 'p-invalid': errors.email }"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>

          <div class="form-field">
            <label for="patientPhone" class="field-label">Teléfono *</label>
            <InputText
              id="patientPhone"
              v-model="patientForm.phone"
              placeholder="999 999 999"
              :class="{ 'p-invalid': errors.phone }"
            />
            <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
          </div>

          <div class="form-field full-width">
            <label for="patientNotes" class="field-label">Motivo de la consulta (opcional)</label>
            <Textarea
              id="patientNotes"
              v-model="patientForm.notes"
              placeholder="Describe brevemente el motivo de tu consulta..."
              rows="3"
            />
          </div>
        </div>
      </div> -->

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
          :loading="confirming"
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
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea'
  import Checkbox from 'primevue/checkbox'
  import Button from 'primevue/button'
  import type { Doctor, TimeSlot, AppointmentBooking } from '../types'

  // Props
  const props = defineProps<{
    visible: boolean
    appointment: TimeSlot & { doctor: Doctor }
  }>()

  // Emits
  const emit = defineEmits<{
    confirm: [booking: AppointmentBooking]
    cancel: []
  }>()

  // Reactive state
  const dialogVisible = ref(props.visible)
  const confirming = ref(false)
  const acceptTerms = ref(false)

  const patientForm = ref({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const errors = ref({
    name: '',
    email: '',
    phone: ''
  })

  // Computed
  const formattedDate = computed(() => {
    if (!props.appointment?.date) return ''

    const date = new Date(props.appointment.date)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  const isFormValid = computed(() => {
    return (
      patientForm.value.name.trim() !== '' &&
      patientForm.value.email.trim() !== '' &&
      patientForm.value.phone.trim() !== '' &&
      acceptTerms.value &&
      !Object.values(errors.value).some(error => error !== '')
    )
  })

  // Methods
  const validateForm = () => {
    errors.value = {
      name: '',
      email: '',
      phone: ''
    }

    // Validate name
    if (!patientForm.value.name.trim()) {
      errors.value.name = 'El nombre es requerido'
    } else if (patientForm.value.name.trim().length < 2) {
      errors.value.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!patientForm.value.email.trim()) {
      errors.value.email = 'El correo electrónico es requerido'
    } else if (!emailRegex.test(patientForm.value.email)) {
      errors.value.email = 'Ingresa un correo electrónico válido'
    }

    // Validate phone
    const phoneRegex = /^[0-9]{9}$/
    if (!patientForm.value.phone.trim()) {
      errors.value.phone = 'El teléfono es requerido'
    } else if (!phoneRegex.test(patientForm.value.phone.replace(/\s/g, ''))) {
      errors.value.phone = 'Ingresa un teléfono válido (9 dígitos)'
    }

    return Object.values(errors.value).every(error => error === '')
  }

  const handleConfirm = async () => {
    if (!validateForm() || !acceptTerms.value) return

    confirming.value = true

    try {
      const booking: AppointmentBooking = {
        doctorId: props.appointment.doctor.id,
        doctorName: props.appointment.doctor.name,
        specialty: props.appointment.doctor.specialtyName,
        date: props.appointment.date,
        time: props.appointment.time,
        price: props.appointment.price,
        consultationType: props.appointment.doctor.consultationType,
        location: props.appointment.doctor.location,
        patientName: patientForm.value.name,
        patientEmail: patientForm.value.email,
        patientPhone: patientForm.value.phone,
        status: 'pending'
      }

      emit('confirm', booking)
    } finally {
      confirming.value = false
    }
  }

  const handleCancel = () => {
    emit('cancel')
  }

  const resetForm = () => {
    patientForm.value = {
      name: '',
      email: '',
      phone: '',
      notes: ''
    }
    acceptTerms.value = false
    errors.value = {
      name: '',
      email: '',
      phone: ''
    }
  }

  // Watchers
  watch(
    () => props.visible,
    newValue => {
      dialogVisible.value = newValue
      if (newValue) {
        resetForm()
      }
    }
  )

  watch(dialogVisible, newValue => {
    if (!newValue) {
      emit('cancel')
    }
  })

  // Real-time validation
  watch(
    () => patientForm.value.name,
    () => {
      if (errors.value.name) validateForm()
    }
  )

  watch(
    () => patientForm.value.email,
    () => {
      if (errors.value.email) validateForm()
    }
  )

  watch(
    () => patientForm.value.phone,
    () => {
      if (errors.value.phone) validateForm()
    }
  )
</script>

<style scoped>
  .confirmation-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .appointment-summary {
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .doctor-avatar {
    border: 3px solid var(--color-sf-green-light);
  }

  .doctor-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 0.25rem;
  }

  .doctor-specialty {
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .appointment-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .detail-icon {
    color: var(--color-sf-green-normal);
    font-size: 1.1rem;
  }

  .detail-label {
    display: block;
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.25rem;
  }

  .detail-value {
    display: block;
    font-weight: 600;
    color: var(--color-sf-green-dark);
  }

  .patient-form {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  .field-label {
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .terms-section {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .terms-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .terms-label {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.5;
  }

  .terms-link {
    color: var(--color-sf-green-normal);
    text-decoration: none;
    font-weight: 500;
  }

  .terms-link:hover {
    text-decoration: underline;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .confirm-button {
    background: var(--color-sf-green-normal);
    border: none;
  }

  .confirm-button:hover {
    background: var(--color-sf-green-dark);
  }

  /* Override PrimeVue styles */
  :deep(.p-dialog-header) {
    background: var(--color-sf-green-normal);
    color: white;
    border-radius: 0.75rem 0.75rem 0 0;
  }

  :deep(.p-dialog-title) {
    font-weight: 600;
  }

  :deep(.p-inputtext:enabled:focus) {
    border-color: var(--color-sf-green-normal);
    box-shadow: 0 0 0 0.2rem rgba(109, 189, 119, 0.2);
  }

  :deep(.p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-highlight) {
    background: var(--color-sf-green-normal);
    border-color: var(--color-sf-green-normal);
  }

  @media (max-width: 768px) {
    .appointment-details {
      grid-template-columns: 1fr;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .summary-header {
      flex-direction: column;
      text-align: center;
    }
  }
</style>

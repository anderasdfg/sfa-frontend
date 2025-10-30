<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :header="modalTitle"
    :style="{ width: '500px' }"
    :closable="true"
    @hide="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="create-schedule-form">
      <!-- Selección de Doctor -->
      <div class="form-field">
        <label class="form-label">Doctor *</label>
        <Dropdown
          v-model="form.doctorId"
          :options="availableDoctors"
          option-label="fullName"
          option-value="id"
          placeholder="Selecciona un doctor"
          class="w-full"
          :class="{ 'p-invalid': errors.doctorId }"
          @change="handleDoctorChange"
        />
        <small v-if="errors.doctorId" class="p-error">{{ errors.doctorId }}</small>
      </div>

      <!-- Selección de Servicio -->
      <div class="form-field">
        <label class="form-label">Servicio *</label>
        <Dropdown
          v-model="form.serviceId"
          :options="availableServices"
          option-label="name"
          option-value="id"
          placeholder="Selecciona un servicio"
          class="w-full"
          :class="{ 'p-invalid': errors.serviceId }"
          :disabled="!form.doctorId || availableServices.length === 1"
        />
        <small v-if="errors.serviceId" class="p-error">{{ errors.serviceId }}</small>
        <small v-if="!form.doctorId" class="p-info">Selecciona primero un doctor</small>
      </div>

      <!-- Fecha -->
      <div class="form-field">
        <label class="form-label">Fecha *</label>
        <Calendar
          v-model="form.date"
          date-format="dd/mm/yy"
          :min-date="new Date()"
          class="w-full"
          :class="{ 'p-invalid': errors.date }"
        />
        <small v-if="errors.date" class="p-error">{{ errors.date }}</small>
      </div>

      <!-- Modalidad -->
      <div class="form-field">
        <label class="form-label">Modalidad *</label>
        <Dropdown
          v-model="form.modality"
          :options="modalityOptions"
          option-label="label"
          option-value="value"
          placeholder="Selecciona modalidad"
          class="w-full"
          :class="{ 'p-invalid': errors.modality }"
        />
        <small v-if="errors.modality" class="p-error">{{ errors.modality }}</small>
      </div>

      <!-- Horarios -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Hora Inicio *</label>
          <Calendar
            v-model="form.startTime"
            time-only
            hour-format="24"
            class="w-full"
            :class="{ 'p-invalid': errors.startTime }"
          />
          <small v-if="errors.startTime" class="p-error">{{ errors.startTime }}</small>
        </div>

        <div class="form-field">
          <label class="form-label">Hora Fin *</label>
          <Calendar
            v-model="form.endTime"
            time-only
            hour-format="24"
            class="w-full"
            :class="{ 'p-invalid': errors.endTime }"
          />
          <small v-if="errors.endTime" class="p-error">{{ errors.endTime }}</small>
        </div>
      </div>

      <!-- Duración y Costo -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Duración del Slot (min) *</label>
          <InputNumber
            v-model="form.slotDuration"
            :min="10"
            :max="120"
            :step="5"
            suffix=" min"
            class="w-full"
            :class="{ 'p-invalid': errors.slotDuration }"
          />
          <small v-if="errors.slotDuration" class="p-error">{{ errors.slotDuration }}</small>
        </div>

        <div class="form-field">
          <label class="form-label">Costo por Consulta *</label>
          <InputNumber
            v-model="form.price"
            mode="decimal"
            :min="0"
            :max-fraction-digits="2"
            :min-fraction-digits="2"
            prefix="S/. "
            placeholder="0.00"
            class="w-full"
            :class="{ 'p-invalid': errors.price }"
          />
          <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
        </div>
      </div>

      <!-- Preview de slots -->
      <div class="slots-preview" v-if="slotsPreview.length > 0">
        <h4>Se crearán {{ slotsPreview.length }} slots:</h4>
        <div class="preview-slots">
          <span v-for="slot in slotsPreview.slice(0, 5)" :key="slot" class="slot-chip">
            {{ slot }}
          </span>
          <span v-if="slotsPreview.length > 5" class="more-slots">
            +{{ slotsPreview.length - 5 }} más
          </span>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <Button label="Cancelar" severity="secondary" outlined @click="handleClose" type="button" />
        <Button label="Crear Horarios" :loading="loading" type="submit" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { z } from 'zod'
  import Button from 'primevue/button'
  import Calendar from 'primevue/calendar'
  import Dialog from 'primevue/dialog'
  import Dropdown from 'primevue/dropdown'
  import InputNumber from 'primevue/inputnumber'

  // Props
  interface Props {
    visible: boolean
    selectedDate?: Date | null
    availableDoctors: Array<{
      id: number
      first_name: string
      last_name: string
      fullName: string
      services?: Array<{
        id: number
        name: string
      }>
    }>
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedDate: null,
    loading: false
  })

  // Emits
  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: ScheduleFormData): void
  }

  const emit = defineEmits<Emits>()

  // Zod Schema para validación
  const scheduleFormSchema = z
    .object({
      doctorId: z.number().min(1, 'Selecciona un doctor'),
      serviceId: z.number().min(1, 'Selecciona un servicio'),
      date: z
        .date()
        .min(new Date(new Date().setHours(0, 0, 0, 0)), 'La fecha debe ser hoy o posterior'),
      modality: z.enum(['presencial', 'virtual']),
      startTime: z.date(),
      endTime: z.date(),
      slotDuration: z
        .number()
        .min(10, 'La duración mínima es 10 minutos')
        .max(120, 'La duración máxima es 120 minutos'),
      price: z.number().min(0.01, 'El precio debe ser mayor a 0')
    })
    .refine(
      data => {
        return data.endTime > data.startTime
      },
      {
        message: 'La hora de fin debe ser posterior a la de inicio',
        path: ['endTime']
      }
    )

  // Types
  type ScheduleFormData = z.infer<typeof scheduleFormSchema>

  // Tipo para el formulario (permite null para campos no completados)
  interface FormData {
    doctorId: number | null
    serviceId: number | null
    date: Date | null
    modality: 'presencial' | 'virtual' | null
    startTime: Date | null
    endTime: Date | null
    slotDuration: number
    price: number
  }

  // Reactive state
  const isVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const form = ref<FormData>({
    doctorId: null,
    serviceId: null,
    date: null,
    modality: null,
    startTime: null,
    endTime: null,
    slotDuration: 20,
    price: 50
  })

  const errors = ref({
    doctorId: '',
    serviceId: '',
    date: '',
    modality: '',
    startTime: '',
    endTime: '',
    slotDuration: '',
    price: ''
  })

  // Constants
  const modalityOptions = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Virtual', value: 'virtual' }
  ]

  // Computed
  const modalTitle = computed(() => {
    if (!props.selectedDate) return 'Crear Horarios'
    return `Crear Horarios - ${props.selectedDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`
  })

  const availableServices = computed(() => {
    if (!form.value.doctorId) return []
    const selectedDoctor = props.availableDoctors.find(doctor => doctor.id === form.value.doctorId)
    return selectedDoctor?.services || []
  })

  const slotsPreview = computed(() => {
    if (!form.value.startTime || !form.value.endTime || !form.value.slotDuration) {
      return []
    }

    const slots = []
    const start = new Date(form.value.startTime)
    const end = new Date(form.value.endTime)
    const duration = form.value.slotDuration * 60000 // minutos a millisegundos

    let current = new Date(start)
    while (current < end) {
      slots.push(
        current.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      )
      current = new Date(current.getTime() + duration)
    }

    return slots
  })

  // Methods
  const resetForm = () => {
    form.value = {
      doctorId: null,
      serviceId: null,
      date: null,
      modality: null,
      startTime: null,
      endTime: null,
      slotDuration: 20,
      price: 50
    }

    errors.value = {
      doctorId: '',
      serviceId: '',
      date: '',
      modality: '',
      startTime: '',
      endTime: '',
      slotDuration: '',
      price: ''
    }
  }

  const handleDoctorChange = () => {
    // Resetear el servicio cuando cambia el doctor
    form.value.serviceId = null
    errors.value.serviceId = ''
    
    // Si el doctor tiene un solo servicio, seleccionarlo automáticamente
    const selectedDoctor = props.availableDoctors.find(doctor => doctor.id === form.value.doctorId)
    if (selectedDoctor?.services && selectedDoctor.services.length === 1) {
      form.value.serviceId = selectedDoctor.services[0].id
    }
  }

  const validateForm = (): { isValid: boolean; data?: ScheduleFormData } => {
    // Limpiar errores previos
    const newErrors = { ...errors.value }
    Object.keys(newErrors).forEach(key => (newErrors[key as keyof typeof newErrors] = ''))

    try {
      // Validar con Zod - maneja automáticamente nulls, tipos, rangos, etc.
      const validatedData = scheduleFormSchema.parse(form.value)
      errors.value = newErrors // Sin errores
      return { isValid: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mapear errores de Zod a nuestro objeto de errores
        error.issues.forEach(issue => {
          const field = issue.path[0] as keyof typeof newErrors
          if (field && field in newErrors) {
            newErrors[field] = issue.message
          }
        })
      }

      errors.value = newErrors
      return { isValid: false }
    }
  }

  const handleSubmit = () => {
    const validation = validateForm()
    if (validation.isValid && validation.data) {
      emit('submit', validation.data)
    }
  }

  const handleClose = () => {
    resetForm()
    emit('update:visible', false)
  }

  // Watchers
  watch(
    () => props.selectedDate,
    newDate => {
      if (newDate) {
        form.value.date = newDate

        // Establecer horarios por defecto
        const clickedHour = newDate.getHours()
        const startTime = new Date(newDate)
        startTime.setHours(clickedHour || 8, 0, 0, 0)

        const endTime = new Date(newDate)
        endTime.setHours((clickedHour || 8) + 2, 0, 0, 0)

        form.value.startTime = startTime
        form.value.endTime = endTime
      }
    }
  )

  watch(
    () => props.visible,
    visible => {
      if (!visible) {
        resetForm()
      }
    }
  )
</script>

<style scoped>
  .create-schedule-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .slots-preview {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 1rem;
  }

  .slots-preview h4 {
    margin: 0 0 0.75rem 0;
    color: #374151;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .preview-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .slot-chip {
    background: #3b82f6;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .more-slots {
    background: #6b7280;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
</style>

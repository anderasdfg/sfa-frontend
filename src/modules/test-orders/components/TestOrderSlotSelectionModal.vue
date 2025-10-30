<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!loading"
    :style="{ width: '90%', maxWidth: '900px' }"
    @update:visible="handleClose"
  >
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">Selecciona fecha y hora para tu examen</h3>
      </div>
    </template>

    <!-- Información del examen -->
    <div class="exam-info">
      <div class="exam-details">
        <div class="exam-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <div class="exam-text">
          <div class="exam-name">
            <span v-if="testOrder.diagnostic_test_cpt_code" class="cpt-badge">
              {{ testOrder.diagnostic_test_cpt_code }}
            </span>
            {{ testOrder.diagnostic_test_name }}
          </div>
          <div v-if="testOrder.diagnostic_test_description" class="exam-description">
            {{ testOrder.diagnostic_test_description }}
          </div>
        </div>
      </div>
      <div v-if="selectedSlot" class="exam-price">
        <span class="price-label">Precio:</span>
        <span class="price-value">S/ {{ selectedSlot.price.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-section">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="loading-text">Cargando horarios disponibles...</p>
    </div>

    <!-- Error -->
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <!-- Selector de fechas y horarios -->
    <div v-else-if="availableDates.length > 0" class="slots-section">
      <!-- Selector de fecha con calendario -->
      <div class="date-calendar-section">
        <h4 class="section-title">Selecciona una fecha:</h4>
        <div class="calendar-picker">
          <Calendar
            v-model="calendarDate"
            :minDate="minDate"
            dateFormat="dd/mm/yy"
            :showIcon="true"
            iconDisplay="input"
            :manualInput="false"
            placeholder="Cambiar fecha"
            @update:model-value="handleCalendarSelect"
          />
        </div>
        <div v-if="selectedDateFormatted" class="selected-date-display">
          <i class="pi pi-calendar"></i>
          <span>{{ selectedDateFormatted }}</span>
        </div>
      </div>

      <!-- Horarios disponibles -->
      <div v-if="selectedDate" class="time-slots-section">
        <h4 class="section-title">Horarios disponibles:</h4>

        <div v-if="!hasAvailableSlotsForDate(selectedDate)" class="no-slots-message">
          <i class="pi pi-clock"></i>
          <p>No hay horarios disponibles para esta fecha</p>
          <p class="text-sm">Selecciona otra fecha en el calendario</p>
        </div>

        <div v-else class="time-slots-grid">
          <button
            v-for="slot in getSlotsByDate(selectedDate)"
            :key="slot.id"
            @click="selectSlot(slot)"
            :disabled="!slot.available"
            :class="[
              'time-slot-button',
              {
                available: slot.available,
                occupied: !slot.available,
                selected: selectedSlot?.id === slot.id
              }
            ]"
          >
            <span class="slot-time">{{ slot.time }}</span>
            <span class="slot-price">S/ {{ slot.price.toFixed(2) }}</span>
            <span v-if="!slot.available" class="slot-status">Ocupado</span>
            <i v-if="selectedSlot?.id === slot.id" class="pi pi-check slot-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Sin horarios -->
    <div v-else class="empty-state">
      <i class="pi pi-calendar-times"></i>
      <p>No hay horarios disponibles para este servicio</p>
    </div>

    <template #footer>
      <div class="modal-footer">
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="handleClose"
          :disabled="loading || processing"
        />
        <Button
          label="Confirmar y Continuar"
          icon="pi pi-arrow-right"
          iconPos="right"
          @click="handleConfirm"
          :disabled="!selectedSlot || loading || processing"
          :loading="loading || processing"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import Dialog from 'primevue/dialog'
  import Button from 'primevue/button'
  import Message from 'primevue/message'
  import ProgressSpinner from 'primevue/progressspinner'
  import Calendar from 'primevue/calendar'
  import { useTestOrderSlots } from '../composables/useTestOrderSlots'
  import { useAppointments } from '@/modules/appointment-system/composables/useAppointments'
  import { usePayments } from '@/modules/appointment-system/composables/usePayments'
  import { generatePaymentUrls } from '@/modules/appointment-system/adapters/payment.adapter'
  import { useNotifications } from '@/composables/useNotifications'
  import { useAuthStore } from '@/stores/auth/authStore'
  import type { TestOrder } from '@/types/testOrder.types'
  import type { AppointmentBooking } from '@/modules/appointment-system/types'

  interface ProcessedSlot {
    id: number
    date: string
    time: string
    price: number
    available: boolean
    schedule_modality: string
    duration_minutes: number
    scheduled_at: Date
    doctor_id: number
    specialty_id: number
  }

  interface Props {
    visible: boolean
    testOrder: TestOrder
    serviceId: number
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  // Composables
  const {
    loading,
    error,
    availableDates,
    loadSlotsForService,
    getSlotsByDate,
    hasAvailableSlotsForDate,
    clearSlots
  } = useTestOrderSlots()

  const { createAppointment, error: appointmentError, createdAppointment } = useAppointments()
  const { createAndRedirectToPayment, error: paymentError } = usePayments()
  const notifications = useNotifications()
  const authStore = useAuthStore()

  // Estado local
  const selectedDate = ref<string>('')
  const selectedSlot = ref<ProcessedSlot | null>(null)
  const calendarDate = ref<Date | null>(null)
  const minDate = ref<Date>(new Date()) // Fecha mínima es hoy
  const processing = ref(false)

  // Computed - Fecha seleccionada formateada para mostrar
  const selectedDateFormatted = computed(() => {
    if (!selectedDate.value) return ''
    
    const [year, month, day] = selectedDate.value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  })

  // Métodos
  const handleCalendarSelect = (date: Date | null): void => {
    if (!date) {
      // Si se limpia el calendario, volver a la primera fecha disponible
      if (availableDates.value.length > 0) {
        selectedDate.value = availableDates.value[0]
        const [year, month, day] = availableDates.value[0].split('-').map(Number)
        calendarDate.value = new Date(year, month - 1, day)
      }
      return
    }

    // Convertir Date a string YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    // Seleccionar esta fecha (disponible o no)
    selectedDate.value = dateStr
  }

  const selectSlot = (slot: ProcessedSlot): void => {
    if (!slot.available) return
    selectedSlot.value = slot
  }

  const handleClose = (): void => {
    if (processing.value) return // No cerrar si está procesando
    emit('update:visible', false)
    clearSlots()
    selectedDate.value = ''
    selectedSlot.value = null
    calendarDate.value = null
  }

  const handleConfirm = async (): Promise<void> => {
    if (!selectedSlot.value) return
    if (!authStore.user?.patient_id) {
      notifications.showError('Error', 'No se pudo obtener la información del paciente')
      return
    }

    processing.value = true

    try {
      // 1. Crear la cita médica
      notifications.showInfo('Creando cita', 'Creando tu cita médica...')
      
      const appointmentBooking: AppointmentBooking = {
        patientId: authStore.user.patient_id,
        doctorId: selectedSlot.value.doctor_id,
        slotId: selectedSlot.value.id,
        appointmentDate: selectedSlot.value.date,
        status: 'pendiente' as any,
        modality: selectedSlot.value.schedule_modality as any,
        scheduledAt: selectedSlot.value.scheduled_at
      }

      const appointmentCreated = await createAppointment(appointmentBooking)

      if (!appointmentCreated) {
        notifications.showError('Error', appointmentError.value || 'No se pudo crear la cita médica')
        processing.value = false
        return
      }

      // 2. Verificar que se obtuvo el ID de la cita
      if (!createdAppointment.value?.id) {
        notifications.showError('Error', 'No se pudo obtener el ID de la cita creada')
        processing.value = false
        return
      }

      // 3. Modificar las URLs del appointment para incluir test_order_id
      const baseUrl = 'https://sfa-frontend-five.vercel.app'
      const urls = generatePaymentUrls(
        createdAppointment.value.id,
        baseUrl,
        props.testOrder.id // testOrderId
      )

      // Actualizar las URLs en el appointment creado
      const appointmentWithUrls = {
        ...createdAppointment.value,
        successUrl: urls.successUrl,
        failureUrl: urls.failureUrl,
        pendingUrl: urls.pendingUrl
      }

      // 4. Crear el pago y redirigir
      notifications.showInfo('Procesando pago', 'Redirigiendo al sistema de pagos...')
      const success = await createAndRedirectToPayment(appointmentWithUrls as any)

      if (!success) {
        notifications.showError('Error', paymentError.value || 'No se pudo procesar el pago')
        processing.value = false
      }

    } catch (error: any) {
      console.error('Error en el proceso de confirmación:', error)
      notifications.showError('Error', error.message || 'Ocurrió un error inesperado')
      processing.value = false
    }
  }

  // Función para obtener la fecha actual en Lima
  const getLimaDate = (): string => {
    const now = new Date()
    const limaDateStr = now.toLocaleString('en-US', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    // Parsear el formato MM/DD/YYYY
    const [month, day, year] = limaDateStr.split(', ')[0].split('/')
    return `${year}-${month}-${day}`
  }

  // Función para encontrar la primera fecha con slots disponibles
  const findFirstDateWithAvailableSlots = (): string | null => {
    for (const date of availableDates.value) {
      if (hasAvailableSlotsForDate(date)) {
        return date
      }
    }
    return null
  }

  // Watchers
  watch(
    () => props.visible,
    async (isVisible) => {
      if (isVisible) {
        // Cargar slots cuando se abre el modal usando la fecha actual de Lima
        const dateStr = getLimaDate()
        await loadSlotsForService(props.serviceId, dateStr)

        // Buscar la primera fecha con cupos disponibles
        const firstAvailableDate = findFirstDateWithAvailableSlots()
        
        if (firstAvailableDate) {
          selectedDate.value = firstAvailableDate
          
          // Setear el calendario con la primera fecha disponible
          const [year, month, day] = firstAvailableDate.split('-').map(Number)
          calendarDate.value = new Date(year, month - 1, day)
        } else if (availableDates.value.length > 0) {
          // Si no hay ninguna con slots, usar la primera fecha (fallback)
          const firstDate = availableDates.value[0]
          selectedDate.value = firstDate
          
          const [year, month, day] = firstDate.split('-').map(Number)
          calendarDate.value = new Date(year, month - 1, day)
        }
      }
    }
  )

  // Lifecycle
  onMounted(() => {
    if (props.visible) {
      const dateStr = getLimaDate()
      loadSlotsForService(props.serviceId, dateStr)
    }
  })
</script>

<style scoped>
  .modal-header {
    width: 100%;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  /* Información del examen */
  .exam-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .exam-details {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .exam-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-sf-green-normal);
    border-radius: 8px;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .exam-text {
    flex: 1;
  }

  .exam-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .cpt-badge {
    display: inline-block;
    background: var(--color-sf-green-normal);
    color: white;
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .exam-description {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .exam-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .price-label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .price-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-sf-green-normal);
  }

  /* Loading */
  .loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  .loading-text {
    margin-top: 1rem;
    color: #6b7280;
  }

  /* Slots section */
  .slots-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
  }

  /* Date calendar section */
  .date-calendar-section {
    background: #f9fafb;
    padding: 1.25rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .calendar-picker {
    width: 100%;
    margin-bottom: 1rem;
  }

  .calendar-picker :deep(.p-calendar) {
    width: 100%;
  }

  .calendar-picker :deep(.p-inputtext) {
    width: 100%;
    font-size: 0.95rem;
  }

  .selected-date-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: white;
    border: 2px solid var(--color-sf-green-normal);
    border-radius: 8px;
    color: var(--color-sf-green-normal);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .selected-date-display i {
    font-size: 1.25rem;
  }

  .selected-date-display span {
    text-transform: capitalize;
  }

  /* Time slots */
  .time-slots-section {
    display: flex;
    flex-direction: column;
  }

  .time-slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .time-slots-grid::-webkit-scrollbar {
    width: 6px;
  }

  .time-slots-grid::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .time-slot-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .time-slot-button.available:hover:not(.selected) {
    border-color: var(--color-sf-green-normal);
    background: #f0fdf4;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .time-slot-button.selected {
    border-color: var(--color-sf-green-normal);
    background: var(--color-sf-green-normal);
    color: white;
  }

  .time-slot-button.selected:hover {
    background: var(--color-sf-green-normal);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  .time-slot-button.occupied {
    background: #f3f4f6;
    border-color: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .slot-time {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .slot-price {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .time-slot-button.selected .slot-time,
  .time-slot-button.selected .slot-price {
    color: white;
  }

  .slot-status {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    color: #6b7280;
  }

  .slot-check {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1rem;
  }

  /* Empty state */
  .empty-state,
  .no-slots-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: #6b7280;
  }

  .empty-state i,
  .no-slots-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #d1d5db;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .exam-info {
      flex-direction: column;
    }

    .exam-price {
      align-items: flex-start;
    }

    .date-calendar-section {
      padding: 1rem;
    }

    .time-slots-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .modal-footer {
      flex-direction: column-reverse;
    }

    .modal-footer button {
      width: 100%;
    }
  }
</style>

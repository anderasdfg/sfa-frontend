<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!loading"
    :style="{ width: '90%', maxWidth: '800px', maxHeight: '90vh' }"
    @update:visible="handleClose"
  >
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">Detalles de la Orden de Examen</h3>
      </div>
    </template>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-section">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="loading-text">Cargando detalles del examen...</p>
    </div>

    <!-- Error -->
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <!-- Contenido del modal -->
    <div v-else-if="testOrder" class="modal-content">
      <!-- Información principal del examen -->
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
        <div class="exam-status">
          <Tag
            :value="getStatusLabel(testOrder.status)"
            :severity="getStatusSeverity(testOrder.status)"
            class="status-tag-large"
          />
        </div>
      </div>

      <!-- Información del paciente -->
      <div class="info-section">
        <h4 class="section-title">
          <i class="pi pi-user"></i>
          Información del Paciente
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Paciente:</span>
            <span class="info-value">{{ getPatientName() }}</span>
          </div>
          <div v-if="testOrder.patient_id" class="info-item">
            <span class="info-label">ID Paciente:</span>
            <span class="info-value">#{{ testOrder.patient_id }}</span>
          </div>
        </div>
      </div>

      <!-- Información de la cita (si tiene slot asignado) -->
      <div v-if="hasSlotInfo" class="info-section">
        <h4 class="section-title">
          <i class="pi pi-calendar"></i>
          Información de la Cita
        </h4>
        <div class="info-grid">
          <div v-if="testOrder.slot_scheduled_at" class="info-item">
            <span class="info-label">Fecha:</span>
            <span class="info-value">{{ formatDate(testOrder.slot_scheduled_at) }}</span>
          </div>
          <div v-if="testOrder.slot_scheduled_at" class="info-item">
            <span class="info-label">Hora:</span>
            <span class="info-value">{{ formatTime(testOrder.slot_scheduled_at) }}</span>
          </div>
          <div v-if="testOrder.slot_duration_minutes" class="info-item">
            <span class="info-label">Duración:</span>
            <span class="info-value">{{ testOrder.slot_duration_minutes }} minutos</span>
          </div>
          <div v-if="testOrder.slot_price" class="info-item">
            <span class="info-label">Precio:</span>
            <span class="info-value price-highlight">S/ {{ formatPrice(testOrder.slot_price) }}</span>
          </div>
        </div>
      </div>

      <!-- Información del servicio -->
      <div class="info-section">
        <h4 class="section-title">
          <i class="pi pi-cog"></i>
          Información del Servicio
        </h4>
        <div class="info-grid">
          <div v-if="testOrder.specialty_name" class="info-item">
            <span class="info-label">Especialidad:</span>
            <span class="info-value">{{ testOrder.specialty_name }}</span>
          </div>
          <div v-if="testOrder.service_id" class="info-item">
            <span class="info-label">ID Servicio:</span>
            <span class="info-value">#{{ testOrder.service_id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ID Consulta:</span>
            <span class="info-value">#{{ testOrder.consultation_id }}</span>
          </div>
        </div>
      </div>

      <!-- Instrucciones para el paciente -->
      <div v-if="testOrder.diagnostic_test_patient_instructions" class="info-section">
        <h4 class="section-title">
          <i class="pi pi-info-circle"></i>
          Instrucciones para el Paciente
        </h4>
        <div class="instructions-box">
          <div class="instructions-icon">
            <i class="pi pi-lightbulb"></i>
          </div>
          <div class="instructions-text">
            {{ testOrder.diagnostic_test_patient_instructions }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <Button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleClose"
        />
        <Button
          v-if="canScheduleSlot"
          label="Programar Cita"
          icon="pi pi-calendar-plus"
          @click="handleScheduleSlot"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import Dialog from 'primevue/dialog'
  import Button from 'primevue/button'
  import Message from 'primevue/message'
  import ProgressSpinner from 'primevue/progressspinner'
  import Tag from 'primevue/tag'
  import { TestOrderService } from '@/services/testOrder.service'
  import { useNotifications } from '@/composables/useNotifications'
  import type { TestOrder } from '@/types/testOrder.types'

  interface Props {
    visible: boolean
    testOrderId: number | null
  }

  interface Emits {
    'update:visible': [value: boolean]
    'schedule-slot': [testOrder: TestOrder]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // Estado
  const loading = ref(false)
  const error = ref<string | null>(null)
  const testOrder = ref<TestOrder | null>(null)
  const notifications = useNotifications()

  // Computed
  const hasSlotInfo = computed(() => {
    return testOrder.value?.slot_id && (
      testOrder.value.slot_scheduled_at ||
      testOrder.value.slot_price ||
      testOrder.value.slot_duration_minutes
    )
  })

  const canScheduleSlot = computed(() => {
    return testOrder.value && 
           !testOrder.value.slot_id && 
           ['pendiente', 'pagado'].includes(testOrder.value.status)
  })

  // Métodos
  const loadTestOrderDetails = async () => {
    if (!props.testOrderId) return

    loading.value = true
    error.value = null

    try {
      testOrder.value = await TestOrderService.getTestOrderById(props.testOrderId)
    } catch (err: any) {
      console.error('Error loading test order details:', err)
      const errorMessage = err.message || 'No se pudieron cargar los detalles del examen'
      error.value = errorMessage
      notifications.showError('Error', errorMessage)
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    emit('update:visible', false)
    testOrder.value = null
    error.value = null
  }

  const handleScheduleSlot = () => {
    if (testOrder.value) {
      emit('schedule-slot', testOrder.value)
    }
  }

  // Funciones de utilidad
  const getPatientName = (): string => {
    if (!testOrder.value) return 'No disponible'
    
    if (testOrder.value.patient_first_name && testOrder.value.patient_last_name) {
      return `${testOrder.value.patient_first_name} ${testOrder.value.patient_last_name}`
    }
    
    return 'Paciente'
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      en_espera: 'En espera',
      en_proceso: 'En proceso',
      pendiente_subir: 'Pendiente subir resultados',
      completado: 'Completado',
      cancelado: 'Cancelado'
    }
    return statusMap[status] || status
  }

  const getStatusSeverity = (status: string): string => {
    const severityMap: Record<string, string> = {
      pendiente: 'warning',
      pagado: 'success',
      en_espera: 'warning',
      en_proceso: 'info',
      pendiente_subir: 'warning',
      completado: 'success',
      cancelado: 'danger'
    }
    return severityMap[status] || 'info'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Lima'
    }).format(date)
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(date)
  }

  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price)
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  // Watchers
  watch(
    () => props.visible,
    (isVisible) => {
      if (isVisible && props.testOrderId) {
        loadTestOrderDetails()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.testOrderId,
    () => {
      if (props.visible && props.testOrderId) {
        loadTestOrderDetails()
      }
    }
  )
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

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Información principal del examen */
  .exam-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 8px;
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
    font-size: 1.25rem;
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

  .exam-status {
    display: flex;
    align-items: flex-start;
  }

  .status-tag-large {
    font-size: 0.875rem !important;
    padding: 0.5rem 1rem !important;
    font-weight: 600;
  }

  /* Secciones de información */
  .info-section {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #f3f4f6;
  }

  .info-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    text-align: right;
  }

  .price-highlight {
    color: var(--color-sf-green-normal) !important;
    font-size: 1rem !important;
  }

  /* Instrucciones */
  .instructions-box {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 6px;
  }

  .instructions-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .instructions-text {
    color: #1e40af;
    line-height: 1.6;
    font-size: 0.875rem;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .exam-info {
      flex-direction: column;
    }

    .exam-status {
      align-self: flex-start;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .info-value {
      text-align: left;
    }

    .modal-footer {
      flex-direction: column-reverse;
    }

    .modal-footer button {
      width: 100%;
    }
  }
</style>
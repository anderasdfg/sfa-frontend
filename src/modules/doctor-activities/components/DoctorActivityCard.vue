<template>
  <div 
    class="appointment-card"
    :class="{ 'test-order-card': activity.type === 'test_order' }"
  >
    <div class="appointment-time">
      <div class="time">{{ formatTime(activity.scheduled_at) }}</div>
      <div class="date">{{ formatDate(activity.scheduled_at) }}</div>
    </div>

    <div class="appointment-details">
      <div class="appointment-patient">
        {{ activity.patient_name }}
        <span class="activity-badge" :class="activity.type === 'test_order' ? 'test-badge' : 'appointment-badge'">
          {{ activity.type === 'test_order' ? 'Examen' : 'Cita' }}
        </span>
      </div>
      <div class="appointment-specialty">
        {{ activity.type === 'test_order' ? activity.diagnostic_test_name : activity.modality }}
      </div>
      <div v-if="activity.specialty_name" class="appointment-service">
        {{ activity.specialty_name }}
      </div>
    </div>

    <div class="appointment-status">
      <Tag
        :value="statusLabel"
        :severity="statusSeverity"
        class="status-tag"
      />
    </div>

    <div class="appointment-actions">
      <!-- Para citas médicas -->
      <template v-if="activity.type === 'appointment'">
        <Button
          v-if="canStartConsultation"
          :label="activity.status === 'en_proceso' ? 'Entrar a consulta' : 'Iniciar consulta'"
          icon="pi pi-play"
          size="small"
          @click="$emit('start-consultation', activity)"
          class="p-button-success p-button-sm"
        />
        <Button
          label="Ver detalles"
          icon="pi pi-eye"
          size="small"
          @click="$emit('view-details', activity)"
          class="p-button-outlined p-button-sm"
        />
      </template>

      <!-- Para órdenes de examen -->
      <template v-else-if="activity.type === 'test_order'">
        <!-- Iniciar procesamiento del examen -->
        <Button
          v-if="canStartTestProcessing"
          label="Iniciar examen"
          icon="pi pi-play"
          size="small"
          @click="$emit('start-test-processing', activity)"
          class="p-button-success p-button-sm"
        />
        
        <!-- Completar procesamiento del examen -->
        <Button
          v-else-if="canCompleteTestProcessing"
          label="Completar examen"
          icon="pi pi-check"
          size="small"
          @click="$emit('complete-test-processing', activity)"
          class="p-button-warning p-button-sm"
        />
        
        <!-- Subir resultados -->
        <Button
          v-else-if="canUploadResults"
          label="Subir resultados"
          icon="pi pi-upload"
          size="small"
          @click="$emit('upload-results', activity)"
          class="p-button-info p-button-sm"
        />
        
        <Button
          label="Ver detalles"
          icon="pi pi-eye"
          size="small"
          @click="$emit('view-details', activity)"
          class="p-button-outlined p-button-sm"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { DoctorActivityItem } from '@/modules/user-roles/doctor/composables/useDoctorAppointments'
  import Tag from 'primevue/tag'
  import Button from 'primevue/button'

  interface Props {
    activity: DoctorActivityItem
  }

  interface Emits {
    'view-details': [activity: DoctorActivityItem]
    'start-consultation': [activity: DoctorActivityItem]
    'start-test-processing': [activity: DoctorActivityItem]
    'complete-test-processing': [activity: DoctorActivityItem]
    'upload-results': [activity: DoctorActivityItem]
  }

  const props = defineProps<Props>()
  defineEmits<Emits>()



  const statusLabel = computed(() => {
    const statusMap: Record<string, string> = {
      // Estados de citas (AppointmentStatus)
      reservada: 'Reservada',
      pagada: 'Pagada',
      en_espera: 'En espera',
      en_proceso: 'En proceso',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
      // Estados de órdenes de examen (TestOrderStatus)
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      pendiente_subir: 'Pendiente subir resultados',
      completado: 'Completado',
      cancelado: 'Cancelado'
    }
    return statusMap[props.activity.status] || props.activity.status
  })

  const statusSeverity = computed(() => {
    const severityMap: Record<string, string> = {
      // Estados de citas (AppointmentStatus)
      reservada: 'info',
      pagada: 'success',
      en_espera: 'warning',
      en_proceso: 'info',
      realizada: 'success',
      cancelada: 'danger',
      // Estados de órdenes de examen (TestOrderStatus)
      pendiente: 'warning',
      pagado: 'success',
      pendiente_subir: 'warning',
      completado: 'success',
      cancelado: 'danger'
    }
    return severityMap[props.activity.status] || 'info'
  })

  const canStartConsultation = computed(() => {
    // Puede iniciar consulta si es una cita en: pagada, pagado, en_proceso, en_espera
    if (props.activity.type === 'appointment') {
      return ['pagada', 'pagado', 'en_proceso', 'en_espera'].includes(props.activity.status)
    }
    return false
  })

  const canStartTestProcessing = computed(() => {
    return props.activity.type === 'test_order' && ['pagado', 'en_espera'].includes(props.activity.status)
  })

  const canCompleteTestProcessing = computed(() => {
    return props.activity.type === 'test_order' && props.activity.status === 'en_proceso'
  })

  const canUploadResults = computed(() => {
    return props.activity.type === 'test_order' && props.activity.status === 'pendiente_subir'
  })

  // Funciones de utilidad
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(date)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date)
  }
</script>

<style scoped>
  .appointment-card {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    gap: 1rem;
  }

  .appointment-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .test-order-card {
    border-left: 4px solid var(--color-sf-green-normal);
  }

  .appointment-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 8px;
    text-align: center;
  }

  .appointment-time .time {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.2;
  }

  .appointment-time .date {
    font-size: 0.8rem;
    font-weight: 400;
    color: #718096;
    margin-top: 4px;
  }

  .appointment-details {
    flex: 1;
    min-width: 0;
  }

  .appointment-patient {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .appointment-specialty {
    font-size: 0.9rem;
    color: #718096;
    margin-bottom: 0.25rem;
  }

  .appointment-service {
    font-size: 0.85rem;
    color: #4a5568;
    font-weight: 500;
  }

  .activity-badge {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .appointment-badge {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .test-badge {
    background-color: #fef3c7;
    color: #92400e;
  }

  .appointment-status {
    display: flex;
    align-items: center;
  }

  .status-tag {
    white-space: nowrap;
  }

  .appointment-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .appointment-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .appointment-time {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }

    .appointment-actions {
      width: 100%;
    }

    .appointment-actions button {
      flex: 1;
    }
  }
</style>
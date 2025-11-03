<template>
  <div class="test-order-details-card">
    <div class="card-header">
      <h3 class="card-title">Detalles de la Orden de Examen</h3>
    </div>

    <div class="card-content">
      <!-- Información del Examen -->
      <div class="section">
        <h4 class="section-title">Examen Médico</h4>
        <div class="exam-info">
          <div class="exam-icon">
            <BeakerIcon class="icon" />
          </div>
          <div class="exam-details">
            <p class="exam-name">
              {{ testOrder.diagnostic_test_name }}
              <span v-if="testOrder.diagnostic_test_cpt_code" class="cpt-badge">
                {{ testOrder.diagnostic_test_cpt_code }}
              </span>
            </p>
            <p v-if="testOrder.diagnostic_test_description" class="exam-description">
              {{ testOrder.diagnostic_test_description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Indicaciones del Examen -->
      <div v-if="testOrder.diagnostic_test_patient_instructions" class="section">
        <h4 class="section-title">Indicaciones para el Paciente</h4>
        <div class="instructions-box">
          <DocumentTextIcon class="instructions-icon" />
          <p class="instructions-text">{{ testOrder.diagnostic_test_patient_instructions }}</p>
        </div>
      </div>

      <!-- Información de la Cita -->
      <div v-if="hasSlotInfo" class="section">
        <h4 class="section-title">Información de la Cita</h4>
        <div class="appointment-info">
          <div class="info-grid">
            <div v-if="testOrder.slot_scheduled_at" class="info-item">
              <CalendarIcon class="info-icon" />
              <div>
                <p class="info-label">Fecha</p>
                <p class="info-value">{{ formatDate(testOrder.slot_scheduled_at) }}</p>
              </div>
            </div>

            <div v-if="testOrder.slot_scheduled_at" class="info-item">
              <ClockIcon class="info-icon" />
              <div>
                <p class="info-label">Hora</p>
                <p class="info-value">{{ formatTime(testOrder.slot_scheduled_at) }}</p>
              </div>
            </div>

            <div v-if="testOrder.slot_price" class="info-item">
              <CurrencyDollarIcon class="info-icon" />
              <div>
                <p class="info-label">Precio</p>
                <p class="info-value">S/ {{ testOrder.slot_price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    CalendarIcon,
    ClockIcon,
    BeakerIcon,
    DocumentTextIcon,
    CurrencyDollarIcon
  } from '@heroicons/vue/24/outline'
  import type { TestOrder } from '@/types/testOrder.types'

  interface Props {
    testOrder: TestOrder
  }

  const props = defineProps<Props>()

  // Computed
  const hasSlotInfo = computed(() => {
    return props.testOrder.slot_id && (
      props.testOrder.slot_scheduled_at ||
      props.testOrder.slot_price
    )
  })

  // Métodos de formateo
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    })
  }

  const formatTime = (dateString: string): string => {
    let date: Date
    if (dateString.endsWith('Z')) {
      const localDateString = dateString.replace('Z', '')
      date = new Date(localDateString)
    } else {
      date = new Date(dateString)
    }

    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }


</script>

<style scoped>
  .test-order-details-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .card-header {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    padding: 1rem 1.5rem;
    border-bottom: 2px solid var(--color-sf-green-normal);
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .card-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  /* Exam Info */
  .exam-info {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 8px;
  }

  .exam-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-sf-green-normal);
    border-radius: 8px;
    flex-shrink: 0;
  }

  .exam-icon .icon {
    width: 24px;
    height: 24px;
    color: white;
  }

  .exam-details {
    flex: 1;
  }

  .exam-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
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



  /* Instructions */
  .instructions-box {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background-color: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 4px;
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

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .info-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
    flex-shrink: 0;
  }

  .info-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
  }


</style>

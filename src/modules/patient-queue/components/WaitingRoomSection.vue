<template>
  <div class="waiting-room-section">
    <div class="section-header">
      <div class="header-left">
        <i class="pi pi-users"></i>
        <h3>Sala de Espera</h3>
        <span class="count-badge">{{ patients.length }}</span>
      </div>
    </div>

    <div v-if="patients.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>No hay pacientes en espera</p>
    </div>

    <div v-else class="patients-list">
      <div
        v-for="patient in patients"
        :key="patient.queue_id"
        class="patient-item"
        :class="{
          urgent: patient.is_urgent,
          'payment-pending': patient.payment_pending,
        }"
      >
        <div class="patient-info">
          <div class="patient-header">
            <div class="patient-name">{{ patient.patient_name }}</div>
            <span v-if="patient.is_urgent" class="badge urgent-badge">URGENTE</span>
            <span v-if="patient.payment_pending" class="badge payment-badge"
              >PAGO PENDIENTE</span
            >
          </div>
          <div class="patient-details">
            <span class="doctor">{{ patient.doctor_name }}</span>
            <span class="separator">•</span>
            <span class="specialty">{{ patient.specialty }}</span>
            <span class="separator">•</span>
            <span class="appointment-time">
              Cita: {{ formatTime(patient.appointment_time) }}
            </span>
            <span class="separator">•</span>
            <span class="arrived-time">
              Llegó: {{ formatTime(patient.arrived_at) }}
            </span>
            <span class="separator">•</span>
            <span class="waiting-time" :class="{ urgent: patient.is_urgent }">
              Esperando: {{ patient.waiting_minutes }} min
            </span>
          </div>
        </div>

        <button class="btn-call" @click="$emit('call-to-consultation', patient.queue_id)">
          Llamar a Consulta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { WaitingPatient } from '@/types/patient-queue.types'

  interface Props {
    patients: WaitingPatient[]
  }

  defineProps<Props>()

  defineEmits<{
    (e: 'call-to-consultation', queueId: number): void
  }>()

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
</script>

<style scoped>
  .waiting-room-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    color: #f59e0b;
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

  .patient-item.urgent {
    background: #fef2f2;
    border-left-color: #ef4444;
  }

  .patient-item.payment-pending {
    background: #fffbeb;
    border-left-color: #f59e0b;
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
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .patient-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
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

  .waiting-time.urgent {
    color: #dc2626;
    font-weight: 600;
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

  @media (max-width: 768px) {
    .patient-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .btn-call {
      width: 100%;
    }
  }
</style>

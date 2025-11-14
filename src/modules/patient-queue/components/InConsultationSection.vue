<template>
  <div class="in-consultation-section">
    <div class="section-header">
      <div class="header-left">
        <i class="pi pi-heart-fill"></i>
        <h3>En Consulta</h3>
        <span class="count-badge">{{ patients.length }}</span>
      </div>
    </div>

    <div v-if="patients.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>No hay pacientes en consulta</p>
    </div>

    <div v-else class="patients-list">
      <div
        v-for="patient in patients"
        :key="patient.queue_id"
        class="patient-item"
      >
        <div class="patient-info">
          <div class="patient-header">
            <div class="patient-name">{{ patient.patient_name }}</div>
            <span class="active-indicator">
              <span class="pulse-dot"></span>
              En consulta activa
            </span>
          </div>
          <div class="patient-details">
            <span class="doctor">{{ patient.doctor_name }}</span>
            <span class="separator">•</span>
            <span class="specialty">{{ patient.specialty }}</span>
            <span class="separator">•</span>
            <span class="room">{{ patient.consultation_room }}</span>
            <span class="separator">•</span>
            <span class="start-time">
              Inicio: {{ formatTime(patient.started_at) }}
            </span>
            <span class="separator">•</span>
            <span class="duration">{{ patient.consultation_minutes }} min</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { InConsultationPatient } from '@/types/patient-queue.types'

  interface Props {
    patients: InConsultationPatient[]
  }

  defineProps<Props>()

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
  .in-consultation-section {
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
    color: #3b82f6;
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
    padding: 1.25rem;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
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

  .active-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: white;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #2563eb;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
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

  @media (max-width: 768px) {
    .patient-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

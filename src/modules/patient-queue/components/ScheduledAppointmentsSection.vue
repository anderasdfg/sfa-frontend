<template>
  <div class="scheduled-section">
    <div class="section-header">
      <div class="header-left">
        <i class="pi pi-clock"></i>
        <h3>Citas Programadas para Hoy</h3>
        <span class="count-badge">{{ appointments.length }}</span>
      </div>
    </div>

    <div v-if="appointments.length === 0" class="empty-state">
      <i class="pi pi-calendar"></i>
      <p>No hay citas programadas</p>
    </div>

    <div v-else class="appointments-list">
      <div
        v-for="appointment in appointments"
        :key="appointment.id"
        class="appointment-item"
      >
        <div class="patient-info">
          <div class="patient-name">{{ appointment.patient_name }}</div>
          <div class="appointment-details">
            <span class="doctor">{{ appointment.doctor_name }}</span>
            <span class="separator">•</span>
            <span class="specialty">{{ appointment.specialty }}</span>
            <span class="separator">•</span>
            <span class="time">
              <i class="pi pi-clock"></i>
              {{ formatTime(appointment.appointment_time) }}
            </span>
          </div>
        </div>

        <div class="appointment-badge">
          <span class="badge-type">{{ appointment.appointment_type }}</span>
        </div>

        <div class="appointment-actions">
          <button class="btn-reminder" @click="$emit('send-reminder', appointment.id)">
            <i class="pi pi-bell"></i>
            Recordar
          </button>
          <button
            class="btn-mark-arrival"
            @click="$emit('mark-arrival', appointment.id)"
          >
            Marcar Llegada
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ScheduledAppointment } from '@/types/patient-queue.types'

  interface Props {
    appointments: ScheduledAppointment[]
  }

  defineProps<Props>()

  defineEmits<{
    (e: 'mark-arrival', appointmentId: number): void
    (e: 'send-reminder', appointmentId: number): void
  }>()

  const formatTime = (dateString: string): string => {
    // Remover la Z para interpretar como hora local de Perú
    const localDateString = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString
    const date = new Date(localDateString)
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
</script>

<style scoped>
  .scheduled-section {
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
    color: #8b5cf6;
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

  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .appointment-item:hover {
    background: #f3f4f6;
  }

  .patient-info {
    flex: 1;
  }

  .patient-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .appointment-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .separator {
    color: #d1d5db;
  }

  .time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .appointment-badge {
    padding: 0.375rem 0.75rem;
    background: #ede9fe;
    color: #7c3aed;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .appointment-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-reminder,
  .btn-mark-arrival {
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .btn-reminder {
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
  }

  .btn-reminder:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .btn-mark-arrival {
    background: #059669;
    color: white;
  }

  .btn-mark-arrival:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
  }

  @media (max-width: 768px) {
    .appointment-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .appointment-actions {
      width: 100%;
    }

    .btn-reminder,
    .btn-mark-arrival {
      flex: 1;
    }
  }
</style>

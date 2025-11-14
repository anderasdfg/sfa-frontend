<template>
  <div class="upcoming-appointments-card">
    <div class="card-header">
      <div class="header-title">
        <i class="pi pi-calendar"></i>
        <h3>Próximas Citas</h3>
      </div>
      <span class="appointment-count">{{ appointments.length }} citas programadas</span>
    </div>

    <div class="appointments-list">
      <div v-if="appointments.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <p>No hay citas programadas</p>
      </div>

      <div
        v-else
        class="appointment-item"
        v-for="appointment in appointments"
        :key="appointment.id"
      >
        <div class="appointment-time">
          <i class="pi pi-clock"></i>
          <span>{{ appointment.time }}</span>
        </div>
        <div class="appointment-info">
          <div class="appointment-patient">
            <i class="pi pi-user"></i>
            {{ appointment.patient_name }}
          </div>
          <div class="appointment-doctor">
            <i class="pi pi-user-plus"></i>
            {{ appointment.doctor_name }} - {{ appointment.specialty }}
          </div>
        </div>
        <div class="appointment-badges">
          <span class="status-badge" :class="getStatusClass(appointment.status)">
            {{ appointment.status }}
          </span>
          <span class="modality-badge" :class="getModalityClass(appointment.modality)">
            {{ appointment.modality }}
          </span>
        </div>
      </div>
    </div>

    <button class="btn-view-calendar" @click="handleViewCalendar">
      Ver calendario completo
      <i class="pi pi-arrow-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { UpcomingAppointment } from '@/types/statistics.types'
  import { useRouter } from 'vue-router'

  interface Props {
    appointments: UpcomingAppointment[]
  }

  defineProps<Props>()
  const router = useRouter()

  const getStatusClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Por llegar': 'status-pending',
      Pagada: 'status-paid',
      Completada: 'status-completed',
      Cancelada: 'status-cancelled',
    }
    return statusMap[status] || 'status-pending'
  }

  const getModalityClass = (modality: string): string => {
    return modality === 'Presencial' ? 'modality-in-person' : 'modality-telemedicine'
  }

  const handleViewCalendar = () => {
    router.push('/appointments')
  }
</script>

<style scoped>
  .upcoming-appointments-card {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-title i {
    color: #3b82f6;
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .appointment-count {
    font-size: 0.875rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
  }

  .appointments-list {
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
    margin-bottom: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: #9ca3af;
  }

  .empty-state i {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .appointment-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    background: #f9fafb;
    transition: all 0.2s;
    border-left: 3px solid #3b82f6;
  }

  .appointment-item:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }

  .appointment-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: white;
    border-radius: 8px;
    min-width: 70px;
  }

  .appointment-time i {
    color: #3b82f6;
    font-size: 1rem;
  }

  .appointment-time span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
  }

  .appointment-info {
    flex: 1;
  }

  .appointment-patient {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .appointment-patient i {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .appointment-doctor {
    font-size: 0.8125rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .appointment-doctor i {
    font-size: 0.75rem;
  }

  .appointment-badges {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .status-badge,
  .modality-badge {
    padding: 0.25rem 0.625rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-badge.status-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .status-badge.status-paid {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-badge.status-completed {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.status-cancelled {
    background: #fee2e2;
    color: #991b1b;
  }

  .modality-badge.modality-in-person {
    background: #e0e7ff;
    color: #4338ca;
  }

  .modality-badge.modality-telemedicine {
    background: #ddd6fe;
    color: #6b21a8;
  }

  .btn-view-calendar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    color: #3b82f6;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .btn-view-calendar:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }
</style>

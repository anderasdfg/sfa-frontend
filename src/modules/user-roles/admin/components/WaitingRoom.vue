<template>
  <div class="waiting-room-card">
    <div class="card-header">
      <div class="header-title">
        <i class="pi pi-users"></i>
        <h3>Sala de Espera</h3>
      </div>
      <!--  <span class="patient-count">{{ patients.length }} pacientes esperando</span> -->
    </div>

    <div class="patients-list">
      <div v-if="patients.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>No hay pacientes en espera</p>
      </div>

      <div v-else class="patient-item" v-for="patient in patients" :key="patient.id">
        <div class="patient-avatar">
          <span>{{ getInitials(patient.patient_name) }}</span>
        </div>
        <div class="patient-info">
          <div class="patient-name">{{ patient.patient_name }}</div>
          <div class="patient-doctor">{{ patient.doctor_name }} - {{ patient.specialty }}</div>
        </div>
        <div class="patient-time">
          <div class="time-badge" :class="getTimeBadgeClass(patient.wait_time_minutes)">
            {{ patient.wait_time_minutes }} min
          </div>
          <div class="arrival-time">Llegó: {{ formatTime(patient.arrival_time) }}</div>
        </div>
      </div>
    </div>

    <button class="btn-view-all" @click="handleViewAll">
      <i class="pi pi-eye"></i>
      Cola Completa
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { WaitingPatient } from '@/types/statistics.types'
  import { useRouter } from 'vue-router'

  interface Props {
    patients: WaitingPatient[]
  }

  defineProps<Props>()
  const router = useRouter()

  const getInitials = (name: string): string => {
    const parts = name.split(' ')
    return parts
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase()
  }

  const formatTime = (time: string): string => {
    return new Date(time).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeBadgeClass = (minutes: number): string => {
    if (minutes < 15) return 'time-normal'
    if (minutes < 30) return 'time-warning'
    return 'time-urgent'
  }

  const handleViewAll = () => {
    router.push('/patient-queue')
  }
</script>

<style scoped>
  .waiting-room-card {
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
    color: #ef4444;
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .patient-count {
    font-size: 0.875rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
  }

  .patients-list {
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

  .patient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    background: #f9fafb;
    transition: all 0.2s;
  }

  .patient-item:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }

  .patient-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .patient-info {
    flex: 1;
  }

  .patient-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .patient-doctor {
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .patient-time {
    text-align: right;
  }

  .time-badge {
    padding: 0.25rem 0.625rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .time-badge.time-normal {
    background: #d1fae5;
    color: #065f46;
  }

  .time-badge.time-warning {
    background: #fef3c7;
    color: #92400e;
  }

  .time-badge.time-urgent {
    background: #fee2e2;
    color: #991b1b;
  }

  .arrival-time {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .btn-view-all {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .btn-view-all:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
  }
</style>

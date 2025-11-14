<template>
  <div class="available-doctors-card">
    <div class="card-header">
      <div class="header-title">
        <i class="pi pi-user-plus"></i>
        <h3>Doctores Disponibles Ahora</h3>
      </div>
    </div>

    <div class="doctors-list">
      <div v-if="doctors.length === 0" class="empty-state">
        <i class="pi pi-users"></i>
        <p>No hay doctores disponibles</p>
      </div>

      <div v-else class="doctor-item" v-for="doctor in doctors" :key="doctor.id">
        <div class="doctor-info">
          <div class="doctor-avatar">
            <span>{{ getInitials(doctor.name) }}</span>
          </div>
          <div class="doctor-details">
            <div class="doctor-name">{{ doctor.name }}</div>
            <div class="doctor-specialty">{{ doctor.specialty }}</div>
          </div>
        </div>
        <div class="doctor-status">
          <div class="status-indicator available">
            <span class="status-dot"></span>
            <span>{{ doctor.status }}</span>
          </div>
          <div class="queue-info" v-if="doctor.patients_in_queue > 0">
            <i class="pi pi-users"></i>
            {{ doctor.patients_in_queue }} en cola
          </div>
        </div>
        <button class="btn-assign" @click="handleAssign(doctor.id)">Asignar</button>
      </div>
    </div>

    <button class="btn-view-all-doctors" @click="handleViewAll">
      Ver Todos los Doctores
      <i class="pi pi-arrow-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { AvailableDoctor } from '@/types/statistics.types'
  import { useRouter } from 'vue-router'

  interface Props {
    doctors: AvailableDoctor[]
  }

  defineProps<Props>()
  const router = useRouter()

  const getInitials = (name: string): string => {
    const parts = name.split(' ')
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
  }

  const handleAssign = (doctorId: number) => {
    router.push(`/appointments/new?doctorId=${doctorId}`)
  }

  const handleViewAll = () => {
    router.push('/doctors')
  }
</script>

<style scoped>
  .available-doctors-card {
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
    color: #10b981;
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .doctors-list {
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

  .doctor-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    background: #f9fafb;
    transition: all 0.2s;
  }

  .doctor-item:hover {
    background: #f3f4f6;
  }

  .doctor-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .doctor-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .doctor-details {
    flex: 1;
  }

  .doctor-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .doctor-specialty {
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .doctor-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .status-indicator.available {
    color: #059669;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .queue-info {
    font-size: 0.75rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-assign {
    padding: 0.5rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn-assign:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }

  .btn-view-all-doctors {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    color: #10b981;
    border: 2px solid #10b981;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .btn-view-all-doctors:hover {
    background: #10b981;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
</style>

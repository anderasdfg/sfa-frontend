<template>
  <div class="stats-cards">
    <div class="stat-card urgent">
      <div class="stat-header">
        <div class="stat-icon">
          <i class="pi pi-users"></i>
        </div>
      </div>
      <div class="stat-label">Pacientes Esperando</div>
      <div class="stat-value">{{ waitingPatients }}</div>
      <div class="stat-detail">{{ waitingDetail }}</div>
    </div>

    <div class="stat-card warning">
      <div class="stat-header">
        <div class="stat-icon">
          <i class="pi pi-clock"></i>
        </div>
      </div>
      <div class="stat-label">Tiempo Promedio Espera</div>
      <div class="stat-value">{{ averageWaitTime }} min</div>
      <div class="stat-detail">{{ waitTimeDetail }}</div>
    </div>

    <div class="stat-card success">
      <div class="stat-header">
        <div class="stat-icon">
          <i class="pi pi-user-plus"></i>
        </div>
      </div>
      <div class="stat-label">Doctores Disponibles</div>
      <div class="stat-value">{{ availableDoctors }}</div>
      <div class="stat-detail">{{ doctorsDetail }}</div>
    </div>

    <div class="stat-card info">
      <div class="stat-header">
        <div class="stat-icon">
          <i class="pi pi-dollar"></i>
        </div>
      </div>
      <div class="stat-label">Ingresos del Día</div>
      <div class="stat-value">S/.{{ formatNumber(dailyRevenue) }}</div>
      <div class="stat-detail">{{ revenueDetail }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    waitingPatients: number
    averageWaitTime: number
    availableDoctors: string
    dailyRevenue: number
  }

  const props = defineProps<Props>()

  const waitingDetail = computed(() => {
    return props.waitingPatients > 5 ? '+3 últimos 15 min' : 'En consulta'
  })

  const waitTimeDetail = computed(() => {
    return props.averageWaitTime > 20 ? '5 min vs ayer' : '3 min vs ayer'
  })

  const doctorsDetail = computed(() => {
    const [available, total] = props.availableDoctors.split('/')
    return `+${parseInt(total) - parseInt(available)} demanda`
  })

  const revenueDetail = computed(() => {
    return '+16% vs demanda'
  })

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
</script>

<style scoped>
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    border: 1px solid #e5e7eb;
    position: relative;
  }

  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .stat-card.urgent {
    border: 1px solid #ef4444;
  }

  .stat-card.warning {
    border: 1px solid #f59e0b;
  }

  .stat-card.success {
    border: 1px solid #10b981;
  }

  .stat-card.info {
    border: 1px solid #3b82f6;
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
  }

  .urgent .stat-icon {
    background: #fee2e2;
    color: #dc2626;
  }

  .warning .stat-icon {
    background: #fef3c7;
    color: #d97706;
  }

  .success .stat-icon {
    background: #d1fae5;
    color: #059669;
  }

  .info .stat-icon {
    background: #dbeafe;
    color: #2563eb;
  }

  .stat-badge {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.25rem 0.625rem;
    border-radius: 12px;
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
    line-height: 1;
  }

  .stat-detail {
    font-size: 0.6875rem;
    color: #9ca3af;
  }

  @media (max-width: 1200px) {
    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .stats-cards {
      grid-template-columns: 1fr;
    }
  }
</style>

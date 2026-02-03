<template>
  <div class="day-statistics-card">
    <div class="card-header">
      <div class="header-title">
        <i class="pi pi-chart-line"></i>
        <h3>Estadísticas del Día</h3>
      </div>
      <span class="date-label">{{ currentDate }}</span>
    </div>

    <div class="statistics-grid">
      <div class="stat-item attended">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.patients_attended }}</div>
          <div class="stat-label">Pacientes Atendidos</div>
        </div>
      </div>

      <div class="stat-item absences">
        <div class="stat-icon">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.absences }}</div>
          <div class="stat-label">Ausencias</div>
        </div>
      </div>

      <div class="stat-item rooms">
        <div class="stat-icon">
          <i class="pi pi-building"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.occupied_rooms }}</div>
          <div class="stat-label">Salas Ocupadas</div>
        </div>
      </div>
    </div>

    <div class="statistics-summary">
      <div class="summary-row">
        <span class="summary-label">Tasa de Asistencia:</span>
        <span class="summary-value success">{{ attendanceRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { DayStatistics } from '@/types/statistics.types'

  interface Props {
    statistics: DayStatistics
  }

  const props = defineProps<Props>()

  const currentDate = computed(() => {
    return new Date().toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  })

  const attendanceRate = computed(() => {
    const total = props.statistics.patients_attended + props.statistics.absences + props.statistics.occupied_rooms
    if (total === 0) return 0
    return Math.round(((props.statistics.patients_attended + props.statistics.occupied_rooms)  / total) * 100)
  })
</script>

<style scoped>
  .day-statistics-card {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    height: 100%;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-title i {
    color: #6366f1;
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .date-label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .stat-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-item.attended {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  }

  .stat-item.absences {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  }

  .stat-item.rooms {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: white;
    flex-shrink: 0;
  }

  .attended .stat-icon {
    color: #059669;
  }

  .absences .stat-icon {
    color: #dc2626;
  }

  .rooms .stat-icon {
    color: #2563eb;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .statistics-summary {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .summary-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .summary-value {
    font-size: 1rem;
    font-weight: 700;
  }

  .summary-value.success {
    color: #059669;
  }

  .summary-value.info {
    color: #2563eb;
  }

  @media (max-width: 768px) {
    .statistics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

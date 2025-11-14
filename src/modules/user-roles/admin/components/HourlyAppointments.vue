<template>
  <div class="hourly-appointments-card">
    <div class="card-header">
      <div class="header-title">
        <i class="pi pi-clock"></i>
        <h3>Citas por Hora</h3>
      </div>
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot completed"></span>
          <span>Completadas</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot in-consultation"></span>
          <span>En Consulta</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot scheduled"></span>
          <span>Programadas</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-grid">
        <div
          class="hour-column"
          v-for="appointment in hourlyData"
          :key="appointment.hour"
        >
          <div class="bars-container">
            <div
              class="bar completed"
              :style="{ height: getBarHeight(appointment.completed) }"
              :title="`${appointment.completed} completadas`"
            >
              <span v-if="appointment.completed > 0" class="bar-value">{{
                appointment.completed
              }}</span>
            </div>
            <div
              class="bar in-consultation"
              :style="{ height: getBarHeight(appointment.in_consultation) }"
              :title="`${appointment.in_consultation} en consulta`"
            >
              <span v-if="appointment.in_consultation > 0" class="bar-value">{{
                appointment.in_consultation
              }}</span>
            </div>
            <div
              class="bar scheduled"
              :style="{ height: getBarHeight(appointment.scheduled) }"
              :title="`${appointment.scheduled} programadas`"
            >
              <span v-if="appointment.scheduled > 0" class="bar-value">{{
                appointment.scheduled
              }}</span>
            </div>
          </div>
          <div class="hour-label">{{ appointment.hour }}</div>
        </div>
      </div>
    </div>

    <div class="chart-summary">
      <div class="summary-item">
        <span class="summary-label">Hora Pico:</span>
        <span class="summary-value">{{ peakHour }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total Citas:</span>
        <span class="summary-value">{{ totalAppointments }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { HourlyAppointments } from '@/types/statistics.types'

  interface Props {
    hourlyData: HourlyAppointments[]
  }

  const props = defineProps<Props>()

  const maxValue = computed(() => {
    let max = 0
    props.hourlyData.forEach((hour) => {
      const total = hour.completed + hour.in_consultation + hour.scheduled
      if (total > max) max = total
    })
    return max || 1
  })

  const getBarHeight = (value: number): string => {
    if (value === 0) return '0px'
    const percentage = (value / maxValue.value) * 100
    return `${Math.max(percentage, 5)}%`
  }

  const peakHour = computed(() => {
    let maxHour = ''
    let maxTotal = 0
    props.hourlyData.forEach((hour) => {
      const total = hour.completed + hour.in_consultation + hour.scheduled
      if (total > maxTotal) {
        maxTotal = total
        maxHour = hour.hour
      }
    })
    return maxHour || 'N/A'
  })

  const totalAppointments = computed(() => {
    return props.hourlyData.reduce(
      (sum, hour) => sum + hour.completed + hour.in_consultation + hour.scheduled,
      0,
    )
  })
</script>

<style scoped>
  .hourly-appointments-card {
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
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-title i {
    color: #f59e0b;
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .legend {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .legend-dot.completed {
    background: #10b981;
  }

  .legend-dot.in-consultation {
    background: #f59e0b;
  }

  .legend-dot.scheduled {
    background: #3b82f6;
  }

  .chart-container {
    margin-bottom: 1.5rem;
    overflow-x: auto;
  }

  .chart-grid {
    display: flex;
    gap: 0.5rem;
    min-width: 100%;
    height: 200px;
    align-items: flex-end;
    padding: 1rem 0;
  }

  .hour-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 60px;
  }

  .bars-container {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 150px;
    width: 100%;
    justify-content: center;
  }

  .bar {
    flex: 1;
    max-width: 18px;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 4px;
    cursor: pointer;
    position: relative;
  }

  .bar:hover {
    opacity: 0.8;
    transform: scaleY(1.05);
  }

  .bar.completed {
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  }

  .bar.in-consultation {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  }

  .bar.scheduled {
    background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  }

  .bar-value {
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
  }

  .hour-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
  }

  .chart-summary {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .summary-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .summary-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
  }

  @media (max-width: 768px) {
    .chart-grid {
      gap: 0.25rem;
    }

    .hour-column {
      min-width: 40px;
    }

    .bar {
      max-width: 12px;
    }
  }
</style>

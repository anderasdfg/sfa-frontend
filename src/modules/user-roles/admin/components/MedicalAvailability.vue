<template>
  <div class="medical-availability-card">
    <div class="card-header">
      <div class="header-title">
        <i class="pi pi-chart-bar"></i>
        <h3>Disponibilidad Médica</h3>
      </div>
      <!--  <span class="subtitle">Doctores en sistema</span> -->
    </div>

    <div class="availability-chart">
      <div class="chart-bars">
        <div class="bar-item">
          <div class="bar-container">
            <div
              class="bar-fill available"
              :style="{ height: getBarHeight(availability.available) }"
            >
              <span class="bar-value">{{ availability.available }}</span>
            </div>
          </div>
          <div class="bar-label">
            <div class="label-dot available"></div>
            <span>Disponibles</span>
          </div>
        </div>

        <div class="bar-item">
          <div class="bar-container">
            <div
              class="bar-fill in-consultation"
              :style="{ height: getBarHeight(availability.in_consultation) }"
            >
              <span class="bar-value">{{ availability.in_consultation }}</span>
            </div>
          </div>
          <div class="bar-label">
            <div class="label-dot in-consultation"></div>
            <span>En Consulta</span>
          </div>
        </div>

        <div class="bar-item">
          <div class="bar-container">
            <div class="bar-fill busy" :style="{ height: getBarHeight(availability.busy) }">
              <span class="bar-value">{{ availability.busy }}</span>
            </div>
          </div>
          <div class="bar-label">
            <div class="label-dot busy"></div>
            <span>Ocupado</span>
          </div>
        </div>
      </div>

      <div class="availability-summary">
        <div class="summary-item">
          <span class="summary-label">Total Doctores:</span>
          <span class="summary-value">{{ totalDoctors }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tasa de Ocupación:</span>
          <span class="summary-value">{{ occupancyRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { MedicalAvailability } from '@/types/statistics.types'

  interface Props {
    availability: MedicalAvailability
  }

  const props = defineProps<Props>()

  const totalDoctors = computed(() => {
    return (
      props.availability.available + props.availability.in_consultation + props.availability.busy
    )
  })

  const occupancyRate = computed(() => {
    if (totalDoctors.value === 0) return 0
    const occupied = props.availability.in_consultation + props.availability.busy
    return Math.round((occupied / totalDoctors.value) * 100)
  })

  const getBarHeight = (value: number): string => {
    if (totalDoctors.value === 0) return '0%'
    const percentage = (value / totalDoctors.value) * 100
    return `${Math.max(percentage, 10)}%`
  }
</script>

<style scoped>
  .medical-availability-card {
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
    color: #8b5cf6;
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .availability-chart {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .chart-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    gap: 1.5rem;
    height: 200px;
    padding: 1rem 0;
  }

  .bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .bar-container {
    width: 100%;
    height: 150px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0.5rem;
  }

  .bar-fill {
    width: 100%;
    border-radius: 6px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
  }

  .bar-fill.available {
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  }

  .bar-fill.in-consultation {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  }

  .bar-fill.busy {
    background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  }

  .bar-value {
    color: white;
    font-weight: 700;
    font-size: 1.25rem;
  }

  .bar-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: #6b7280;
    font-weight: 500;
  }

  .label-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .label-dot.available {
    background: #10b981;
  }

  .label-dot.in-consultation {
    background: #f59e0b;
  }

  .label-dot.busy {
    background: #ef4444;
  }

  .availability-summary {
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
</style>

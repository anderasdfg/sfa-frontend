<template>
  <div class="queue-statistics">
    <div class="header">
      <h1>Estadísticas de Cola</h1>
      <router-link to="/patient-queue" class="btn-back">
        ← Volver a la cola
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label>Doctor:</label>
        <select v-model="selectedDoctorId" @change="loadStatistics">
          <option :value="undefined">Todos los doctores</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.first_name }} {{ doctor.last_name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando estadísticas...</div>

    <!-- Error -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Estadísticas -->
    <div v-if="!loading && !error && statistics" class="stats-grid">
      <div class="stat-card waiting">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h3>En Espera</h3>
          <p class="stat-value">{{ statistics.waiting }}</p>
        </div>
      </div>

      <div class="stat-card in-consultation">
        <div class="stat-icon">👨‍⚕️</div>
        <div class="stat-content">
          <h3>En Consulta</h3>
          <p class="stat-value">{{ statistics.in_consultation }}</p>
        </div>
      </div>

      <div class="stat-card completed">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Completados</h3>
          <p class="stat-value">{{ statistics.completed }}</p>
        </div>
      </div>

      <div class="stat-card cancelled">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <h3>Cancelados</h3>
          <p class="stat-value">{{ statistics.cancelled }}</p>
        </div>
      </div>

      <div class="stat-card average">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <h3>Tiempo Promedio de Espera</h3>
          <p class="stat-value">{{ statistics.average_wait_minutes }} min</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PatientQueueService } from '@/services/patientQueue.service'
import { DoctorService } from '@/services/doctors.service'
import type { PatientQueueStatistics } from '@/types/patientQueue.types'
import type { Doctor } from '@/types/doctor.types'

const statistics = ref<PatientQueueStatistics | null>(null)
const doctors = ref<Doctor[]>([])
const selectedDoctorId = ref<number | undefined>(undefined)
const loading = ref(false)
const error = ref<string | null>(null)

const loadStatistics = async () => {
  loading.value = true
  error.value = null
  try {
    statistics.value = await PatientQueueService.getStatistics(selectedDoctorId.value)
  } catch (e: any) {
    error.value = e.message || 'Error al cargar estadísticas'
  } finally {
    loading.value = false
  }
}

const loadDoctors = async () => {
  try {
    doctors.value = await DoctorService.getDoctors()
  } catch (e) {
    console.error('Error loading doctors:', e)
  }
}

onMounted(() => {
  loadStatistics()
  loadDoctors()
})
</script>

<style scoped>
.queue-statistics {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #1a202c;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: #4a5568;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #2d3748;
}

.filters {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 300px;
}

.filter-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.875rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
}

.error {
  color: #e53e3e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1a202c;
  margin: 0;
}

.stat-card.waiting {
  border-left: 4px solid #d69e2e;
}

.stat-card.in-consultation {
  border-left: 4px solid #3182ce;
}

.stat-card.completed {
  border-left: 4px solid #38a169;
}

.stat-card.cancelled {
  border-left: 4px solid #e53e3e;
}

.stat-card.average {
  border-left: 4px solid #805ad5;
}
</style>

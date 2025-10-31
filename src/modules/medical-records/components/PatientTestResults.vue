<template>
  <div class="patient-test-results">
    <div class="header">
      <h3>Resultados de Exámenes</h3>
      <button @click="loadResults" class="btn-refresh">
        🔄 Actualizar
      </button>
    </div>

    <div v-if="loading" class="loading">Cargando resultados...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="results.length === 0" class="empty-state">
      No hay resultados de exámenes disponibles
    </div>

    <div v-else class="results-list">
      <div v-for="result in results" :key="result.test_order_id" class="result-card">
        <div class="result-header">
          <h4>{{ result.test_name }}</h4>
          <span :class="`status-badge status-${result.status}`">
            {{ result.status }}
          </span>
        </div>

        <div class="result-info">
          <p><strong>Fecha:</strong> {{ formatDate(result.test_date) }}</p>
          <p v-if="result.diagnostic_test">
            <strong>Prueba:</strong> {{ result.diagnostic_test }}
          </p>
        </div>

        <div v-if="result.results && result.results.length > 0" class="result-details">
          <h5>Detalles:</h5>
          <ul>
            <li v-for="(detail, index) in result.results" :key="index">
              {{ detail }}
            </li>
          </ul>
        </div>

        <div v-if="result.pdf_url" class="result-actions">
          <a :href="result.pdf_url" target="_blank" class="btn-download">
            📄 Ver PDF
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PatientService } from '@/services/patient.service'

interface Props {
  patientId: number
}

const props = defineProps<Props>()

const results = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadResults = async () => {
  loading.value = true
  error.value = null
  try {
    results.value = await PatientService.getPatientTestResults(props.patientId)
  } catch (e: any) {
    error.value = e.message || 'Error al cargar resultados'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.patient-test-results {
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h3 {
  font-size: 1.25rem;
  color: #1a202c;
  margin: 0;
}

.btn-refresh {
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #3182ce;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.error {
  color: #e53e3e;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-card {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.result-card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.result-header h4 {
  font-size: 1.125rem;
  color: #1a202c;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-completado,
.status-completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-pendiente,
.status-pending {
  background: #feebc8;
  color: #7c2d12;
}

.status-en_proceso,
.status-processing {
  background: #bee3f8;
  color: #2c5282;
}

.result-info {
  margin-bottom: 1rem;
}

.result-info p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #4a5568;
}

.result-details {
  margin-bottom: 1rem;
}

.result-details h5 {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.result-details ul {
  margin: 0;
  padding-left: 1.5rem;
}

.result-details li {
  font-size: 0.875rem;
  color: #718096;
  margin: 0.25rem 0;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-download {
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-download:hover {
  background: #38a169;
}
</style>

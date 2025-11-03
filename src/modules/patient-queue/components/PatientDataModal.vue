<template>
  <Dialog
    :visible="visible"
    modal
    header="Datos del Paciente"
    :style="{ width: '500px' }"
    :closable="true"
    @update:visible="handleClose"
  >
    <div v-if="loading" class="patient-modal-loading">
      <ProgressSpinner size="small" />
      <p>Cargando datos del paciente...</p>
    </div>

    <div v-else-if="patient" class="patient-modal-content">
      <div class="patient-info-grid">
        <div class="info-item">
          <label>Nombre completo:</label>
          <span>{{ patient.first_name }} {{ patient.last_name }}</span>
        </div>
        
        <div class="info-item">
          <label>Documento:</label>
          <span>{{ patient.document_number }}</span>
        </div>
        
        <div class="info-item" v-if="patient.phone">
          <label>Teléfono:</label>
          <span>{{ patient.phone }}</span>
        </div>
        
        <div class="info-item" v-if="patient.email">
          <label>Email:</label>
          <span>{{ patient.email }}</span>
        </div>
        
        <div class="info-item" v-if="patient.date_of_birth">
          <label>Fecha de nacimiento:</label>
          <span>{{ formatDate(patient.date_of_birth) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="patient-modal-error">
      <p>No se pudieron cargar los datos del paciente</p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { PatientService } from '@/services/patient.service'
import { useToast } from 'primevue/usetoast'
import type { Patient } from '@/types/medical.types'

interface Props {
  visible: boolean
  patientId: number | null
}

interface Emits {
  'update:visible': [value: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()

// Estado del componente
const loading = ref(false)
const patient = ref<Patient | null>(null)

// Función para formatear fechas
const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

// Función para cargar datos del paciente
const loadPatientData = async () => {
  if (!props.patientId) return

  loading.value = true
  patient.value = null

  try {
    const patientData = await PatientService.getPatientById(props.patientId)
    patient.value = patientData
  } catch (error) {
    console.error('Error loading patient data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del paciente',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Función para manejar el cierre del modal
const handleClose = () => {
  emit('update:visible', false)
  // Limpiar estado al cerrar
  patient.value = null
}

// Watcher para cargar datos cuando se abre el modal
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && props.patientId) {
      loadPatientData()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* Estilos del modal de paciente */
.patient-modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.patient-modal-content {
  padding: 1rem 0;
}

.patient-info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.info-item span {
  color: #2d3748;
  font-size: 0.95rem;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.patient-modal-error {
  text-align: center;
  padding: 2rem;
  color: #e53e3e;
}

@media (max-width: 768px) {
  .patient-modal-content {
    padding: 0.5rem 0;
  }
  
  .patient-info-grid {
    gap: 0.75rem;
  }
}
</style>
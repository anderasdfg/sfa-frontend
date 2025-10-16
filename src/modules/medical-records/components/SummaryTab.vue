<template>
  <div class="summary-tab">
    <div class="summary-layout">
      <!-- Main Summary Section -->
      <div class="summary-main">
        <Card>
          <template #header>
            <div class="section-header">
              <div>
                <h2 class="section-title">Resumen de la Consulta</h2>
                <p class="section-subtitle">
                  Vista general de los principales hallazgos y decisiones médicas tomadas en esta consulta
                </p>
              </div>
            </div>
          </template>
          <template #content>
            <!-- Complaints -->
            <div class="summary-section">
              <div class="summary-section-header">
                <h3 class="summary-section-title">
                  <i class="pi pi-file-edit"></i>
                  Motivo de Consulta
                </h3>
              </div>
              <div v-if="complaints && complaints.length > 0" class="summary-section-content">
                <div class="complaints-list">
                  <Chip 
                    v-for="complaint in complaints" 
                    :key="complaint" 
                    :label="complaint" 
                    class="complaint-chip"
                  />
                </div>
              </div>
              <div v-else class="empty-state-small">
                <i class="pi pi-inbox"></i>
                <span>No se registraron quejas</span>
              </div>
            </div>

            <!-- Diagnoses and Prescriptions (side by side) -->
            <div class="summary-section">
              <div class="diagnosis-prescription-grid">
                <!-- Diagnoses Column -->
                <div class="diagnosis-column">
                  <div class="summary-section-header">
                    <h3 class="summary-section-title">
                      <i class="pi pi-search"></i>
                      Diagnósticos
                    </h3>
                  </div>
                  <div v-if="diagnoses.length" class="summary-section-content">
                    <div class="diagnoses-list">
                      <div v-for="diagnosis in diagnoses" :key="diagnosis.id" class="diagnosis-item">
                        <div class="diagnosis-type">
                          <Tag :severity="diagnosis.diagnosis_type === 'definitivo' ? 'success' : 'warning'" 
                               :value="diagnosis.diagnosis_type === 'definitivo' ? 'Definitivo' : 'Presuntivo'" />
                        </div>
                        <div class="diagnosis-content">
                          <span class="diagnosis-code">{{ diagnosis.cie10_code }}</span>
                          <span class="diagnosis-description">{{ diagnosis.description }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-state-small">
                    <i class="pi pi-inbox"></i>
                    <span>No se registraron diagnósticos</span>
                  </div>
                </div>
                
                <!-- Prescriptions Column -->
                <div class="prescription-column">
                  <div class="summary-section-header">
                    <h3 class="summary-section-title">
                      <i class="pi pi-shopping-bag"></i>
                      Prescripciones
                    </h3>
                  </div>
                  <div v-if="prescriptions.length" class="summary-section-content">
                    <div class="prescriptions-list">
                      <div v-for="prescription in prescriptions" :key="prescription.id" class="prescription-item">
                        <div class="prescription-header">
                          <span class="prescription-medication">{{ prescription.medication }}</span>
                        </div>
                        <div class="prescription-details">
                          <span class="detail-chip">
                            <i class="pi pi-clock"></i>
                            {{ prescription.dosage }}
                          </span>
                          <span class="detail-chip">
                            <i class="pi pi-calendar"></i>
                            {{ prescription.frequency }}
                          </span>
                          <span class="detail-chip">
                            <i class="pi pi-calendar-times"></i>
                            {{ prescription.duration }}
                          </span>
                        </div>
                        <div v-if="prescription.instructions" class="prescription-instructions">
                          <p>{{ prescription.instructions }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-state-small">
                    <i class="pi pi-inbox"></i>
                    <span>No se registraron prescripciones médicas</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Treatment Plan -->
            <div class="summary-section">
              <div class="summary-section-header">
                <h3 class="summary-section-title">
                  <i class="pi pi-list"></i>
                  Plan de Tratamiento e Indicaciones
                </h3>
              </div>
              <div v-if="treatmentPlan" class="summary-section-content">
                <div class="treatment-plan">
                  {{ treatmentPlan }}
                </div>
              </div>
              <div v-else class="empty-state-small">
                <i class="pi pi-inbox"></i>
                <span>No se registraron indicaciones</span>
              </div>
            </div>

            <!-- Tests -->
            <div class="summary-section">
              <div class="summary-section-header">
                <h3 class="summary-section-title">
                  <i class="pi pi-chart-bar"></i>
                  Exámenes Auxiliares
                </h3>
              </div>
              <div v-if="diagnosisTests.length" class="summary-section-content">
                <div class="tests-list">
                  <div v-for="test in diagnosisTests" :key="test.id" class="test-item">
                    <span class="test-type">{{ test.test_type }}</span>
                    <span class="test-description">{{ test.description }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-small">
                <i class="pi pi-inbox"></i>
                <span>No se registraron exámenes auxiliares</span>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="save-section">
      <Button
        label="Finalizar Consulta"
        icon="pi pi-check-circle"
        @click="handleFinishConsultation"
        :loading="saving"
        severity="success"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import { useConsultationStore } from '@/stores/consultation/consultationStore'

const emit = defineEmits(['consultation-finished'])

const consultationStore = useConsultationStore()

const saving = ref(false)

// Propiedades computadas del store de consulta
const consultation = computed(() => consultationStore.currentConsultation)
const diagnoses = computed(() => consultationStore.diagnosis || [])
const diagnosisTests = computed(() => consultationStore.diagnosisTests || [])
const prescriptions = computed(() => consultationStore.prescriptions || [])
const complaints = computed(() => {
  const chiefComplaint = consultationStore.currentConsultation?.chief_complaint
  return chiefComplaint ? chiefComplaint.split(',').filter(Boolean) : []
})
const treatmentPlan = computed(() => consultation.value?.treatment_plan || '')

const handleFinishConsultation = async () => {
  saving.value = true
  
  try {
    emit('consultation-finished')
  } catch (error) {
    console.error('Error finishing consultation:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.summary-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.summary-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.summary-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section Headers */
.section-header {
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    var(--color-sf-green-light) 0%,
    var(--color-sf-green-normal) 100%
  );
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-radius: 1rem 1rem 0 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  border-radius: 1rem 1rem 0 0;
}

.section-subtitle {
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.95;
}

/* Summary Sections */
.summary-section {
  padding: 1.25rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-section:first-child {
  padding-top: 0;
}

.summary-section:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.summary-section-header {
  margin-bottom: 1rem;
}

.summary-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-sf-green-normal);
}

.summary-section-title i {
  font-size: 1rem;
}

.summary-section-content {
  color: #374151;
}

/* Consultation Header */
.consultation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #4b5563;
}

.consultation-status i {
  color: var(--color-sf-green-normal);
}

.status-badge {
  font-weight: 600;
  color: var(--color-sf-green-normal);
}

/* Complaints */
.complaints-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.complaint-chip {
  background: var(--color-sf-green-light) !important;
  color: white !important;
}

/* Diagnoses and Prescriptions Grid */
.diagnosis-prescription-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.diagnosis-column,
.prescription-column {
  flex: 1;
}

/* Diagnoses */
.diagnoses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.diagnosis-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 3px solid var(--color-sf-green-light);
}

.diagnosis-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.diagnosis-code {
  font-weight: 700;
  color: var(--color-sf-green-normal);
  font-size: 0.875rem;
}

.diagnosis-description {
  font-size: 0.9375rem;
}

/* Treatment Plan */
.treatment-plan {
  white-space: pre-wrap;
  line-height: 1.6;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  border-left: 3px solid var(--color-sf-green-light);
}

/* Tests */
.tests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 3px solid var(--color-sf-green-light);
}

.test-type {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.test-description {
  font-size: 0.875rem;
  color: #4b5563;
}

/* Prescriptions */
.prescriptions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prescription-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 3px solid var(--color-sf-green-light);
}

.prescription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prescription-medication {
  font-weight: 600;
  font-size: 0.9375rem;
}

.prescription-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #4b5563;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.detail-chip i {
  font-size: 0.75rem;
  color: var(--color-sf-green-normal);
}

.prescription-instructions {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

/* Card header styles */
.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Empty States */
.empty-state-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  padding: 1rem;
  font-size: 0.875rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

/* Save Section */
.save-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .summary-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .diagnosis-prescription-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .diagnosis-column {
    margin-bottom: 1rem;
  }
}

@media (max-width: 640px) {
  .section-header {
    padding: 1rem;
  }

  .diagnosis-item,
  .test-item,
  .prescription-item {
    padding: 0.5rem;
  }

  .prescription-details {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
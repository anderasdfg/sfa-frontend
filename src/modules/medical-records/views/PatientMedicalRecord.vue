<template>
  <div class="patient-medical-record">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p class="loading-text">Cargando historia clínica...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle error-icon"></i>
      <h2 class="error-title">Error al cargar la historia clínica</h2>
      <p class="error-message">{{ error }}</p>
      <Button label="Reintentar" icon="pi pi-refresh" @click="loadMedicalRecord" />
    </div>

    <!-- Main Content -->
    <div v-else-if="medicalRecord" class="medical-record-content">
      <!-- Header Section -->
      <div class="record-header">
        <div class="header-left">
          <div class="patient-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="patient-info">
            <h1 class="patient-name">{{ medicalRecord.patient.full_name }}</h1>
            <div class="patient-meta">
              <span class="meta-item">
                <i class="pi pi-id-card"></i>
                {{ medicalRecord.patient.document_type }}: {{ medicalRecord.patient.document_number }}
              </span>
              <span class="meta-item">
                <i class="pi pi-calendar"></i>
                {{ calculateAge(medicalRecord.patient.birth_date) }} años
              </span>
              <span class="meta-item">
                <i class="pi pi-venus-mars"></i>
                {{ medicalRecord.patient.gender }}
              </span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="record-info">
            <span class="record-label">N° Historia Clínica</span>
            <span class="record-number">{{ medicalRecord.record_number }}</span>
          </div>
        </div>
      </div>

      <!-- Patient Details Card -->
      <Card class="patient-details-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-user"></i>
            <span>Información del Paciente</span>
          </div>
        </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Correo Electrónico</span>
              <span class="detail-value">{{ medicalRecord.patient.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Teléfono</span>
              <span class="detail-value">{{ medicalRecord.patient.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fecha de Nacimiento</span>
              <span class="detail-value">{{ formatDate(medicalRecord.patient.birth_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Grupo Sanguíneo</span>
              <span class="detail-value">{{ extractBloodType(medicalRecord.general_notes) }}</span>
            </div>
          </div>
          <div v-if="medicalRecord.general_notes" class="general-notes">
            <span class="detail-label">Notas Generales</span>
            <p class="notes-text">{{ medicalRecord.general_notes }}</p>
          </div>
        </template>
      </Card>

      <!-- Consultations Section -->
      <div class="consultations-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="pi pi-file-edit"></i>
            Historial de Consultas
          </h2>
          <Tag
            :value="`${consultationsCount} ${consultationsCount === 1 ? 'consulta' : 'consultas'}`"
            severity="info"
          />
        </div>

        <div v-if="consultationsCount === 0" class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p class="empty-text">No hay consultas registradas</p>
        </div>

        <div v-else class="consultations-list">
          <Card
            v-for="consultation in sortedConsultations"
            :key="consultation.id"
            class="consultation-card"
          >
            <template #content>
              <!-- Consultation Header -->
              <div class="consultation-header">
                <div class="consultation-date">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDateTime(consultation.consultation_date) }}</span>
                </div>
                <div class="consultation-doctor">
                  <i class="pi pi-user-md"></i>
                  <span>{{ consultation.doctor.full_name }}</span>
                  <Tag :value="consultation.doctor.specialty" severity="secondary" />
                </div>
              </div>

              <!-- Chief Complaint -->
              <div class="consultation-section">
                <h4 class="section-subtitle">
                  <i class="pi pi-comment"></i>
                  Motivo de Consulta
                </h4>
                <p class="section-text">{{ consultation.chief_complaint || 'No especificado' }}</p>
              </div>

              <!-- Current Illness History -->
              <div
                v-if="consultation.current_illness_history"
                class="consultation-section"
              >
                <h4 class="section-subtitle">
                  <i class="pi pi-book"></i>
                  Historia de Enfermedad Actual
                </h4>
                <p class="section-text">{{ consultation.current_illness_history }}</p>
              </div>

              <!-- Diagnoses -->
              <div v-if="consultation.diagnoses.length > 0" class="consultation-section">
                <h4 class="section-subtitle">
                  <i class="pi pi-heart"></i>
                  Diagnósticos
                </h4>
                <div class="diagnoses-list">
                  <div
                    v-for="diagnosis in consultation.diagnoses"
                    :key="diagnosis.id"
                    class="diagnosis-item"
                  >
                    <Tag
                      :value="diagnosis.diagnosis_type"
                      :severity="diagnosis.diagnosis_type === 'definitivo' ? 'success' : 'warning'"
                    />
                    <span class="diagnosis-code">{{ diagnosis.cie10_code }}</span>
                    <span class="diagnosis-description">{{ diagnosis.description }}</span>
                  </div>
                </div>
              </div>

              <!-- Prescriptions -->
              <div v-if="consultation.prescriptions.length > 0" class="consultation-section">
                <h4 class="section-subtitle">
                  <i class="pi pi-shopping-bag"></i>
                  Receta Médica
                </h4>
                <div class="prescriptions-list">
                  <div
                    v-for="prescription in consultation.prescriptions"
                    :key="prescription.id"
                    class="prescription-item"
                  >
                    <div class="prescription-header">
                      <i class="pi pi-circle-fill"></i>
                      <strong>{{ prescription.medication }}</strong>
                    </div>
                    <div class="prescription-details">
                      <span><strong>Dosis:</strong> {{ prescription.dosage }}</span>
                      <span><strong>Frecuencia:</strong> {{ prescription.frequency }}</span>
                      <span><strong>Duración:</strong> {{ prescription.duration }}</span>
                    </div>
                    <div v-if="prescription.instructions" class="prescription-instructions">
                      <i class="pi pi-info-circle"></i>
                      <span>{{ prescription.instructions }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Diagnostic Tests -->
              <div v-if="consultation.diagnostic_tests.length > 0" class="consultation-section">
                <h4 class="section-subtitle">
                  <i class="pi pi-chart-line"></i>
                  Exámenes Diagnósticos
                </h4>
                <div class="tests-list">
                  <div
                    v-for="test in consultation.diagnostic_tests"
                    :key="test.id"
                    class="test-item"
                  >
                    <div class="test-header">
                      <span class="test-type">{{ test.test_type }}</span>
                      <Tag
                        v-if="test.result"
                        value="Completado"
                        severity="success"
                      />
                      <Tag v-else value="Pendiente" severity="warning" />
                    </div>
                    <p class="test-description">{{ test.description }}</p>
                    <div v-if="test.result" class="test-result">
                      <strong>Resultado:</strong> {{ test.result }}
                    </div>
                    <div v-if="test.test_date" class="test-date">
                      <i class="pi pi-calendar"></i>
                      <span>{{ formatDate(test.test_date) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Treatment Plan -->
              <div v-if="consultation.treatment_plan" class="consultation-section">
                <h4 class="section-subtitle">
                  <i class="pi pi-clipboard"></i>
                  Plan de Tratamiento
                </h4>
                <p class="section-text">{{ consultation.treatment_plan }}</p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useMedicalRecordStore } from '@/stores/medicalRecord/medicalRecordStore'
  import { useAuthStore } from '@/stores/auth/authStore'
  import ProgressSpinner from 'primevue/progressspinner'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import Tag from 'primevue/tag'

  const medicalRecordStore = useMedicalRecordStore()
  const authStore = useAuthStore()

  // Computed
  const medicalRecord = computed(() => medicalRecordStore.currentMedicalRecord)
  const isLoading = computed(() => medicalRecordStore.isLoading)
  const error = computed(() => medicalRecordStore.error)
  const consultationsCount = computed(() => medicalRecordStore.consultationsCount)

  const sortedConsultations = computed(() => {
    return [...medicalRecordStore.consultations].sort((a, b) => {
      return new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
    })
  })

  // Methods
  const loadMedicalRecord = async () => {
    const user = authStore.user
    if (!user?.document_number) {
      medicalRecordStore.error = 'No se encontró el número de documento del usuario'
      return
    }

    await medicalRecordStore.fetchMedicalRecordByDocument(user.document_number)
  }

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const extractBloodType = (notes: string): string => {
    const match = notes?.match(/Grupo sanguíneo:\s*([A-Z][+-]?)/i)
    return match ? match[1] : 'No especificado'
  }

  // Lifecycle
  onMounted(() => {
    loadMedicalRecord()
  })
</script>

<style scoped>
  .patient-medical-record {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Loading & Error States */
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
  }

  .loading-text {
    color: #64748b;
    font-size: 1rem;
  }

  .error-icon {
    font-size: 4rem;
    color: #ef4444;
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .error-message {
    color: #64748b;
    margin: 0;
  }

  /* Header Section */
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    border-radius: 12px;
    color: white;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .patient-avatar {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .patient-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .patient-name {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
  }

  .patient-meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.95rem;
    opacity: 0.95;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-right {
    text-align: right;
  }

  .record-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .record-label {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .record-number {
    font-size: 1.25rem;
    font-weight: 700;
  }

  /* Patient Details Card */
  .patient-details-card {
    margin-bottom: 2rem;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #059669;
    font-size: 1.25rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 600;
  }

  .detail-value {
    font-size: 1rem;
    color: #1e293b;
  }

  .general-notes {
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .notes-text {
    margin-top: 0.5rem;
    color: #475569;
    line-height: 1.6;
  }

  /* Consultations Section */
  .consultations-section {
    margin-top: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-text {
    font-size: 1.125rem;
  }

  /* Consultation Cards */
  .consultations-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .consultation-card {
    border-left: 4px solid #059669;
  }

  .consultation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .consultation-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #059669;
  }

  .consultation-doctor {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #475569;
  }

  .consultation-section {
    margin-bottom: 1.5rem;
  }

  .consultation-section:last-child {
    margin-bottom: 0;
  }

  .section-subtitle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  .section-text {
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }

  /* Diagnoses */
  .diagnoses-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .diagnosis-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .diagnosis-code {
    font-weight: 600;
    color: #059669;
  }

  .diagnosis-description {
    color: #475569;
  }

  /* Prescriptions */
  .prescriptions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .prescription-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #059669;
  }

  .prescription-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .prescription-header i {
    font-size: 0.5rem;
    color: #059669;
  }

  .prescription-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #475569;
  }

  .prescription-instructions {
    display: flex;
    align-items: start;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e2e8f0;
    font-size: 0.875rem;
    color: #64748b;
  }

  .prescription-instructions i {
    margin-top: 0.125rem;
  }

  /* Diagnostic Tests */
  .tests-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .test-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .test-type {
    font-weight: 600;
    color: #1e293b;
  }

  .test-description {
    color: #475569;
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }

  .test-result {
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    margin-top: 0.5rem;
    color: #475569;
  }

  .test-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .patient-medical-record {
      padding: 1rem;
    }

    .record-header {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
    }

    .header-left {
      flex-direction: column;
    }

    .header-right {
      text-align: center;
    }

    .patient-meta {
      flex-direction: column;
      gap: 0.5rem;
    }

    .consultation-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<template>
  <div class="medical-records-list-view">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-folder-open"></i>
            Historiales Médicos
          </h1>
          <p class="page-subtitle">Buscar y acceder a historiales médicos de pacientes</p>
        </div>
      </div>
    </div>

    <Card class="search-card">
      <template #content>
        <div class="search-section">
          <h3 class="search-title">Buscar Historia Clínica</h3>
          <div class="search-form">
            <IconField iconPosition="left" class="search-field">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchDNI"
                placeholder="Ingrese el DNI del paciente..."
                class="search-input"
                @keyup.enter="searchMedicalRecord"
              />
            </IconField>
            <Button
              label="Buscar"
              icon="pi pi-search"
              @click="searchMedicalRecord"
              :loading="searching"
              severity="success"
            />
          </div>
          <small v-if="searchError" class="error-text">{{ searchError }}</small>
        </div>
      </template>
    </Card>

    <div v-if="searchResult" class="result-section">
      <Card class="result-card">
        <template #content>
          <div class="patient-header">
            <div class="patient-info-section">
              <div class="patient-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="patient-details">
                <h2 class="patient-name">{{ searchResult.patient.full_name }}</h2>
                <div class="patient-meta">
                  <span class="meta-item">
                    <i class="pi pi-id-card"></i>
                    {{ searchResult.patient.document_type }}: {{ searchResult.patient.document_number }}
                  </span>
                  <span class="meta-item">
                    <i class="pi pi-calendar"></i>
                    {{ calculateAge(searchResult.patient.birth_date) }} años
                  </span>
                  <span class="meta-item">
                    <i class="pi pi-venus-mars"></i>
                    {{ searchResult.patient.gender }}
                  </span>
                </div>
              </div>
            </div>
            <div class="record-actions">
              <Button
                label="Ver Historia Completa"
                icon="pi pi-folder-open"
                @click="viewFullRecord"
                severity="success"
                size="large"
              />
            </div>
          </div>

          <Divider />

          <div class="record-summary">
            <div class="summary-item">
              <span class="summary-label">N° Historia Clínica</span>
              <span class="summary-value">{{ searchResult.record_number }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total de Consultas</span>
              <span class="summary-value">{{ searchResult.consultations?.length || 0 }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Última Consulta</span>
              <span class="summary-value">
                {{ searchResult.consultations?.length > 0
                  ? formatDate(searchResult.consultations[0].consultation_date)
                  : 'Sin consultas'
                }}
              </span>
            </div>
          </div>

          <div v-if="searchResult.consultations && searchResult.consultations.length > 0" class="recent-consultations">
            <h3 class="section-title">
              <i class="pi pi-file-edit"></i>
              Consultas Recientes
            </h3>
            <div class="consultations-grid">
              <Card
                v-for="consultation in recentConsultations"
                :key="consultation.id"
                class="consultation-card"
              >
                <template #content>
                  <div class="consultation-date">
                    <i class="pi pi-calendar"></i>
                    {{ formatDate(consultation.consultation_date) }}
                  </div>
                  <div class="consultation-doctor">
                    <i class="pi pi-user-md"></i>
                    {{ consultation.doctor.full_name }}
                  </div>
                  <div class="consultation-complaint">
                    <strong>Motivo:</strong> {{ consultation.chief_complaint || 'No especificado' }}
                  </div>
                  <div v-if="consultation.diagnoses.length > 0" class="consultation-diagnoses">
                    <Tag
                      v-for="diagnosis in consultation.diagnoses.slice(0, 2)"
                      :key="diagnosis.id"
                      :value="diagnosis.cie10_code"
                      severity="info"
                      class="diagnosis-tag"
                    />
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div v-if="!searchResult && !searching" class="empty-state">
      <i class="pi pi-search empty-icon"></i>
      <p class="empty-text">Ingrese el DNI de un paciente para buscar su historia clínica</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import { MedicalRecordService } from '@/services/medicalRecord.service'
  import type { MedicalRecord, MedicalRecordConsultation } from '@/types/medicalRecord.types'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Tag from 'primevue/tag'
  import Divider from 'primevue/divider'

  const router = useRouter()
  const toast = useToast()

  const searchDNI = ref('')
  const searching = ref(false)
  const searchError = ref('')
  const searchResult = ref<MedicalRecord | null>(null)

  const recentConsultations = computed(() => {
    if (!searchResult.value?.consultations) return []
    return searchResult.value.consultations
      .sort((a: MedicalRecordConsultation, b: MedicalRecordConsultation) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())
      .slice(0, 3)
  })

  const searchMedicalRecord = async () => {
    searchError.value = ''

    if (!searchDNI.value.trim()) {
      searchError.value = 'Por favor ingrese un DNI'
      return
    }

    if (searchDNI.value.length < 8) {
      searchError.value = 'El DNI debe tener al menos 8 dígitos'
      return
    }

    searching.value = true
    try {
      const response = await MedicalRecordService.getMedicalRecordByDocument(searchDNI.value.trim())
      searchResult.value = response.data

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Historia clínica encontrada',
        life: 3000
      })
    } catch (error: any) {
      searchError.value = error.message || 'No se encontró la historia clínica'
      searchResult.value = null

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo cargar la historia clínica',
        life: 3000
      })
    } finally {
      searching.value = false
    }
  }

  const viewFullRecord = () => {
    if (searchResult.value) {
      router.push(`/medical-records/patient/${searchResult.value.patient.document_number}`)
    }
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
</script>

<style scoped>
  .medical-records-list-view {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .title-section {
    flex: 1;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .page-subtitle {
    color: #64748b;
    margin: 0;
    font-size: 1rem;
  }

  .search-card {
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .search-section {
    padding: 1rem;
  }

  .search-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .search-form {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .search-field {
    flex: 1;
  }

  .search-input {
    width: 100%;
  }

  .error-text {
    color: #ef4444;
    font-size: 0.875rem;
    display: block;
    margin-top: 0.5rem;
  }

  .result-section {
    margin-top: 2rem;
  }

  .result-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .patient-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .patient-info-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
  }

  .patient-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
  }

  .patient-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .patient-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .patient-meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.95rem;
    color: #64748b;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .record-actions {
    display: flex;
    gap: 0.5rem;
  }

  .record-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 8px;
    margin-top: 1.5rem;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 600;
  }

  .summary-value {
    font-size: 1.25rem;
    color: #1e293b;
    font-weight: 700;
  }

  .recent-consultations {
    margin-top: 2rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .consultations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .consultation-card {
    border-left: 4px solid #059669;
  }

  .consultation-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #059669;
    margin-bottom: 0.5rem;
  }

  .consultation-doctor {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #475569;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .consultation-complaint {
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .consultation-diagnoses {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .diagnosis-tag {
    font-size: 0.75rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #94a3b8;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.125rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .medical-records-list-view {
      padding: 1rem;
    }

    .patient-header {
      flex-direction: column;
      align-items: stretch;
    }

    .patient-info-section {
      flex-direction: column;
      text-align: center;
    }

    .patient-meta {
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-form {
      flex-direction: column;
    }

    .consultations-grid {
      grid-template-columns: 1fr;
    }

    .record-summary {
      grid-template-columns: 1fr;
    }
  }
</style>

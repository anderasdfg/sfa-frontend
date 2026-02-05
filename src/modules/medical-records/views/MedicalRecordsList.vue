<template>
  <div class="medical-records-list-view">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-folder-open"></i>
            Historiales Médicos
          </h1>
          <p class="page-subtitle">Accede a los historiales médicos de tus pacientes</p>
        </div>
      </div>
    </div>

    <Card class="search-card">
      <template #content>
        <div class="search-section">
          <h3 class="search-title">Buscar Historia Clínica por DNI</h3>
          <div class="search-controls">
            <IconField iconPosition="left" class="search-field">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="dniSearch"
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
              :disabled="!dniSearch.trim()"
            />
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="medicalRecord" class="medical-record-card">
      <template #content>
        <div class="record-header">
          <div class="patient-info-section">
            <div class="patient-avatar">
              <i class="pi pi-user"></i>
            </div>
            <div class="patient-details">
              <h2 class="patient-name">{{ medicalRecord.patient.full_name }}</h2>
              <div class="patient-meta">
                <span class="meta-item">
                  <i class="pi pi-id-card"></i>
                  {{ medicalRecord.patient.document_type }}: {{ medicalRecord.patient.document_number }}
                </span>
                <span class="meta-item">
                  <i class="pi pi-venus-mars"></i>
                  {{ medicalRecord.patient.gender }}
                </span>
                <span class="meta-item">
                  <i class="pi pi-calendar"></i>
                  {{ calculateAge(medicalRecord.patient.birth_date) }} años
                </span>
              </div>
            </div>
          </div>
          <div class="record-actions">
            <Button
              label="Ver Historia Completa"
              icon="pi pi-eye"
              @click="viewFullRecord"
              severity="success"
            />
          </div>
        </div>

        <Divider />

        <div class="record-summary">
          <div class="summary-item">
            <span class="summary-label">N° Historia Clínica</span>
            <span class="summary-value">{{ medicalRecord.record_number }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total de Consultas</span>
            <span class="summary-value">{{ medicalRecord.consultations?.length || 0 }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Última Consulta</span>
            <span class="summary-value">
              {{
                medicalRecord.consultations && medicalRecord.consultations.length > 0 && getLastConsultation()
                  ? formatDate(getLastConsultation()!.consultation_date)
                  : 'Sin consultas'
              }}
            </span>
          </div>
        </div>

        <div v-if="medicalRecord.consultations && medicalRecord.consultations.length > 0" class="recent-consultations">
          <h3 class="section-title">
            <i class="pi pi-file-edit"></i>
            Últimas Consultas
          </h3>
          <div class="consultations-preview">
            <Card
              v-for="consultation in getRecentConsultations()"
              :key="consultation.id"
              class="consultation-preview-card"
            >
              <template #content>
                <div class="consultation-preview-header">
                  <div class="consultation-date">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDateTime(consultation.consultation_date) }}</span>
                  </div>
                  <Tag :value="consultation.doctor.specialty" severity="info" />
                </div>
                <div class="consultation-preview-content">
                  <div class="preview-item">
                    <strong>Motivo:</strong>
                    <span>{{ consultation.chief_complaint || 'No especificado' }}</span>
                  </div>
                  <div v-if="consultation.diagnoses && consultation.diagnoses.length > 0" class="preview-item">
                    <strong>Diagnósticos:</strong>
                    <div class="diagnoses-tags">
                      <Tag
                        v-for="diagnosis in consultation.diagnoses.slice(0, 2)"
                        :key="diagnosis.id"
                        :value="diagnosis.cie10_code"
                        severity="success"
                      />
                      <Tag
                        v-if="consultation.diagnoses.length > 2"
                        :value="`+${consultation.diagnoses.length - 2} más`"
                        severity="secondary"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </template>
    </Card>

    <div v-else-if="!searching && searchAttempted" class="empty-state-card">
      <Card>
        <template #content>
          <div class="empty-state">
            <i class="pi pi-inbox"></i>
            <p>No se encontró historia clínica para el DNI ingresado</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import { MedicalRecordService } from '@/services/medicalRecord.service'
  import type { MedicalRecord } from '@/types/medicalRecord.types'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Tag from 'primevue/tag'
  import Divider from 'primevue/divider'

  const router = useRouter()
  const toast = useToast()

  const dniSearch = ref('')
  const searching = ref(false)
  const searchAttempted = ref(false)
  const medicalRecord = ref<MedicalRecord | null>(null)

  const searchMedicalRecord = async () => {
    if (!dniSearch.value.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese un DNI para buscar',
        life: 3000
      })
      return
    }

    searching.value = true
    searchAttempted.value = true
    medicalRecord.value = null

    try {
      const response = await MedicalRecordService.getMedicalRecordByDocument(dniSearch.value.trim())
      medicalRecord.value = response.data
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Historia clínica encontrada',
        life: 3000
      })
    } catch (error: any) {
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
    if (medicalRecord.value) {
      router.push(`/medical-records/patient/${medicalRecord.value.patient.document_number}`)
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

  const getLastConsultation = () => {
    if (!medicalRecord.value?.consultations || medicalRecord.value.consultations.length === 0) {
      return null
    }
    return [...medicalRecord.value.consultations].sort((a: any, b: any) => {
      return new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
    })[0]
  }

  const getRecentConsultations = () => {
    if (!medicalRecord.value?.consultations) return []
    return [...medicalRecord.value.consultations]
      .sort((a: any, b: any) => {
        return new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
      })
      .slice(0, 3)
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
    padding: 1rem 0;
  }

  .search-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .search-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-field {
    flex: 1;
  }

  .search-input {
    width: 100%;
  }

  .medical-record-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .patient-info-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
  }

  .patient-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.75rem;
  }

  .patient-details {
    flex: 1;
  }

  .patient-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  .patient-meta {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;
  }

  .record-actions {
    display: flex;
    gap: 0.5rem;
  }

  .record-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    padding: 1.5rem 0;
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

  .consultations-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .consultation-preview-card {
    border-left: 4px solid #059669;
  }

  .consultation-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .consultation-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #059669;
  }

  .consultation-preview-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #475569;
  }

  .preview-item strong {
    color: #1e293b;
  }

  .diagnoses-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .empty-state-card {
    margin-top: 2rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #64748b;
  }

  .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 1.125rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .medical-records-list-view {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      align-items: stretch;
    }

    .search-controls {
      flex-direction: column;
    }

    .record-header {
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

    .record-summary {
      grid-template-columns: 1fr;
    }
  }
</style>

<template>
  <div class="my-patients-view">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-users"></i>
            Mis Pacientes
          </h1>
          <p class="page-subtitle">Pacientes asignados a mi atención</p>
        </div>
      </div>
    </div>

    <Card class="patients-card">
      <template #content>
        <div class="table-toolbar">
          <div class="search-section">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                placeholder="Buscar por nombre, DNI o email..."
                class="search-input"
              />
            </IconField>
          </div>
        </div>

        <DataTable
          :value="filteredPatients"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50]"
          stripedRows
          class="patients-table"
          :globalFilterFields="['first_name', 'last_name', 'document_number', 'email']"
        >
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-users"></i>
              <p>No se encontraron pacientes</p>
            </div>
          </template>

          <Column field="document_number" header="DNI" sortable>
            <template #body="{ data }">
              <span class="dni-badge">{{ data.document_number }}</span>
            </template>
          </Column>

          <Column header="Paciente" sortable>
            <template #body="{ data }">
              <div class="patient-info">
                <div class="patient-avatar">
                  <i class="pi pi-user"></i>
                </div>
                <div class="patient-details">
                  <span class="patient-name">{{ data.first_name }} {{ data.last_name }}</span>
                  <span class="patient-email">{{ data.email }}</span>
                </div>
              </div>
            </template>
          </Column>

          <Column field="phone" header="Teléfono" sortable>
            <template #body="{ data }">
              <span class="phone-number">
                <i class="pi pi-phone"></i>
                {{ data.phone }}
              </span>
            </template>
          </Column>

          <Column field="gender" header="Género" sortable>
            <template #body="{ data }">
              <Tag :value="getGenderLabel(data.gender)" :severity="getGenderSeverity(data.gender)" />
            </template>
          </Column>

          <Column field="birth_date" header="Edad" sortable>
            <template #body="{ data }">
              {{ data.birth_date ? calculateAge(data.birth_date) + ' años' : 'N/A' }}
            </template>
          </Column>

          <Column header="Acciones" :exportable="false">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-folder-open"
                  severity="success"
                  text
                  rounded
                  @click="viewMedicalRecord(data)"
                  v-tooltip.top="'Ver Historia Clínica'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { PatientService } from '@/services/patient.service'
  import type { Patient } from '@/types/medical.types'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Tag from 'primevue/tag'

  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()

  const loading = ref(false)
  const patients = ref<Patient[]>([])
  const searchQuery = ref('')

  const filteredPatients = computed(() => {
    let result = patients.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        p =>
          p.first_name?.toLowerCase().includes(query) ||
          p.last_name?.toLowerCase().includes(query) ||
          p.document_number?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query)
      )
    }

    return result
  })

  const loadMyPatients = async () => {
    loading.value = true
    try {
      const doctorId = authStore.user?.id
      if (doctorId) {
        const data = await PatientService.getPatients(doctorId)
        patients.value = Array.isArray(data) ? data : (data as any).data || []
      }
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudieron cargar los pacientes',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  const viewMedicalRecord = (patient: Patient) => {
    router.push(`/medical-records/patient/${patient.document_number}`)
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

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      masculino: 'Masculino',
      femenino: 'Femenino',
      otro: 'Otro',
      M: 'Masculino',
      F: 'Femenino',
      O: 'Otro'
    }
    return labels[gender] || gender
  }

  const getGenderSeverity = (gender: string) => {
    const severities: Record<string, string> = {
      masculino: 'info',
      femenino: 'success',
      otro: 'warning',
      M: 'info',
      F: 'success',
      O: 'warning'
    }
    return severities[gender] || 'secondary'
  }

  onMounted(() => {
    loadMyPatients()
  })
</script>

<style scoped>
  .my-patients-view {
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

  .patients-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .search-section {
    flex: 1;
    min-width: 300px;
  }

  .search-input {
    width: 100%;
  }

  .patients-table {
    font-size: 0.9rem;
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

  .dni-badge {
    background: #eff6ff;
    color: #2563eb;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .patient-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .patient-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
  }

  .patient-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .patient-name {
    font-weight: 600;
    color: #1e293b;
  }

  .patient-email {
    font-size: 0.8125rem;
    color: #64748b;
  }

  .phone-number {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
  }

  .action-buttons {
    display: flex;
    gap: 0.25rem;
  }

  @media (max-width: 768px) {
    .my-patients-view {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      align-items: stretch;
    }

    .table-toolbar {
      flex-direction: column;
    }

    .search-section {
      width: 100%;
    }
  }
</style>

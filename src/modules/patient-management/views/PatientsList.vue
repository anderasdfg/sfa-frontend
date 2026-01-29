<template>
  <div class="patients-list-view">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-users"></i>
            Gestión de Pacientes
          </h1>
          <p class="page-subtitle">Administra la información de todos los pacientes</p>
        </div>
        <Button
          label="Nuevo Paciente"
          icon="pi pi-plus"
          @click="openCreateDialog"
          severity="success"
        />
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
          <div class="filter-section">
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Estado"
              class="status-filter"
            />
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

          <Column field="birth_date" header="Fecha de Nacimiento" sortable>
            <template #body="{ data }">
              {{ data.birth_date ? formatDate(data.birth_date) : 'N/A' }}
            </template>
          </Column>

          <Column field="status" header="Estado" sortable>
            <template #body="{ data }">
              <Tag
                :value="data.status === 'activo' ? 'Activo' : 'Inactivo'"
                :severity="data.status === 'activo' ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column header="Acciones" :exportable="false">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  text
                  rounded
                  @click="openEditDialog(data)"
                  v-tooltip.top="'Editar'"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  @click="confirmDelete(data)"
                  v-tooltip.top="'Eliminar'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="dialogMode === 'create' ? 'Nuevo Paciente' : 'Editar Paciente'"
      modal
      class="patient-dialog"
      :style="{ width: '600px' }"
    >
      <div class="dialog-content">
        <div class="form-grid">
          <div class="form-field">
            <label>DNI *</label>
            <InputText
              v-model="patientForm.document_number"
              placeholder="Ingrese el DNI"
              :disabled="dialogMode === 'edit'"
            />
            <small v-if="formErrors.document_number" class="error-text">
              {{ formErrors.document_number }}
            </small>
          </div>

          <div class="form-field">
            <label>Nombres *</label>
            <InputText v-model="patientForm.first_name" placeholder="Nombres" />
            <small v-if="formErrors.first_name" class="error-text">
              {{ formErrors.first_name }}
            </small>
          </div>

          <div class="form-field">
            <label>Apellidos *</label>
            <InputText v-model="patientForm.last_name" placeholder="Apellidos" />
            <small v-if="formErrors.last_name" class="error-text">
              {{ formErrors.last_name }}
            </small>
          </div>

          <div class="form-field">
            <label>Email *</label>
            <InputText v-model="patientForm.email" type="email" placeholder="correo@ejemplo.com" />
            <small v-if="formErrors.email" class="error-text">{{ formErrors.email }}</small>
          </div>

          <div class="form-field">
            <label>Teléfono *</label>
            <InputText v-model="patientForm.phone" placeholder="999999999" />
            <small v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</small>
          </div>

          <div class="form-field">
            <label>Género</label>
            <Dropdown
              v-model="patientForm.gender"
              :options="genderOptions"
              option-label="label"
              option-value="value"
              placeholder="Seleccionar género"
            />
          </div>

          <div class="form-field">
            <label>Fecha de Nacimiento</label>
            <Calendar
              v-model="patientForm.date_of_birth"
              date-format="dd/mm/yy"
              show-icon
              placeholder="Seleccionar fecha"
            />
          </div>

          <div class="form-field">
            <label>Estado</label>
            <Dropdown
              v-model="patientForm.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Seleccionar estado"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="closeDialog" outlined />
        <Button
          :label="dialogMode === 'create' ? 'Crear' : 'Actualizar'"
          @click="savePatient"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Confirmar Eliminación"
      modal
      :style="{ width: '450px' }"
    >
      <div class="delete-confirmation">
        <i class="pi pi-exclamation-triangle"></i>
        <p>
          ¿Está seguro de que desea eliminar al paciente
          <strong>{{ patientToDelete?.first_name }} {{ patientToDelete?.last_name }}</strong>?
        </p>
        <p class="warning-text">Esta acción no se puede deshacer.</p>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="showDeleteDialog = false" outlined />
        <Button label="Eliminar" severity="danger" @click="deletePatient" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useToast } from 'primevue/usetoast'
  import { PatientService } from '@/services/patient.service'
  import type { Patient } from '@/types/medical.types'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Dropdown from 'primevue/dropdown'
  import Dialog from 'primevue/dialog'
  import Calendar from 'primevue/calendar'
  import Tag from 'primevue/tag'

  const toast = useToast()

  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const patients = ref<Patient[]>([])
  const searchQuery = ref('')
  const statusFilter = ref('all')
  const showDialog = ref(false)
  const showDeleteDialog = ref(false)
  const dialogMode = ref<'create' | 'edit'>('create')
  const patientToDelete = ref<Patient | null>(null)

  interface PatientFormData {
    id?: number
    document_number: string
    first_name: string
    last_name: string
    email: string
    phone: string
    gender: string
    date_of_birth: Date | null
    status: string
  }

  const patientForm = ref<PatientFormData>({
    document_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'masculino',
    date_of_birth: null,
    status: 'activo'
  })

  const formErrors = ref<Record<string, string>>({})

  const genderOptions = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Femenino', value: 'femenino' },
    { label: 'Otro', value: 'otro' }
  ]

  const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
  ]

  const filteredPatients = computed(() => {
    let result = patients.value

    if (statusFilter.value !== 'all') {
      result = result.filter(p => p.status === statusFilter.value)
    }

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

  const loadPatients = async () => {
    loading.value = true
    try {
      const data = await PatientService.getPatients()
      patients.value = Array.isArray(data) ? data : (data as any).data || []
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

  const openCreateDialog = () => {
    dialogMode.value = 'create'
    resetForm()
    showDialog.value = true
  }

  const openEditDialog = (patient: Patient) => {
    dialogMode.value = 'edit'
    const birthDate = patient.birth_date || patient.date_of_birth
    patientForm.value = {
      id: patient.id,
      document_number: patient.document_number,
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender || 'masculino',
      date_of_birth: birthDate ? new Date(birthDate) : null,
      status: patient.status || 'activo'
    }
    formErrors.value = {}
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    resetForm()
  }

  const resetForm = () => {
    patientForm.value = {
      document_number: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'masculino',
      date_of_birth: null,
      status: 'activo'
    }
    formErrors.value = {}
  }

  const validateForm = (): boolean => {
    formErrors.value = {}
    let isValid = true

    if (!patientForm.value.document_number) {
      formErrors.value.document_number = 'El DNI es requerido'
      isValid = false
    } else if (patientForm.value.document_number.length < 8) {
      formErrors.value.document_number = 'El DNI debe tener al menos 8 dígitos'
      isValid = false
    }

    if (!patientForm.value.first_name) {
      formErrors.value.first_name = 'Los nombres son requeridos'
      isValid = false
    }

    if (!patientForm.value.last_name) {
      formErrors.value.last_name = 'Los apellidos son requeridos'
      isValid = false
    }

    if (!patientForm.value.email) {
      formErrors.value.email = 'El email es requerido'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientForm.value.email)) {
      formErrors.value.email = 'El email no es válido'
      isValid = false
    }

    if (!patientForm.value.phone) {
      formErrors.value.phone = 'El teléfono es requerido'
      isValid = false
    }

    return isValid
  }

  const savePatient = async () => {
    if (!validateForm()) return

    saving.value = true

    try {
      const patientData: any = {
        document_number: patientForm.value.document_number,
        first_name: patientForm.value.first_name,
        last_name: patientForm.value.last_name,
        email: patientForm.value.email,
        phone: patientForm.value.phone,
        gender: patientForm.value.gender,
        status: patientForm.value.status
      }

      if (patientForm.value.date_of_birth) {
        patientData.birth_date = patientForm.value.date_of_birth.toISOString().split('T')[0]
      }

      if (dialogMode.value === 'create') {
        await PatientService.createPatient(patientData)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Paciente creado exitosamente',
          life: 3000
        })
      } else {
        await PatientService.updatePatient(patientForm.value.id!, patientData)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Paciente actualizado exitosamente',
          life: 3000
        })
      }

      closeDialog()
      await loadPatients()
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar el paciente',
        life: 3000
      })
    } finally {
      saving.value = false
    }
  }

  const confirmDelete = (patient: Patient) => {
    patientToDelete.value = patient
    showDeleteDialog.value = true
  }

  const deletePatient = async () => {
    if (!patientToDelete.value) return

    deleting.value = true

    try {
      await PatientService.deletePatient(patientToDelete.value.id)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Paciente eliminado exitosamente',
        life: 3000
      })
      showDeleteDialog.value = false
      await loadPatients()
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo eliminar el paciente',
        life: 3000
      })
    } finally {
      deleting.value = false
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  onMounted(() => {
    loadPatients()
  })
</script>

<style scoped>
  .patients-list-view {
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

  .filter-section {
    display: flex;
    gap: 0.5rem;
  }

  .status-filter {
    min-width: 150px;
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

  .patient-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
  }

  .dialog-content {
    padding: 1rem 0;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-field label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  .error-text {
    color: #ef4444;
    font-size: 0.8125rem;
  }

  .delete-confirmation {
    text-align: center;
    padding: 1rem;
  }

  .delete-confirmation i {
    font-size: 3rem;
    color: #f59e0b;
    margin-bottom: 1rem;
  }

  .delete-confirmation p {
    margin: 0.5rem 0;
    color: #374151;
  }

  .warning-text {
    color: #ef4444;
    font-weight: 600;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .patients-list-view {
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

    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

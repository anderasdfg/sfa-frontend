<template>
  <div class="diagnosis-tab">
    <div class="diagnosis-layout">
      <div class="diagnosis-main">
        <!-- Diagnosis Form -->
        <Card class="diagnosis-form-card">
          <template #content>
            <form @submit.prevent="handleAddDiagnosis" class="diagnosis-form">
              <!-- Diagnosis Type Toggle -->
              <div class="form-group">
                <label class="form-label">Tipo de Diagnóstico</label>
                <SelectButton
                  v-model="formData.diagnosis_type"
                  :options="diagnosisTypes"
                  optionLabel="label"
                  optionValue="value"
                  class="diagnosis-type-selector"
                />
              </div>

              <!-- CIE-10 Code Search -->
              <div class="form-group">
                <label class="form-label" for="cie10-search">
                  Código CIE-10 *
                  <i
                    class="pi pi-info-circle ml-2 text-gray-400"
                    v-tooltip="'Busca por código o descripción'"
                  ></i>
                </label>
                <AutoComplete
                  id="cie10-search"
                  v-model="selectedCIE10"
                  :suggestions="cie10Suggestions"
                  optionLabel="description"
                  @complete="searchCIE10"
                  @item-select="onCIE10Select"
                  placeholder="Buscar código CIE-10..."
                  dropdown
                  forceSelection
                  class="w-full"
                >
                  <template #option="slotProps">
                    <div class="cie10-option">
                      <span class="cie10-code">{{ slotProps.option.code }}</span>
                      <span class="cie10-description">{{ slotProps.option.description }}</span>
                    </div>
                  </template>
                </AutoComplete>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="form-label" for="diagnosis-description">Descripción *</label>
                <Textarea
                  id="diagnosis-description"
                  v-model="formData.description"
                  rows="3"
                  placeholder="Describe el diagnóstico..."
                  class="w-full"
                  :class="{ 'p-invalid': formErrors.description }"
                />
                <small v-if="formErrors.description" class="p-error">
                  {{ formErrors.description }}
                </small>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <Button
                  type="button"
                  label="Cancelar"
                  severity="secondary"
                  outlined
                  @click="resetForm"
                  :disabled="savingDiagnosis"
                />
                <Button
                  type="submit"
                  :label="editingDiagnosis ? 'Actualizar' : 'Agregar Diagnóstico'"
                  icon="pi pi-plus"
                  :loading="savingDiagnosis"
                />
              </div>
            </form>
          </template>
        </Card>

        <!-- Current Session Diagnosis List -->
        <div class="current-diagnosis-section">
          <h4 class="list-title">
            Diagnósticos de esta consulta
            <Tag :value="currentSessionDiagnosis.length.toString()" severity="info" />
          </h4>

          <div v-if="loading" class="loading-state">
            <ProgressSpinner style="width: 40px; height: 40px" />
            <p class="text-gray-500 mt-2">Cargando diagnósticos...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <p class="text-red-600">{{ error }}</p>
            <Button label="Reintentar" size="small" @click="loadDiagnosis" />
          </div>

          <div v-else-if="currentSessionDiagnosis.length === 0" class="empty-state">
            <i class="pi pi-file-plus text-4xl text-gray-300"></i>
            <p class="text-gray-500 mt-2">No hay diagnósticos registrados en esta consulta</p>
          </div>

          <div v-else class="diagnosis-list">
            <div
              v-for="diagnosis in currentSessionDiagnosis"
              :key="diagnosis.id"
              class="diagnosis-item"
            >
              <div class="diagnosis-item-header">
                <Tag
                  :value="diagnosis.diagnosis_type === 'presuntivo' ? 'Presuntivo' : 'Definitivo'"
                  :severity="diagnosis.diagnosis_type === 'presuntivo' ? 'warning' : 'success'"
                />
                <div class="diagnosis-item-actions">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="editDiagnosis(diagnosis)"
                    v-tooltip="'Editar'"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    @click="confirmDelete(diagnosis)"
                    v-tooltip="'Eliminar'"
                  />
                </div>
              </div>
              <div class="diagnosis-item-content">
                <div class="diagnosis-code">{{ diagnosis.cie10_code }}</div>
                <div class="diagnosis-description">{{ diagnosis.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Previous Diagnosis History -->
      <div class="diagnosis-sidebar">
        <Card class="history-card">
          <template #header>
            <div class="history-header">
              <div class="history-title">
                <i class="pi pi-history"></i>
                <span>Historial de Diagnósticos</span>
              </div>
              <Button
                icon="pi pi-refresh"
                text
                rounded
                size="small"
                @click="loadPreviousDiagnosis"
                v-tooltip="'Actualizar'"
              />
            </div>
          </template>
          <template #content>
            <div v-if="loadingHistory" class="loading-state-small">
              <ProgressSpinner style="width: 30px; height: 30px" />
            </div>

            <div v-else-if="previousDiagnosis.length === 0" class="empty-state-small">
              <i class="pi pi-inbox text-2xl text-gray-300"></i>
              <p class="text-gray-500 text-sm mt-2">Sin diagnósticos previos</p>
            </div>

            <div v-else class="history-list">
              <div v-for="diagnosis in previousDiagnosis" :key="diagnosis.id" class="history-item">
                <div class="history-item-date">
                  <i class="pi pi-calendar text-xs"></i>
                  <span>Consulta anterior</span>
                </div>
                <Tag
                  :value="diagnosis.diagnosis_type === 'presuntivo' ? 'Presuntivo' : 'Definitivo'"
                  :severity="diagnosis.diagnosis_type === 'presuntivo' ? 'warning' : 'success'"
                  class="mb-2"
                />
                <div class="history-item-code">{{ diagnosis.cie10_code }}</div>
                <div class="history-item-description">{{ diagnosis.description }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
    <div class="save-section">
      <Button label="Siguiente" icon="pi pi-save" @click="emit('next-tab', 'indications')" />
    </div>
    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Confirmar Eliminación"
      :modal="true"
      :closable="false"
      :style="{ width: '400px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-4"></i>
        <p>¿Estás seguro de que deseas eliminar este diagnóstico?</p>
        <p class="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="showDeleteDialog = false"
          :disabled="deletingDiagnosis"
        />
        <Button
          label="Eliminar"
          severity="danger"
          @click="handleDelete"
          :loading="deletingDiagnosis"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import SelectButton from 'primevue/selectbutton'
  import AutoComplete from 'primevue/autocomplete'
  import Textarea from 'primevue/textarea'
  import Tag from 'primevue/tag'
  import Dialog from 'primevue/dialog'
  import ProgressSpinner from 'primevue/progressspinner'
  import { useDiagnosis } from '../composables/useDiagnosis'
  import type { Diagnosis } from '@/types/diagnosis.types'

  const emit = defineEmits(['next-tab'])

  interface Props {
    consultationId: number
    patientId?: number
  }

  const props = defineProps<Props>()

  // Composable
  const {
    diagnosis,
    loading,
    error,
    savingDiagnosis,
    deletingDiagnosis,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    fetchDiagnosisByConsultation
  } = useDiagnosis()

  // Form State
  const formData = ref({
    diagnosis_type: 'presuntivo' as 'presuntivo' | 'definitivo',
    cie10_code: '',
    description: ''
  })

  const formErrors = ref({
    description: ''
  })

  const diagnosisTypes = [
    { label: 'Presuntivo', value: 'presuntivo' },
    { label: 'Definitivo', value: 'definitivo' }
  ]

  // CIE-10 Search
  const cie10Suggestions = ref<Array<{ code: string; description: string }>>([])

  // Mock CIE-10 data - En producción esto vendría de un servicio
  const mockCIE10Data = [
    { id: 1, code: 'J00', description: 'Rinofaringitis aguda [resfriado común]' },
    { id: 2, code: 'J06.9', description: 'Infección aguda de las vías respiratorias superiores' },
    { id: 3, code: 'A09', description: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
    { id: 4, code: 'I10', description: 'Hipertensión esencial (primaria)' },
    { id: 5, code: 'E11', description: 'Diabetes mellitus no insulinodependiente' },
    { id: 6, code: 'K29.7', description: 'Gastritis, no especificada' }
  ]

  const searchCIE10 = (event: { query: string }) => {
    const query = event.query.toLowerCase()
    cie10Suggestions.value = mockCIE10Data.filter(
      item =>
        item.code.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    )
  }

  const selectedCIE10 = ref<{ code: string; description: string } | null>(null)

  const onCIE10Select = (event: { value: { code: string; description: string } }) => {
    formData.value.cie10_code = event.value.code
    formData.value.description = event.value.description
  }

  // Editing State
  const editingDiagnosis = ref<Diagnosis | null>(null)
  const diagnosisToDelete = ref<Diagnosis | null>(null)
  const showDeleteDialog = ref(false)

  // History State
  const loadingHistory = ref(false)
  const previousDiagnosis = ref<Diagnosis[]>([])

  // Computed
  const currentSessionDiagnosis = computed(() => {
    return diagnosis.value.filter(d => d.consultation_id === props.consultationId)
  })

  // Methods
  const validateForm = (): boolean => {
    formErrors.value.description = ''

    if (!formData.value.description.trim()) {
      formErrors.value.description = 'La descripción es requerida'
      return false
    }

    if (!formData.value.cie10_code) {
      return false
    }

    return true
  }

  const handleAddDiagnosis = async () => {
    if (!validateForm()) return

    const diagnosisData = {
      consultation_id: props.consultationId,
      cie10_code: formData.value.cie10_code,
      description: formData.value.description,
      diagnosis_type: formData.value.diagnosis_type
    }

    if (editingDiagnosis.value) {
      await updateDiagnosis(editingDiagnosis.value.id, diagnosisData)
    } else {
      await createDiagnosis(diagnosisData)
    }

    resetForm()
  }

  const editDiagnosis = (diagnosis: Diagnosis) => {
    editingDiagnosis.value = diagnosis
    formData.value = {
      diagnosis_type: diagnosis.diagnosis_type,
      cie10_code: diagnosis.cie10_code,
      description: diagnosis.description
    }
  }

  const confirmDelete = (diagnosis: Diagnosis) => {
    diagnosisToDelete.value = diagnosis
    showDeleteDialog.value = true
  }

  const handleDelete = async () => {
    if (!diagnosisToDelete.value) return

    const success = await deleteDiagnosis(diagnosisToDelete.value.id)
    if (success) {
      showDeleteDialog.value = false
      diagnosisToDelete.value = null
    }
  }

  const resetForm = () => {
    formData.value = {
      diagnosis_type: 'presuntivo',
      cie10_code: '',
      description: ''
    }
    formErrors.value = {
      description: ''
    }
    editingDiagnosis.value = null
  }

  const loadDiagnosis = async () => {
    await fetchDiagnosisByConsultation(props.consultationId)
  }

  const loadPreviousDiagnosis = async () => {
    loadingHistory.value = true
    // TODO: Implementar carga de diagnósticos previos del paciente
    // Por ahora mock data
    setTimeout(() => {
      previousDiagnosis.value = []
      loadingHistory.value = false
    }, 1000)
  }

  onMounted(() => {
    loadDiagnosis()
    loadPreviousDiagnosis()
  })
</script>

<style scoped>
  .save-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
  }

  .diagnosis-tab {
    height: 100%;
  }

  .diagnosis-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    height: 100%;
  }

  .diagnosis-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .section-subtitle {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0.25rem 0 0 0;
  }

  /* Form Styles */
  .diagnosis-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
  }

  .diagnosis-type-selector {
    width: 100%;
  }

  .cie10-option {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }

  .cie10-code {
    font-weight: 700;
    color: var(--color-sf-green-normal);
    font-size: 0.875rem;
  }

  .cie10-description {
    color: #6b7280;
    font-size: 0.8125rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Current Diagnosis List */
  .current-diagnosis-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .diagnosis-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .diagnosis-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.2s;
  }

  .diagnosis-item:hover {
    border-color: var(--color-sf-green-light);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .diagnosis-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .diagnosis-item-actions {
    display: flex;
    gap: 0.25rem;
  }

  .diagnosis-item-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .diagnosis-code {
    font-weight: 700;
    color: var(--color-sf-green-normal);
    font-size: 0.875rem;
  }

  .diagnosis-description {
    color: #374151;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  /* Sidebar Styles */
  .diagnosis-sidebar {
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .history-card {
    height: 100%;
    max-height: calc(100vh - 250px);
    display: flex;
    flex-direction: column;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .history-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.9375rem;
  }

  .history-title i {
    color: var(--color-sf-green-normal);
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    max-height: 600px;
  }

  .history-item {
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
    border-left: 3px solid var(--color-sf-green-light);
  }

  .history-item-date {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #6b7280;
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .history-item-code {
    font-weight: 600;
    color: var(--color-sf-green-normal);
    font-size: 0.8125rem;
    margin-bottom: 0.25rem;
  }

  .history-item-description {
    color: #4b5563;
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  /* Empty/Loading States */
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .loading-state-small,
  .empty-state-small {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    text-align: center;
  }

  /* Dialog */
  .confirmation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .diagnosis-layout {
      grid-template-columns: 1fr;
    }

    .diagnosis-sidebar {
      position: relative;
      top: 0;
    }

    .history-card {
      max-height: 400px;
    }
  }

  @media (max-width: 640px) {
    .diagnosis-layout {
      gap: 1rem;
    }

    .diagnosis-item {
      padding: 0.75rem;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .form-actions button {
      width: 100%;
    }
  }
</style>

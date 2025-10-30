<template>
  <div class="auxiliary-tests-tab">
    <div class="auxiliary-tests-layout">
      <div class="tests-main">
        <!-- Test Form -->
        <Card class="test-form-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3 class="section-title">Exámenes Auxiliares</h3>
                <p class="section-subtitle">
                  Agrega los exámenes auxiliares requeridos para esta consulta
                </p>
              </div>
            </div>
          </template>
          <template #content>
            <form @submit.prevent="handleAddTest" class="test-form">
              <!-- Test Type -->
              <div class="form-group">
                <label class="form-label" for="test-type">
                  Tipo de Examen *
                  <i 
                    class="pi pi-info-circle ml-2 text-gray-400"
                    v-tooltip="'Busca por código CPT o descripción del procedimiento'"
                  ></i>
                </label>
                <AutoComplete
                  id="test-type"
                  v-model="selectedTest"
                  :suggestions="testSuggestions"
                  optionLabel="description"
                  @complete="searchTests"
                  @item-select="onTestSelect"
                  placeholder="Buscar examen por nombre o código CPT..."
                  dropdown
                  forceSelection
                  class="w-full"
                >
                  <template #option="slotProps">
                    <div class="test-option">
                      <span class="test-code">{{ slotProps.option.code }}</span>
                      <span class="test-description">{{ slotProps.option.description }}</span>
                    </div>
                  </template>
                </AutoComplete>
                <small v-if="formErrors.test_type" class="p-error">
                  {{ formErrors.test_type }}
                </small>
              </div>

              <!-- Test Description -->
              <div class="form-group">
                <label class="form-label" for="test-description">Descripción *</label>
                <Textarea
                  id="test-description"
                  v-model="formData.description"
                  rows="3"
                  placeholder="Describe los detalles del examen auxiliar..."
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
                  :disabled="savingTest"
                />
                <Button
                  type="submit"
                  :label="editingTest ? 'Actualizar' : 'Agregar Examen'"
                  icon="pi pi-plus"
                  :loading="savingTest"
                />
              </div>
            </form>
          </template>
        </Card>

        <!-- Current Tests List -->
        <div class="current-tests-section">
          <h4 class="list-title">
            Exámenes solicitados en esta consulta
            <Tag :value="diagnosisTests.length.toString()" severity="info" />
          </h4>

          <div v-if="loading" class="loading-state">
            <ProgressSpinner style="width: 40px; height: 40px" />
            <p class="text-gray-500 mt-2">Cargando exámenes...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <p class="text-red-600">{{ error }}</p>
            <Button label="Reintentar" size="small" @click="fetchDiagnosisTestsByConsultation(props.consultationId, true)" />
          </div>

          <div v-else-if="diagnosisTests.length === 0" class="empty-state">
            <i class="pi pi-file-excel text-4xl text-gray-300"></i>
            <p class="text-gray-500 mt-2">No hay exámenes diagnósticos solicitados en esta consulta</p>
          </div>

          <div v-else class="tests-list">
            <div v-for="test in diagnosisTests" :key="test.id" class="test-item">
              <div class="test-item-header">
                <Tag value="Pendiente" severity="warning" />
                <div class="test-item-actions">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="editTest(test)"
                    v-tooltip="'Editar'"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    @click="confirmDelete(test)"
                    v-tooltip="'Eliminar'"
                  />
                </div>
              </div>
              <div class="test-item-content">
                <div class="test-type">{{ test.test_type }}</div>
                <div class="test-description">{{ test.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Common Tests Templates -->
      <div class="tests-sidebar">
        <Card class="templates-card">
          <template #header>
            <div class="templates-header">
              <div class="templates-title">
                <i class="pi pi-copy"></i>
                <span>Plantillas Comunes</span>
              </div>
              <p class="templates-subtitle">
                Selecciona exámenes comunes para agregar rápidamente
              </p>
            </div>
          </template>
          <template #content>
            <div class="templates-list">
              <div class="template-group">
                <div class="template-group-header">
                  <h4 class="template-group-title">Laboratorio</h4>
                </div>
                <div class="template-items">
                  <div
                    class="template-item"
                    v-for="template in laboratoryTemplates"
                    :key="template.id"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-icon">
                      <i class="pi pi-chart-bar"></i>
                    </div>
                    <div class="template-content">
                      <div class="template-name">{{ template.test_type }}</div>
                      <div class="template-description">{{ template.description }}</div>
                    </div>
                    <Button
                      icon="pi pi-plus"
                      text
                      rounded
                      size="small"
                      v-tooltip="'Agregar'"
                      class="template-add-btn"
                    />
                  </div>
                </div>
              </div>

              <div class="template-group">
                <div class="template-group-header">
                  <h4 class="template-group-title">Imágenes</h4>
                </div>
                <div class="template-items">
                  <div
                    class="template-item"
                    v-for="template in imagingTemplates"
                    :key="template.id"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-icon">
                      <i class="pi pi-image"></i>
                    </div>
                    <div class="template-content">
                      <div class="template-name">{{ template.test_type }}</div>
                      <div class="template-description">{{ template.description }}</div>
                    </div>
                    <Button
                      icon="pi pi-plus"
                      text
                      rounded
                      size="small"
                      v-tooltip="'Agregar'"
                      class="template-add-btn"
                    />
                  </div>
                </div>
              </div>

              <div class="template-group">
                <div class="template-group-header">
                  <h4 class="template-group-title">Otros</h4>
                </div>
                <div class="template-items">
                  <div
                    class="template-item"
                    v-for="template in otherTemplates"
                    :key="template.id"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-icon">
                      <i class="pi pi-file-medical"></i>
                    </div>
                    <div class="template-content">
                      <div class="template-name">{{ template.test_type }}</div>
                      <div class="template-description">{{ template.description }}</div>
                    </div>
                    <Button
                      icon="pi pi-plus"
                      text
                      rounded
                      size="small"
                      v-tooltip="'Agregar'"
                      class="template-add-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="save-section">
      <Button label="Siguiente" icon="pi pi-save" @click="handleNextTab" />
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
        <p>¿Estás seguro de que deseas eliminar este examen diagnóstico?</p>
        <p class="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="showDeleteDialog = false"
          :disabled="deletingTest"
        />
        <Button
          label="Eliminar"
          severity="danger"
          @click="handleDelete"
          :loading="deletingTest"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import AutoComplete from 'primevue/autocomplete'
  import Textarea from 'primevue/textarea'
  import Tag from 'primevue/tag'
  import Dialog from 'primevue/dialog'
  import ProgressSpinner from 'primevue/progressspinner'
  import { useDiagnosisTests, type TestTemplate } from '../composables/useDiagnosisTests'
  import type { DiagnosisTest } from '@/types/diagnosisTest.types'

  const emit = defineEmits(['next-tab'])

  interface Props {
    consultationId: number
    patientId?: number
  }

  const props = defineProps<Props>()

  // Composable
  const {
    diagnosisTests,
    loading,
    error,
    savingTest,
    deletingTest,
    laboratoryTemplates,
    imagingTemplates,
    otherTemplates,
    fetchDiagnosisTestsByConsultation,
    createDiagnosisTest,
    updateDiagnosisTest,
    deleteDiagnosisTest
  } = useDiagnosisTests()

  // Estado de la UI
  const editingTest = ref<DiagnosisTest | null>(null)
  const testToDelete = ref<DiagnosisTest | null>(null)
  const showDeleteDialog = ref(false)
  
  // Mapa de correspondencia entre templates y códigos CPT
  const templateToCptMap: Record<string, string> = {
    'Hemograma completo': '85025',
    'Perfil lipídico': '80061',
    'Glucosa en ayunas': '82947',
    'Radiografía de tórax': '71046',
    'Ecografía abdominal': '76700',
    'Tomografía computarizada': '70450',
    'Electrocardiograma': '93000',
    'Espirometría': '94010'
  }

  // Estado del formulario
  const formData = ref({
    test_type: '',
    description: ''
  })

  const formErrors = ref({
    test_type: '',
    description: ''
  })
  
  // Autocomplete
  const testSuggestions = ref<Array<{ code: string; description: string }>>([])
  const selectedTest = ref<{ code: string; description: string } | null>(null)
  
  // Lista de procedimientos médicos con códigos CPT (o equivalentes en Perú)
  const medicalProcedures = [
    { code: '80053', description: 'Panel metabólico completo' },
    { code: '85025', description: 'Hemograma completo (CBC)' },
    { code: '80061', description: 'Perfil lipídico' },
    { code: '82947', description: 'Glucosa en sangre, cuantitativa' },
    { code: '84153', description: 'Antígeno prostático específico (PSA)' },
    { code: '83036', description: 'Hemoglobina glicosilada (A1C)' },
    { code: '84443', description: 'Hormona estimulante de la tiroides (TSH)' },
    { code: '84439', description: 'Tiroxina libre (T4)' },
    { code: '84478', description: 'Triglicéridos' },
    { code: '82607', description: 'Vitamina B-12' },
    { code: '82728', description: 'Ferritina' },
    { code: '86003', description: 'Prueba de alergia, cualitativa' },
    { code: '87086', description: 'Cultivo bacteriano de orina' },
    { code: '87430', description: 'Prueba rápida de estreptococo' },
    { code: '70450', description: 'TC de cabeza/cerebro sin contraste' },
    { code: '70486', description: 'TC de senos paranasales' },
    { code: '71045', description: 'Radiografía de tórax, una vista' },
    { code: '71046', description: 'Radiografía de tórax, dos vistas' },
    { code: '72100', description: 'Radiografía de columna lumbosacra' },
    { code: '72110', description: 'Radiografía de columna lumbosacra completa' },
    { code: '73030', description: 'Radiografía de hombro' },
    { code: '73560', description: 'Radiografía de rodilla' },
    { code: '73610', description: 'Radiografía de tobillo' },
    { code: '74022', description: 'Radiografía completa de abdomen' },
    { code: '76641', description: 'Ecografía de mama, completa' },
    { code: '76700', description: 'Ecografía de abdomen, completa' },
    { code: '76770', description: 'Ecografía retroperitoneal, completa' },
    { code: '76830', description: 'Ecografía transvaginal' },
    { code: '76856', description: 'Ecografía pélvica' },
    { code: '93000', description: 'Electrocardiograma (ECG)' },
    { code: '93224', description: 'Monitoreo Holter 24 horas' },
    { code: '93306', description: 'Ecocardiografía completa' },
    { code: '93350', description: 'Ecocardiografía de estrés' },
    { code: '93880', description: 'Doppler carotídeo bilateral' },
    { code: '95810', description: 'Polisomnografía (estudio del sueño)' },
    { code: '95860', description: 'Electromiografía (EMG)' },
    { code: '96372', description: 'Administración terapéutica/profiláctica/diagnóstica' }
  ]
  
  // Método para buscar exámenes según el texto ingresado
  const searchTests = (event: { query: string }) => {
    const query = event.query.toLowerCase()
    testSuggestions.value = medicalProcedures.filter(
      item => 
        item.code.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    )
    
    if (testSuggestions.value.length > 0) {
      // Si tenemos una sugerencia exacta, actualizar la descripción
      const exactMatch = testSuggestions.value.find(
        item => item.description.toLowerCase() === query
      )
      
      if (exactMatch) {
        formData.value.description = exactMatch.description
      }
    }
  }

  // Métodos
  const validateForm = (): boolean => {
    formErrors.value.test_type = ''
    formErrors.value.description = ''
    
    let isValid = true

    if (!formData.value.test_type.trim()) {
      formErrors.value.test_type = 'El tipo de examen es requerido'
      isValid = false
    }

    if (!formData.value.description.trim()) {
      formErrors.value.description = 'La descripción es requerida'
      isValid = false
    }

    return isValid
  }

  const handleAddTest = async () => {
    if (!validateForm()) return

    try {
      const testData = {
        consultation_id: props.consultationId,
        test_type: formData.value.test_type,
        description: formData.value.description
      }

      if (editingTest.value) {
        // Actualizar test existente
        await updateDiagnosisTest(editingTest.value.id, testData)
      } else {
        // Agregar nuevo test
        await createDiagnosisTest(testData)
      }

      resetForm()
    } catch (error) {
      console.error('Error saving diagnosis test:', error)
    }
  }

  const editTest = (test: DiagnosisTest) => {
    editingTest.value = test
    formData.value = {
      test_type: test.test_type,
      description: test.description
    }
    
    // Intentar encontrar el procedimiento en la lista de médicos
    const testParts = test.test_type.split(' - ')
    if (testParts.length > 0) {
      const code = testParts[0]
      const matchingProcedure = medicalProcedures.find(p => p.code === code)
      if (matchingProcedure) {
        selectedTest.value = matchingProcedure
      } else {
        // Si no encuentra el código, usa el test_type como está
        selectedTest.value = { 
          code: testParts[0] || '',
          description: testParts.length > 1 ? testParts[1] : test.test_type
        }
      }
    } else {
      selectedTest.value = null
    }
  }

  const confirmDelete = (test: DiagnosisTest) => {
    testToDelete.value = test
    showDeleteDialog.value = true
  }

  const handleDelete = async () => {
    if (!testToDelete.value) return
    
    try {
      await deleteDiagnosisTest(testToDelete.value.id)
      showDeleteDialog.value = false
      testToDelete.value = null
    } catch (error) {
      console.error('Error deleting diagnosis test:', error)
    }
  }

  const resetForm = () => {
    formData.value = {
      test_type: '',
      description: ''
    }
    formErrors.value = {
      test_type: '',
      description: ''
    }
    selectedTest.value = null
    editingTest.value = null
  }

  const applyTemplate = (template: TestTemplate) => {
    // Buscar si hay un código CPT mapeado para este template
    const cptCode = templateToCptMap[template.test_type];
    
    if (cptCode) {
      // Si tenemos un código mapeado, buscar el procedimiento correspondiente
      const mappedProcedure = medicalProcedures.find(p => p.code === cptCode);
      
      if (mappedProcedure) {
        // Usar el procedimiento mapeado
        selectedTest.value = mappedProcedure;
        formData.value = {
          test_type: `${mappedProcedure.code} - ${mappedProcedure.description}`,
          description: template.description
        };
        return;
      }
    }
    
    // Si no hay un mapeo o no encontramos el procedimiento, buscar por coincidencia de texto
    const matchingProcedure = medicalProcedures.find(
      p => p.description.toLowerCase().includes(template.test_type.toLowerCase())
    );
    
    if (matchingProcedure) {
      // Si encontramos un código CPT que coincide, lo usamos
      selectedTest.value = matchingProcedure;
      formData.value = {
        test_type: `${matchingProcedure.code} - ${matchingProcedure.description}`,
        description: template.description
      };
    } else {
      // Si no encontramos código CPT, usamos el texto normal de la plantilla
      selectedTest.value = {
        code: "---",
        description: template.test_type
      };
      formData.value = {
        test_type: template.test_type,
        description: template.description
      };
    }
  }
  
  const onTestSelect = (event: { value: { code: string; description: string } }) => {
    const selected = event.value
    formData.value.test_type = `${selected.code} - ${selected.description}`
    formData.value.description = `Solicitud de ${selected.description}`
  }

  const handleNextTab = () => {
    // Navegar al siguiente tab
    emit('next-tab', 'prescription')
  }

  onMounted(() => {
    fetchDiagnosisTestsByConsultation(props.consultationId)
  })
</script>

<style scoped>
  .auxiliary-tests-tab {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }

  .auxiliary-tests-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    height: 100%;
  }

  .tests-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Header Styles */
  .section-header {
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-light) 0%,
      var(--color-sf-green-normal) 100%
    );
    color: white;
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .section-subtitle {
    font-size: 0.875rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.95;
  }

  /* Form Styles */
  .test-form {
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

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Current Tests List */
  .current-tests-section {
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

  .tests-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .test-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.2s;
  }

  .test-item:hover {
    border-color: var(--color-sf-green-light);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .test-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .test-item-actions {
    display: flex;
    gap: 0.25rem;
  }

  .test-item-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .test-type {
    font-weight: 700;
    color: var(--color-sf-green-normal);
    font-size: 0.875rem;
  }

  .test-description {
    color: #374151;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  /* Templates Sidebar */
  .tests-sidebar {
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .templates-card {
    height: 100%;
    max-height: calc(100vh - 250px);
    display: flex;
    flex-direction: column;
  }

  .templates-card :deep(.p-card-body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .templates-card :deep(.p-card-content) {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .templates-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .templates-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 1rem;
  }

  .templates-title i {
    color: var(--color-sf-green-normal);
  }

  .templates-subtitle {
    font-size: 0.8125rem;
    color: #6b7280;
    margin: 0.5rem 0 0 0;
  }

  .templates-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 0.5rem;
  }

  .template-group {
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  .template-group-header {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .template-group-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .template-items {
    display: flex;
    flex-direction: column;
  }

  .template-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    cursor: pointer;
    transition: all 0.2s;
  }

  .template-item:last-child {
    border-bottom: none;
  }

  .template-item:hover {
    background: #f9fafb;
  }

  .template-icon {
    background: #f3f4f6;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-sf-green-normal);
    flex-shrink: 0;
  }

  .template-content {
    flex: 1;
    min-width: 0;
  }

  .template-name {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .template-description {
    color: #6b7280;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .template-add-btn {
    opacity: 0;
    transition: opacity 0.2s;
  }

  .template-item:hover .template-add-btn {
    opacity: 1;
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

  /* Dialog */
  .confirmation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  /* Test Autocomplete */
  .test-option {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }

  .test-code {
    font-weight: 700;
    color: var(--color-sf-green-normal);
    font-size: 0.875rem;
  }

  .test-description {
    color: #6b7280;
    font-size: 0.8125rem;
  }
  
  :deep(.p-autocomplete) {
    width: 100%;
  }
  
  :deep(.p-autocomplete-input) {
    width: 100%;
  }
  
  :deep(.p-autocomplete-panel) {
    width: 100%;
    max-width: 100%;
  }

  /* Save Section */
  .save-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 2px solid #e5e7eb;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .auxiliary-tests-layout {
      grid-template-columns: 1fr;
    }

    .tests-sidebar {
      position: relative;
      top: 0;
    }

    .templates-card {
      max-height: 400px;
    }
  }

  @media (max-width: 640px) {
    .auxiliary-tests-layout {
      gap: 1rem;
    }

    .section-header {
      padding: 1rem;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .form-actions button {
      width: 100%;
    }
  }
</style>
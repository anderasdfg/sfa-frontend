<template>
  <div class="prescription-tab">
    <div class="prescription-layout">
      <!-- Left Column - Prescription Form & List -->
      <div class="prescription-main">
        <!-- Prescription Form -->
        <Card class="prescription-form-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3 class="section-title">Prescripción Médica</h3>
                <p class="section-subtitle">
                  Agrega los medicamentos y especifica las instrucciones de administración
                </p>
              </div>
            </div>
          </template>
          <template #content>
            <form @submit.prevent="handleAddPrescription" class="prescription-form">
              <!-- Medication Name -->
              <div class="form-group">
                <label class="form-label" for="medication">
                  Medicamento *
                  <i
                    class="pi pi-info-circle ml-2 text-gray-400"
                    v-tooltip="'Busca por nombre comercial o genérico'"
                  ></i>
                </label>
                <AutoComplete
                  id="medication"
                  v-model="selectedMedication"
                  :suggestions="medicationSuggestions"
                  optionLabel="name"
                  @complete="searchMedications"
                  @item-select="onMedicationSelect"
                  placeholder="Buscar por nombre de medicamento..."
                  dropdown
                  forceSelection
                  class="w-full"
                  :class="{ 'p-invalid': formErrors.medication }"
                >
                  <template #option="slotProps">
                    <div class="medication-option">
                      <span class="medication-name">{{ slotProps.option.name }}</span>
                      <span class="medication-generic">{{ slotProps.option.generic }}</span>
                    </div>
                  </template>
                </AutoComplete>
                <small v-if="formErrors.medication" class="p-error">
                  {{ formErrors.medication }}
                </small>
              </div>

              <div class="form-row">
                <!-- Dosage -->
                <div class="form-group flex-1">
                  <label class="form-label" for="dosage">Dosis *</label>
                  <InputText
                    id="dosage"
                    v-model="formData.dosage"
                    placeholder="Ej: 1 tableta"
                    class="w-full"
                    :class="{ 'p-invalid': formErrors.dosage }"
                  />
                  <small v-if="formErrors.dosage" class="p-error">
                    {{ formErrors.dosage }}
                  </small>
                </div>

                <!-- Frequency -->
                <div class="form-group flex-1">
                  <label class="form-label" for="frequency">Frecuencia *</label>
                  <InputText
                    id="frequency"
                    v-model="formData.frequency"
                    placeholder="Ej: Cada 8 horas"
                    class="w-full"
                    :class="{ 'p-invalid': formErrors.frequency }"
                  />
                  <small v-if="formErrors.frequency" class="p-error">
                    {{ formErrors.frequency }}
                  </small>
                </div>

                <!-- Duration -->
                <div class="form-group flex-1">
                  <label class="form-label" for="duration">Duración *</label>
                  <InputText
                    id="duration"
                    v-model="formData.duration"
                    placeholder="Ej: 5 días"
                    class="w-full"
                    :class="{ 'p-invalid': formErrors.duration }"
                  />
                  <small v-if="formErrors.duration" class="p-error">
                    {{ formErrors.duration }}
                  </small>
                </div>
              </div>

              <!-- Instructions -->
              <div class="form-group">
                <label class="form-label" for="instructions">Instrucciones *</label>
                <Textarea
                  id="instructions"
                  v-model="formData.instructions"
                  rows="2"
                  placeholder="Instrucciones específicas para la administración del medicamento"
                  class="w-full"
                  :class="{ 'p-invalid': formErrors.instructions }"
                />
                <small v-if="formErrors.instructions" class="p-error">
                  {{ formErrors.instructions }}
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
                  :disabled="savingPrescription"
                />
                <Button
                  type="submit"
                  :label="editingPrescription ? 'Actualizar' : 'Agregar Medicamento'"
                  icon="pi pi-plus"
                  :loading="savingPrescription"
                />
              </div>
            </form>
          </template>
        </Card>

        <!-- Current Prescriptions List -->
        <div class="current-prescriptions-section">
          <h4 class="list-title">
            Medicamentos recetados en esta consulta
            <Tag :value="prescriptions.length.toString()" severity="info" />
          </h4>

          <div v-if="loading" class="loading-state">
            <ProgressSpinner style="width: 40px; height: 40px" />
            <p class="text-gray-500 mt-2">Cargando prescripciones...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <p class="text-red-600">{{ error }}</p>
            <Button label="Reintentar" size="small" @click="fetchPrescriptionsByConsultation(props.consultationId, true)" />
          </div>

          <div v-else-if="prescriptions.length === 0" class="empty-state">
            <i class="pi pi-shopping-bag text-4xl text-gray-300"></i>
            <p class="text-gray-500 mt-2">No hay medicamentos recetados en esta consulta</p>
          </div>

          <div v-else class="prescriptions-list">
            <div
              v-for="prescription in prescriptions"
              :key="prescription.id"
              class="prescription-item"
            >
              <div class="prescription-item-header">
                <div class="prescription-item-title">{{ prescription.medication }}</div>
                <div class="prescription-item-actions">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="editPrescription(prescription)"
                    v-tooltip="'Editar'"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    @click="confirmDelete(prescription)"
                    v-tooltip="'Eliminar'"
                  />
                </div>
              </div>
              <div class="prescription-item-details">
                <div class="detail-chip">
                  <i class="pi pi-clock"></i>
                  <span>{{ prescription.dosage }} / {{ prescription.frequency }}</span>
                </div>
                <div class="detail-chip">
                  <i class="pi pi-calendar"></i>
                  <span>{{ prescription.duration }}</span>
                </div>
              </div>
              <div class="prescription-item-instructions">
                {{ prescription.instructions }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Templates -->
      <div class="prescription-sidebar">
        <Card class="templates-card">
          <template #header>
            <div class="templates-header">
              <div class="templates-title">
                <i class="pi pi-list"></i>
                <span>Plantillas</span>
              </div>
              <p class="templates-subtitle">
                Selecciona medicamentos para agregar rápidamente
              </p>
            </div>
          </template>
          <template #content>
            <div class="templates-list">
              <!-- Common medications -->
              <div class="template-group">
                <div class="template-group-header">
                  <h4 class="template-group-title">Medicamentos comunes</h4>
                </div>
                <div class="template-items">
                  <div
                    v-for="template in commonTemplates"
                    :key="template.id"
                    class="template-item"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-icon">
                      <i class="pi pi-star-fill"></i>
                    </div>
                    <div class="template-content">
                      <div class="template-name">{{ template.medication }}</div>
                      <div class="template-dosage">
                        <span class="dosage-item">{{ template.dosage }}</span>
                        <span class="dosage-divider">|</span>
                        <span class="dosage-item">{{ template.frequency }}</span>
                        <span class="dosage-divider">|</span>
                        <span class="dosage-item">{{ template.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Respiratory templates -->
              <div class="template-group">
                <div class="template-group-header">
                  <h4 class="template-group-title">Respiratorio</h4>
                </div>
                <div class="template-items">
                  <div
                    v-for="template in respiratoryTemplates"
                    :key="template.id"
                    class="template-item"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-icon">
                      <i class="pi pi-heart-fill"></i>
                    </div>
                    <div class="template-content">
                      <div class="template-name">{{ template.medication }}</div>
                      <div class="template-dosage">
                        <span class="dosage-item">{{ template.dosage }}</span>
                        <span class="dosage-divider">|</span>
                        <span class="dosage-item">{{ template.frequency }}</span>
                        <span class="dosage-divider">|</span>
                        <span class="dosage-item">{{ template.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cardiovascular templates -->
              <div class="template-group">
                <div class="template-group-header">
                  <h4 class="template-group-title">Cardiovascular</h4>
                </div>
                <div class="template-items">
                  <div
                    v-for="template in cardiovascularTemplates"
                    :key="template.id"
                    class="template-item"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-icon">
                      <i class="pi pi-heart"></i>
                    </div>
                    <div class="template-content">
                      <div class="template-name">{{ template.medication }}</div>
                      <div class="template-dosage">
                        <span class="dosage-item">{{ template.dosage }}</span>
                        <span class="dosage-divider">|</span>
                        <span class="dosage-item">{{ template.frequency }}</span>
                        <span class="dosage-divider">|</span>
                        <span class="dosage-item">{{ template.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="save-section">
      <Button 
        label="Siguiente" 
        icon="pi pi-save" 
        @click="handleFinish" 
        :loading="saving"
      />
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
        <p>¿Estás seguro de que deseas eliminar esta prescripción?</p>
        <p class="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="showDeleteDialog = false"
          :disabled="deletingPrescription"
        />
        <Button
          label="Eliminar"
          severity="danger"
          @click="handleDelete"
          :loading="deletingPrescription"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import AutoComplete from 'primevue/autocomplete'
  import Textarea from 'primevue/textarea'
  import Tag from 'primevue/tag'
  import Dialog from 'primevue/dialog'
  import ProgressSpinner from 'primevue/progressspinner'
  import { usePrescription, type PrescriptionTemplate } from '../composables/usePrescription'
  import type { Prescription } from '@/types/prescriptions.types'

  const emit = defineEmits(['next-tab'])

  interface Props {
    consultationId: number
    patientId?: number
  }

  const props = defineProps<Props>()

  // Composable
  const {
    prescriptions,
    loading,
    error,
    savingPrescription,
    deletingPrescription,
    commonTemplates,
    respiratoryTemplates,
    cardiovascularTemplates,
    fetchPrescriptionsByConsultation,
    createPrescription,
    updatePrescription,
    deletePrescription
  } = usePrescription()

  // Estado de la UI
  const editingPrescription = ref<Prescription | null>(null)
  const prescriptionToDelete = ref<Prescription | null>(null)
  const showDeleteDialog = ref(false)
  const saving = ref(false)

  // Estado del formulario
  const formData = ref({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  })
  
  // Estado para el autocomplete de medicamentos
  const selectedMedication = ref<{ name: string, generic: string, dosageForm?: string, concentration?: string } | null>(null)
  const medicationSuggestions = ref<Array<{ name: string, generic: string, dosageForm?: string, concentration?: string }>>([])
  
  // Lista de medicamentos comunes en Perú (incluye nombres comerciales y genéricos)
  const commonMedications = [
    { name: "Panadol", generic: "Paracetamol", dosageForm: "Tableta", concentration: "500 mg" },
    { name: "Apronax", generic: "Naproxeno Sódico", dosageForm: "Tableta", concentration: "550 mg" },
    { name: "Amoxil", generic: "Amoxicilina", dosageForm: "Cápsula", concentration: "500 mg" },
    { name: "Dolocordralan Extra Forte", generic: "Paracetamol + Diclofenaco", dosageForm: "Tableta", concentration: "500 mg + 50 mg" },
    { name: "Dexacort", generic: "Dexametasona", dosageForm: "Tableta", concentration: "0.5 mg" },
    { name: "Ciprofloxacino", generic: "Ciprofloxacino", dosageForm: "Tableta", concentration: "500 mg" },
    { name: "Azitromicina", generic: "Azitromicina", dosageForm: "Tableta", concentration: "500 mg" },
    { name: "Ventolin", generic: "Salbutamol", dosageForm: "Inhalador", concentration: "100 mcg/dosis" },
    { name: "Claritin", generic: "Loratadina", dosageForm: "Tableta", concentration: "10 mg" },
    { name: "Redex", generic: "Ibuprofeno", dosageForm: "Tableta", concentration: "400 mg" },
    { name: "Aspirina", generic: "Ácido Acetilsalicílico", dosageForm: "Tableta", concentration: "100 mg" },
    { name: "Eutirox", generic: "Levotiroxina", dosageForm: "Tableta", concentration: "50 mcg" },
    { name: "Losartan", generic: "Losartan", dosageForm: "Tableta", concentration: "50 mg" },
    { name: "Atorvastatina", generic: "Atorvastatina", dosageForm: "Tableta", concentration: "20 mg" },
    { name: "Simeticona", generic: "Simeticona", dosageForm: "Tableta", concentration: "80 mg" },
    { name: "Omeprazol", generic: "Omeprazol", dosageForm: "Cápsula", concentration: "20 mg" },
    { name: "Ranitidina", generic: "Ranitidina", dosageForm: "Tableta", concentration: "300 mg" },
    { name: "Bactrim", generic: "Sulfametoxazol + Trimetoprima", dosageForm: "Tableta", concentration: "800 mg + 160 mg" },
    { name: "Metformina", generic: "Metformina", dosageForm: "Tableta", concentration: "850 mg" },
    { name: "Fluoxetina", generic: "Fluoxetina", dosageForm: "Cápsula", concentration: "20 mg" },
    { name: "Alprazolam", generic: "Alprazolam", dosageForm: "Tableta", concentration: "0.5 mg" },
    { name: "Diazepam", generic: "Diazepam", dosageForm: "Tableta", concentration: "10 mg" },
    { name: "Dextrometorfano", generic: "Dextrometorfano", dosageForm: "Jarabe", concentration: "15 mg/5 ml" },
    { name: "Nastizol Compositum", generic: "Paracetamol + Fenilefrina + Clorfeniramina", dosageForm: "Tableta", concentration: "500 mg + 10 mg + 4 mg" },
    { name: "Bicarbonato de Sodio", generic: "Bicarbonato de Sodio", dosageForm: "Polvo", concentration: "1 g" },
    { name: "Ampicilina", generic: "Ampicilina", dosageForm: "Cápsula", concentration: "500 mg" },
    { name: "Cefaclor", generic: "Cefaclor", dosageForm: "Cápsula", concentration: "500 mg" },
    { name: "Diclofenaco", generic: "Diclofenaco", dosageForm: "Tableta", concentration: "50 mg" },
    { name: "Enalapril", generic: "Enalapril", dosageForm: "Tableta", concentration: "10 mg" },
    { name: "Captopril", generic: "Captopril", dosageForm: "Tableta", concentration: "25 mg" }
  ]

  const formErrors = ref({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  })

  // Métodos
  const validateForm = (): boolean => {
    formErrors.value.medication = ''
    formErrors.value.dosage = ''
    formErrors.value.frequency = ''
    formErrors.value.duration = ''
    formErrors.value.instructions = ''
    
    let isValid = true

    if (!formData.value.medication || !formData.value.medication.trim()) {
      formErrors.value.medication = 'El nombre del medicamento es requerido'
      isValid = false
    }

    if (!formData.value.dosage || !formData.value.dosage.trim()) {
      formErrors.value.dosage = 'La dosis es requerida'
      isValid = false
    }

    if (!formData.value.frequency || !formData.value.frequency.trim()) {
      formErrors.value.frequency = 'La frecuencia es requerida'
      isValid = false
    }

    if (!formData.value.duration || !formData.value.duration.trim()) {
      formErrors.value.duration = 'La duración es requerida'
      isValid = false
    }

    if (!formData.value.instructions || !formData.value.instructions.trim()) {
      formErrors.value.instructions = 'Las instrucciones son requeridas'
      isValid = false
    }

    return isValid
  }

  const handleAddPrescription = async () => {
    // Si hay un medicamento seleccionado pero no se ha asignado al formData
    if (selectedMedication.value && !formData.value.medication) {
      // Aplicamos el mismo formato que usamos en onMedicationSelect
      formData.value.medication = selectedMedication.value.name === selectedMedication.value.generic 
        ? selectedMedication.value.name 
        : `${selectedMedication.value.name} (${selectedMedication.value.generic})`
    }
    
    if (!validateForm()) return

    try {
      const prescriptionData = {
        consultation_id: props.consultationId,
        medication: formData.value.medication,
        dosage: formData.value.dosage,
        frequency: formData.value.frequency,
        duration: formData.value.duration,
        instructions: formData.value.instructions
      }

      if (editingPrescription.value) {
        // Actualizar prescripción existente
        await updatePrescription(editingPrescription.value.id, prescriptionData)
      } else {
        // Agregar nueva prescripción
        await createPrescription(prescriptionData)
      }

      resetForm()
    } catch (error) {
      console.error('Error saving prescription:', error)
    }
  }

  const editPrescription = (prescription: Prescription) => {
    editingPrescription.value = prescription
    formData.value = {
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions
    }
    
    // Intentamos encontrar una coincidencia en nuestros medicamentos comunes
    const medicationName = prescription.medication.split(' (')[0]; // Extraemos solo el nombre sin el genérico
    const foundMedication = commonMedications.find(med => med.name === medicationName);
    
    // Si encontramos el medicamento, lo asignamos al estado del autocomplete
    if (foundMedication) {
      selectedMedication.value = foundMedication;
    } else {
      // Si no lo encontramos, creamos un objeto temporal para el autocomplete
      selectedMedication.value = {
        name: medicationName,
        generic: prescription.medication.includes('(') 
          ? prescription.medication.split('(')[1].replace(')', '').trim()
          : medicationName
      };
    }
  }

  const confirmDelete = (prescription: Prescription) => {
    prescriptionToDelete.value = prescription
    showDeleteDialog.value = true
  }

  const handleDelete = async () => {
    if (!prescriptionToDelete.value) return
    
    try {
      await deletePrescription(prescriptionToDelete.value.id)
      showDeleteDialog.value = false
      prescriptionToDelete.value = null
    } catch (error) {
      console.error('Error deleting prescription:', error)
    }
  }

  const resetForm = () => {
    formData.value = {
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
    formErrors.value = {
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
    selectedMedication.value = null
    editingPrescription.value = null
  }
  
  // Método para buscar medicamentos
  const searchMedications = (event: { query: string }) => {
    const query = event.query.toLowerCase()
    medicationSuggestions.value = commonMedications.filter(med => 
      med.name.toLowerCase().includes(query) || 
      med.generic.toLowerCase().includes(query)
    )
  }
  
  // Método para manejar la selección de medicamento
  const onMedicationSelect = (medication: { name: string, generic: string, dosageForm?: string, concentration?: string }) => {
    if (medication) {
      // Establecemos una sugerencia de dosis más descriptiva basada en la forma farmacéutica
      if (medication.dosageForm && medication.concentration) {
        switch (medication.dosageForm.toLowerCase()) {
          case 'tableta':
          case 'comprimido':
            formData.value.dosage = `1 tableta de ${medication.concentration}`
            break
          case 'cápsula':
            formData.value.dosage = `1 cápsula de ${medication.concentration}`
            break
          case 'jarabe':
          case 'suspensión':
            formData.value.dosage = `5 ml (${medication.concentration})`
            break
          case 'inhalador':
            formData.value.dosage = `1-2 aplicaciones de ${medication.concentration}`
            break
          case 'ampolla':
          case 'inyectable':
            formData.value.dosage = `1 ampolla de ${medication.concentration}`
            break
          case 'polvo':
            formData.value.dosage = `1 sobre de ${medication.concentration}`
            break
          default:
            formData.value.dosage = medication.concentration
        }
      } else if (medication.concentration) {
        formData.value.dosage = medication.concentration
      }
      
      // Actualizamos el campo medication con el nombre seleccionado
      formData.value.medication = medication.name === medication.generic 
        ? medication.name 
        : `${medication.name} (${medication.generic})`
    }
  }

  const applyTemplate = (template: PrescriptionTemplate) => {
    formData.value = {
      medication: template.medication,
      dosage: template.dosage,
      frequency: template.frequency,
      duration: template.duration,
      instructions: template.instructions
    }
    
    // Intentamos encontrar una coincidencia en nuestros medicamentos comunes
    const medicationName = template.medication.split(' (')[0]; // Extraemos solo el nombre sin el genérico
    const foundMedication = commonMedications.find(med => med.name === medicationName);
    
    // Si encontramos el medicamento, lo asignamos al estado del autocomplete
    if (foundMedication) {
      selectedMedication.value = foundMedication;
    } else {
      // Si no lo encontramos, creamos un objeto temporal para el autocomplete
      selectedMedication.value = {
        name: medicationName,
        generic: template.medication.includes('(') 
          ? template.medication.split('(')[1].replace(')', '').trim()
          : medicationName
      };
    }
  }

  const handleFinish = async () => {
    saving.value = true
    
    try {
      // Ejecutamos un evento que será capturado por el componente padre
      // para finalizar la consulta
      emit('next-tab')
    } catch (error) {
      console.error('Error finalizando consulta:', error)
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    fetchPrescriptionsByConsultation(props.consultationId)
  })
</script>

<style scoped>
  .prescription-tab {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }

  .prescription-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    height: 100%;
  }

  .prescription-main {
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
  .prescription-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    width: 100%;
  }

  .flex-1 {
    flex: 1;
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

  /* Current Prescriptions List */
  .current-prescriptions-section {
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

  .prescriptions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .prescription-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.2s;
  }

  .prescription-item:hover {
    border-color: var(--color-sf-green-light);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .prescription-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .prescription-item-title {
    font-weight: 700;
    color: var(--color-sf-green-normal);
    font-size: 1rem;
  }

  .prescription-item-actions {
    display: flex;
    gap: 0.25rem;
  }

  .prescription-item-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .detail-chip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.8125rem;
    color: #4b5563;
  }

  .detail-chip i {
    color: var(--color-sf-green-normal);
    font-size: 0.75rem;
  }

  .prescription-item-instructions {
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* Templates Sidebar */
  .prescription-sidebar {
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

  .template-dosage {
    display: flex;
    align-items: center;
    color: #6b7280;
    font-size: 0.75rem;
  }

  .dosage-divider {
    margin: 0 0.375rem;
    color: #d1d5db;
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

  /* Save Section */
  .save-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 2px solid #e5e7eb;
  }

  /* Medication Autocomplete */
  .medication-option {
    display: flex;
    flex-direction: column;
    padding: 0.25rem 0;
  }
  
  .medication-name {
    font-weight: 600;
    color: #374151;
  }
  
  .medication-generic {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.125rem;
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .prescription-layout {
      grid-template-columns: 1fr;
    }

    .prescription-sidebar {
      position: relative;
      top: 0;
    }

    .templates-card {
      max-height: 400px;
    }
  }

  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  @media (max-width: 640px) {
    .prescription-layout {
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
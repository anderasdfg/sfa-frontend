<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!uploading"
    :style="{ width: '90%', maxWidth: '600px', maxHeight: '90vh' }"
    @update:visible="handleClose"
  >
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">Subir Resultados del Examen</h3>
      </div>
    </template>

    <!-- Información del test order -->
    <div v-if="testOrder" class="test-info">
      <div class="test-details">
        <div class="test-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <div class="test-text">
          <div class="test-name">
            <span v-if="getCptCode()" class="cpt-badge">
              {{ getCptCode() }}
            </span>
            {{ getTestName() }}
          </div>
          <div class="test-patient">
            Paciente: {{ getPatientName() }}
          </div>
        </div>
      </div>
      <div class="test-status">
        <Tag
          value="Pendiente subir resultados"
          severity="warning"
          class="status-tag"
        />
      </div>
    </div>

    <!-- Formulario de subida -->
    <div class="upload-form">
      <!-- Área de drag & drop -->
      <div 
        class="file-drop-zone"
        :class="{ 
          'drag-over': isDragOver,
          'has-file': selectedFile,
          'uploading': uploading
        }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          :accept="acceptedFileTypes"
          @change="handleFileSelect"
          class="file-input-hidden"
        />

        <!-- Estado sin archivo -->
        <div v-if="!selectedFile" class="drop-zone-content">
          <i class="pi pi-cloud-upload upload-icon"></i>
          <p class="upload-text">
            <strong>Haz clic para seleccionar</strong> o arrastra el archivo aquí
          </p>
          <p class="upload-hint">
            Formatos permitidos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
          </p>
        </div>

        <!-- Vista previa del archivo -->
        <div v-else class="file-preview">
          <div class="file-info">
            <i :class="getFileIcon(selectedFile.name)" class="file-icon"></i>
            <div class="file-details">
              <div class="file-name">{{ selectedFile.name }}</div>
              <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
          </div>
          <Button
            v-if="!uploading"
            icon="pi pi-times"
            size="small"
            text
            rounded
            severity="danger"
            @click.stop="clearFile"
            class="remove-file-btn"
          />
        </div>

        <!-- Barra de progreso -->
        <div v-if="uploading" class="upload-progress">
          <ProgressBar :value="uploadProgress" class="progress-bar" />
          <span class="progress-text">Subiendo... {{ uploadProgress }}%</span>
        </div>
      </div>

      <!-- Campo de resumen -->
      <div class="form-field">
        <label for="result-summary" class="field-label">
          <i class="pi pi-file-edit"></i>
          Resumen del Resultado
        </label>
        <Textarea
          id="result-summary"
          v-model="resultSummary"
          :disabled="uploading"
          placeholder="Describe brevemente los resultados del examen..."
          :rows="4"
          :maxlength="500"
          class="summary-textarea"
        />
        <small class="char-counter">
          {{ resultSummary.length }}/500 caracteres
        </small>
      </div>

      <!-- Mensajes de error -->
      <Message v-if="errorMessage" severity="error" :closable="false" class="error-message">
        {{ errorMessage }}
      </Message>

      <!-- Mensaje de éxito -->
      <Message v-if="successMessage" severity="success" :closable="false" class="success-message">
        {{ successMessage }}
      </Message>

      <!-- Información detallada del archivo subido -->
      <div v-if="uploadResult" class="upload-result">
        <div class="result-header">
          <i class="pi pi-check-circle"></i>
          <h4>Archivo subido correctamente</h4>
        </div>
        <div class="result-details">
          <div class="result-item">
            <span class="result-label">Archivo:</span>
            <span class="result-value">{{ uploadResult.fileName }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Tamaño:</span>
            <span class="result-value">{{ formatFileSize(uploadResult.size || 0) }}</span>
          </div>
          <div v-if="uploadResult.testResultId" class="result-item">
            <span class="result-label">ID del Resultado:</span>
            <span class="result-value">#{{ uploadResult.testResultId }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Resumen:</span>
            <span class="result-value">{{ uploadResult.resultSummary }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleClose"
          :disabled="uploading"
        />
        <Button
          label="Subir Resultado"
          icon="pi pi-upload"
          @click="handleUpload"
          :disabled="!canUpload || uploading"
          :loading="uploading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import Dialog from 'primevue/dialog'
  import Button from 'primevue/button'
  import Message from 'primevue/message'
  import ProgressBar from 'primevue/progressbar'
  import Textarea from 'primevue/textarea'
  import Tag from 'primevue/tag'
  import { FileStorageService } from '@/services/fileStorage.service'
  import { TestOrderService } from '@/services/testOrder.service'
  import { useNotifications } from '@/composables/useNotifications'
  import { useAuthStore } from '@/stores/auth/authStore'
  import type { TestOrder } from '@/types/testOrder.types'
  import type { DoctorActivityItem } from '@/modules/user-roles/doctor/composables/useDoctorAppointments'
  import type { FileUploadRequest } from '@/types/fileStorage.types'

  interface Props {
    visible: boolean
    testOrder: TestOrder | DoctorActivityItem | null
  }

  interface Emits {
    'update:visible': [value: boolean]
    'upload-success': [testOrder: TestOrder | DoctorActivityItem, fileInfo: any]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // Refs
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // Estado
  const selectedFile = ref<File | null>(null)
  const resultSummary = ref('')
  const isDragOver = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const errorMessage = ref('')
  const successMessage = ref('')
  const uploadResult = ref<any>(null)

  // Composables
  const notifications = useNotifications()
  const authStore = useAuthStore()

  // Computed
  const acceptedFileTypes = computed(() => {
    return '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx'
  })

  const canUpload = computed(() => {
    return selectedFile.value && 
           resultSummary.value.trim().length > 0 && 
           !uploading.value
  })

  const testOrder = computed(() => props.testOrder)

  // Métodos de utilidad
  const getPatientName = (): string => {
    if (!testOrder.value) return 'No disponible'
    
    // Para DoctorActivityItem
    if ('patient_name' in testOrder.value) {
      return testOrder.value.patient_name
    }
    
    // Para TestOrder
    if ('patient_first_name' in testOrder.value && testOrder.value.patient_first_name && testOrder.value.patient_last_name) {
      return `${testOrder.value.patient_first_name} ${testOrder.value.patient_last_name}`
    }
    
    return 'Paciente'
  }

  const getCptCode = (): string => {
    if (!testOrder.value) return ''
    
    // Para TestOrder
    if ('diagnostic_test_cpt_code' in testOrder.value) {
      return testOrder.value.diagnostic_test_cpt_code || ''
    }
    
    return ''
  }

  const getTestName = (): string => {
    if (!testOrder.value) return 'Examen'
    
    // Para ambos tipos
    if ('diagnostic_test_name' in testOrder.value) {
      return testOrder.value.diagnostic_test_name || 'Examen'
    }
    
    return 'Examen'
  }

  const getFileIcon = (fileName: string): string => {
    return FileStorageService.getFileIcon(fileName)
  }

  const formatFileSize = (bytes: number): string => {
    return FileStorageService.formatFileSize(bytes)
  }

  // Métodos de manejo de archivos
  const triggerFileInput = () => {
    if (uploading.value) return
    fileInputRef.value?.click()
  }

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      selectFile(file)
    }
  }

  const selectFile = (file: File) => {
    clearMessages()
    
    try {
      FileStorageService.validateFile(file)
      selectedFile.value = file
    } catch (error: any) {
      console.error('File validation failed:', error.message)
      errorMessage.value = error.message
      selectedFile.value = null
    }
  }

  const clearFile = () => {
    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    clearMessages()
  }

  // Métodos de drag & drop
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (!uploading.value) {
      isDragOver.value = true
    }
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false
    
    if (uploading.value) return

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      selectFile(files[0])
    }
  }

  // Métodos de subida
  const handleUpload = async () => {
    if (!canUpload.value || !testOrder.value || !authStore.user?.id) {
      return
    }

    uploading.value = true
    uploadProgress.value = 0
    clearMessages()

    try {
      const uploadRequest: FileUploadRequest = {
        id: testOrder.value.id,
        file: selectedFile.value!,
        result_summary: resultSummary.value.trim(),
        uploaded_by_id: authStore.user.id.toString()
      }

      const result = await FileStorageService.uploadTestResult(
        uploadRequest,
        (progress: number) => {
          uploadProgress.value = progress
        }
      )

      // Éxito en la subida del archivo
      successMessage.value = result.message || 'Resultado subido exitosamente'
      uploadResult.value = result // Guardar el resultado completo
      
      // Actualizar el estado del test order a "completado"
      try {
        await TestOrderService.updateTestOrder(testOrder.value.id, {
          status: 'completado'
        })
        console.log('Estado del test order actualizado a completado')
      } catch (statusError: any) {
        console.warn('Error al actualizar el estado del test order:', statusError.message)
        // No fallar la operación completa por este error, solo registrarlo
      }
      
      notifications.showSuccess('Éxito', result.message || 'El resultado ha sido subido correctamente')
      
      // Emitir evento de éxito con toda la respuesta del servidor
      emit('upload-success', testOrder.value, result)

      // Cerrar modal después de un delay
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error: any) {
      console.error('Error uploading file:', error)
      errorMessage.value = error.message || 'Error al subir el archivo'
      notifications.showError('Error', error.message || 'No se pudo subir el archivo')
      uploadProgress.value = 0
    } finally {
      uploading.value = false
    }
  }

  // Métodos de utilidad
  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const resetForm = () => {
    selectedFile.value = null
    resultSummary.value = ''
    uploadProgress.value = 0
    uploadResult.value = null
    clearMessages()
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  const handleClose = () => {
    if (uploading.value) return // No cerrar si está subiendo
    emit('update:visible', false)
    // Reset form después del próximo tick para evitar flickering
    nextTick(() => {
      resetForm()
    })
  }

  // Watchers
  watch(
    () => props.visible,
    (isVisible) => {
      if (isVisible) {
        clearMessages()
      } else {
        // Reset solo si no está subiendo
        if (!uploading.value) {
          resetForm()
        }
      }
    }
  )
</script>

<style scoped>
  .modal-header {
    width: 100%;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  /* Información del test order */
  .test-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .test-details {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .test-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-sf-green-normal);
    border-radius: 6px;
    color: white;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .test-text {
    flex: 1;
  }

  .test-name {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .cpt-badge {
    display: inline-block;
    background: var(--color-sf-green-normal);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .test-patient {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .test-status {
    display: flex;
    align-items: flex-start;
  }

  .status-tag {
    font-size: 0.75rem !important;
  }

  /* Formulario de subida */
  .upload-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Zona de drag & drop */
  .file-drop-zone {
    position: relative;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #f9fafb;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-drop-zone:hover:not(.uploading) {
    border-color: var(--color-sf-green-normal);
    background: #f0fdf4;
  }

  .file-drop-zone.drag-over {
    border-color: var(--color-sf-green-normal);
    background: #f0fdf4;
    transform: scale(1.02);
  }

  .file-drop-zone.has-file {
    border-color: var(--color-sf-green-normal);
    background: white;
  }

  .file-drop-zone.uploading {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .file-input-hidden {
    display: none;
  }

  /* Contenido de la zona de drop */
  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .upload-icon {
    font-size: 2.5rem;
    color: #9ca3af;
  }

  .upload-text {
    font-size: 1rem;
    color: #4b5563;
    margin: 0;
  }

  .upload-hint {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  /* Vista previa del archivo */
  .file-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .file-icon {
    font-size: 2rem;
    color: var(--color-sf-green-normal);
  }

  .file-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .file-name {
    font-weight: 600;
    color: #2c3e50;
    word-break: break-word;
  }

  .file-size {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .remove-file-btn {
    flex-shrink: 0;
  }

  /* Barra de progreso */
  .upload-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 0 0 6px 6px;
  }

  .progress-bar {
    height: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #4b5563;
    text-align: center;
    display: block;
  }

  /* Campo de resumen */
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
  }

  .summary-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .char-counter {
    color: #6b7280;
    font-size: 0.8rem;
    text-align: right;
  }

  /* Mensajes */
  .error-message,
  .success-message {
    margin: 0;
  }

  /* Resultado de subida */
  .upload-result {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 1.25rem;
    margin: 0;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #bbf7d0;
  }

  .result-header i {
    font-size: 1.5rem;
    color: #16a34a;
  }

  .result-header h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #15803d;
    margin: 0;
  }

  .result-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    border: 1px solid #d1fae5;
  }

  .result-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .result-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #15803d;
    text-align: right;
    word-break: break-word;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .test-info {
      flex-direction: column;
    }

    .test-status {
      align-self: flex-start;
    }

    .file-drop-zone {
      padding: 1.5rem 1rem;
    }

    .result-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .result-value {
      text-align: left;
    }

    .modal-footer {
      flex-direction: column-reverse;
    }

    .modal-footer button {
      width: 100%;
    }
  }
</style>
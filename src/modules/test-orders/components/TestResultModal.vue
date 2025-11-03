<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '90%', maxWidth: '700px', maxHeight: '90vh' }"
    @update:visible="handleClose"
  >
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">Resultado del Examen</h3>
      </div>
    </template>

    <div v-if="loading" class="loading-state">
      <ProgressSpinner size="50" />
      <p>Cargando resultados...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <Message severity="error" :closable="false">
        {{ error }}
      </Message>
    </div>

    <div v-else-if="testResult" class="result-content">
      <!-- Información del examen -->
      <div class="test-info">
        <div class="test-header">
          <div class="test-icon">
            <i class="pi pi-file-check"></i>
          </div>
          <div class="test-details">
            <h4 class="test-name">{{ testResult.test_name }}</h4>
            <p class="patient-name">Paciente: {{ testResult.patient_name }}</p>
          </div>
        </div>
        <div class="upload-info">
          <div class="upload-detail">
            <i class="pi pi-calendar"></i>
            <span>{{ formatUploadDate(testResult.uploaded_at) }}</span>
          </div>
          <div class="upload-detail">
            <i class="pi pi-user"></i>
            <span>Subido por: {{ testResult.uploaded_by_name }}</span>
          </div>
        </div>
      </div>

      <!-- Resumen del resultado -->
      <div class="result-summary">
        <h5 class="summary-title">
          <i class="pi pi-file-edit"></i>
          Resumen del Resultado
        </h5>
        <div class="summary-content">
          {{ testResult.result_summary }}
        </div>
      </div>

      <!-- Archivo del resultado -->
      <div class="file-section">
        <h5 class="file-title">
          <i class="pi pi-file-pdf"></i>
          Archivo del Resultado
        </h5>
        <div class="file-actions">
          <Button
            label="Ver Documento"
            icon="pi pi-eye"
            @click="viewDocument"
            class="view-btn"
          />
          <Button
            label="Descargar"
            icon="pi pi-download"
            severity="secondary"
            outlined
            @click="downloadDocument"
            class="download-btn"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <Button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleClose"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import Dialog from 'primevue/dialog'
  import Button from 'primevue/button'
  import Message from 'primevue/message'
  import ProgressSpinner from 'primevue/progressspinner'
  import { TestResultService } from '@/services/testResult.service'
  import { useNotifications } from '@/composables/useNotifications'
  import type { TestResult } from '@/types/testResult.types'

  interface Props {
    visible: boolean
    testOrderId: number | null
  }

  interface Emits {
    'update:visible': [value: boolean]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // Estado
  const loading = ref(false)
  const error = ref('')
  const testResult = ref<TestResult | null>(null)

  // Composables
  const notifications = useNotifications()

  // Métodos
  const loadTestResult = async () => {
    if (!props.testOrderId) return

    loading.value = true
    error.value = ''
    testResult.value = null

    try {
      const result = await TestResultService.getTestResults(props.testOrderId)
      
      if (result) {
        testResult.value = result
      } else {
        error.value = 'No se encontraron resultados para este examen'
      }
    } catch (err: any) {
      console.error('Error loading test result:', err)
      error.value = err.message || 'Error al cargar los resultados'
    } finally {
      loading.value = false
    }
  }

  const formatUploadDate = (uploadedAt: string): string => {
    return TestResultService.formatUploadDate(uploadedAt)
  }

  const viewDocument = () => {
    if (!testResult.value) return

    // Abrir en nueva pestaña para ver el documento
    const url = TestResultService.getDownloadUrl(testResult.value)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const downloadDocument = async () => {
    if (!testResult.value) return

    try {
      const url = TestResultService.getDownloadUrl(testResult.value)
      const fileName = `resultado_${testResult.value.test_name.replace(/\s+/g, '_')}_${testResult.value.patient_name.replace(/\s+/g, '_')}.pdf`
      
      // Método 1: Intentar fetch + blob para forzar descarga
      try {
        const response = await fetch(url)
        if (response.ok) {
          const blob = await response.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = fileName
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Limpiar el blob URL
          window.URL.revokeObjectURL(blobUrl)
          
          notifications.showSuccess('Éxito', 'Descarga iniciada correctamente')
          return
        }
      } catch (fetchError) {
        console.warn('Fetch download failed, trying alternative method:', fetchError)
      }
      
      // Método 2: Fallback con link directo y atributos de descarga
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.setAttribute('download', fileName)
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      notifications.showSuccess('Éxito', 'Descarga iniciada correctamente')
      
    } catch (err) {
      console.error('Error downloading file:', err)
      notifications.showError('Error', 'No se pudo descargar el archivo')
    }
  }

  const handleClose = () => {
    emit('update:visible', false)
    // Limpiar estado al cerrar
    testResult.value = null
    error.value = ''
  }

  // Watchers
  watch(
    () => props.visible,
    (isVisible) => {
      if (isVisible && props.testOrderId) {
        loadTestResult()
      }
    },
    { immediate: true }
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

  /* Estados de carga y error */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    gap: 1rem;
  }

  .loading-state p {
    color: #6b7280;
    margin: 0;
  }

  /* Contenido del resultado */
  .result-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Información del test */
  .test-info {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 8px;
    padding: 1.25rem;
    border: 1px solid #bbf7d0;
  }

  .test-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .test-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-sf-green-normal);
    border-radius: 8px;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .test-details {
    flex: 1;
  }

  .test-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #15803d;
    margin: 0 0 0.25rem 0;
  }

  .patient-name {
    font-size: 0.875rem;
    color: #16a34a;
    margin: 0;
    font-weight: 500;
  }

  .upload-info {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .upload-detail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #059669;
  }

  .upload-detail i {
    font-size: 1rem;
  }

  /* Resumen del resultado */
  .result-summary {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .summary-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
  }

  .summary-content {
    font-size: 0.9rem;
    line-height: 1.6;
    color: #4b5563;
    background: white;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    min-height: 60px;
  }

  /* Sección del archivo */
  .file-section {
    background: #fefefe;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .file-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
  }

  .file-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .view-btn {
    background: var(--color-sf-green-normal) !important;
    border-color: var(--color-sf-green-normal) !important;
  }

  .view-btn:hover {
    background: var(--color-sf-green-dark) !important;
    border-color: var(--color-sf-green-dark) !important;
  }

  .download-btn {
    color: var(--color-sf-green-normal) !important;
    border-color: var(--color-sf-green-normal) !important;
  }

  .download-btn:hover {
    background: var(--color-sf-green-light) !important;
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
    .test-header {
      flex-direction: column;
      text-align: center;
    }

    .upload-info {
      flex-direction: column;
      gap: 0.75rem;
    }

    .file-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-actions .p-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
<template>
  <div class="patient-test-orders-view">
    <div class="test-orders-content">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        <p class="text-gray-600 mt-3">Cargando tus órdenes de exámenes...</p>
      </div>

      <!-- Mensaje de error -->
      <Message v-else-if="error" severity="error" :closable="false">
        {{ error }}
        <template #icon>
          <i class="pi pi-exclamation-circle"></i>
        </template>
      </Message>

      <!-- Lista de test orders -->
      <div v-else class="test-orders-list-container">
        <!-- Filtros y acciones -->
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label class="filter-label">Fecha</label>
              <Calendar
                v-model="filters.date"
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha"
                :showIcon="true"
                showButtonBar
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Tipo de Examen</label>
              <Dropdown
                v-model="filters.testType"
                :options="testTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todos los tipos"
                :showClear="true"
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Estado</label>
              <Dropdown
                v-model="filters.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todos los estados"
                :showClear="true"
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group filter-actions">
              <Button
                label="Limpiar filtros"
                icon="pi pi-filter-slash"
                @click="clearFilters"
                class="p-button-outlined p-button-secondary"
                :disabled="!hasActiveFilters"
              />
            </div>
          </div>

          <div class="test-orders-actions">
            <Button
              label="Actualizar"
              icon="pi pi-refresh"
              @click="refreshTestOrders"
              :loading="loading"
              class="p-button-outlined"
            />
          </div>
        </div>

        <!-- Lista de órdenes filtradas -->
        <div v-if="filteredTestOrders.length > 0" class="test-orders-list">
          <div
            v-for="testOrder in filteredTestOrders"
            :key="testOrder.id"
            class="test-order-card"
          >
            <div class="test-order-header">
              <div class="test-order-icon">
                <i class="pi pi-chart-bar"></i>
              </div>
              <div class="test-order-main">
                <div class="test-order-name">
                  <span class="cpt-code">{{ testOrder.diagnostic_test_cpt_code }}</span>
                  {{ testOrder.diagnostic_test_name }}
                </div>
                <div class="test-order-date">
                  Solicitado: {{ formatDateTime(testOrder.created_at) }}
                </div>
              </div>
              <div class="test-order-status">
                <Tag
                  :value="getStatusLabel(testOrder.status)"
                  :severity="getStatusSeverity(testOrder.status)"
                  class="status-tag"
                />
              </div>
            </div>

            <div class="test-order-body">
              <div class="test-order-description">
                <strong>Descripción:</strong> {{ testOrder.diagnostic_test_description }}
              </div>
              
              <div v-if="testOrder.diagnostic_test_patient_instructions" class="test-order-instructions">
                <div class="instructions-header">
                  <i class="pi pi-info-circle"></i>
                  <strong>Instrucciones para el paciente:</strong>
                </div>
                <p>{{ testOrder.diagnostic_test_patient_instructions }}</p>
              </div>
            </div>

            <div class="test-order-actions">
              <Button
                v-if="canPayTestOrder(testOrder)"
                label="Pagar examen"
                icon="pi pi-credit-card"
                size="small"
                :loading="processingPayment === testOrder.id"
                :disabled="!!processingPayment"
                @click="handlePayment(testOrder)"
                class="p-button-success p-button-sm"
              />
              <Button
                v-if="testOrder.status === 'pagado' || testOrder.status === 'completado'"
                label="Ver resultados"
                icon="pi pi-file-pdf"
                size="small"
                @click="viewResults(testOrder)"
                class="p-button-outlined p-button-sm"
              />
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-state">
          <i class="pi pi-chart-bar text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">
            {{
              hasActiveFilters
                ? 'No se encontraron órdenes de exámenes con los filtros aplicados'
                : 'No tienes órdenes de exámenes en este momento'
            }}
          </p>
        </div>

        <!-- Información adicional -->
        <div v-if="filteredTestOrders.length > 0" class="test-orders-info">
          <Card>
            <template #content>
              <div class="info-content">
                <i class="pi pi-info-circle text-blue-500 text-2xl"></i>
                <div class="info-text">
                  <h3 class="info-title">Información importante</h3>
                  <p class="info-description">
                    Por favor, sigue las instrucciones indicadas para cada examen. Si tienes dudas,
                    consulta con tu médico o contacta con nuestro laboratorio.
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Modal de selección de slots -->
    <TestOrderSlotSelectionModal
      v-if="selectedTestOrder"
      :visible="showSlotSelectionModal"
      :test-order="selectedTestOrder"
      :service-id="selectedTestOrder.service_id || 1"
      @update:visible="showSlotSelectionModal = $event"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { usePatientTestOrders } from '../composables/usePatientTestOrders'
  import { useNotifications } from '@/composables/useNotifications'
  import type { TestOrder } from '@/types/testOrder.types'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner'
  import Message from 'primevue/message'
  import Card from 'primevue/card'
  import Tag from 'primevue/tag'
  import Calendar from 'primevue/calendar'
  import Dropdown from 'primevue/dropdown'
  import TestOrderSlotSelectionModal from '../components/TestOrderSlotSelectionModal.vue'

  const { testOrders, loading, error, fetchPatientTestOrders } = usePatientTestOrders()
  const notifications = useNotifications()

  // Estado de pagos
  const processingPayment = ref<number | null>(null)
  
  // Estado del modal de selección de slots
  const showSlotSelectionModal = ref(false)
  const selectedTestOrder = ref<TestOrder | null>(null)

  // Filtros
  const filters = ref({
    date: null as Date | null,
    testType: null as string | null,
    status: null as string | null
  })

  // Opciones para los filtros
  const testTypeOptions = computed(() => {
    const types = new Set<string>()
    testOrders.value.forEach(order => {
      if (order.diagnostic_test_name) {
        types.add(order.diagnostic_test_name)
      }
    })
    return Array.from(types).map(name => ({ label: name, value: name }))
  })

  const statusOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pagado', value: 'pagado' },
    { label: 'En proceso', value: 'en_proceso' },
    { label: 'Completado', value: 'completado' },
    { label: 'Cancelado', value: 'cancelado' }
  ]

  // Test orders filtrados
  const filteredTestOrders = computed(() => {
    let filtered = [...testOrders.value]

    // Filtro por fecha
    if (filters.value.date) {
      const selectedDate = new Date(filters.value.date)
      selectedDate.setHours(0, 0, 0, 0)

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === selectedDate.getTime()
      })
    }

    // Filtro por tipo de examen
    if (filters.value.testType) {
      filtered = filtered.filter(order => order.diagnostic_test_name === filters.value.testType)
    }

    // Filtro por estado
    if (filters.value.status) {
      filtered = filtered.filter(order => order.status === filters.value.status)
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
  })

  const hasActiveFilters = computed(() => {
    return !!(filters.value.date || filters.value.testType || filters.value.status)
  })

  // Funciones de utilidad
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(date)
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      en_proceso: 'En proceso',
      completado: 'Completado',
      cancelado: 'Cancelado'
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const getStatusSeverity = (status: string): string => {
    const severityMap: Record<string, string> = {
      pendiente: 'warning',
      pagado: 'info',
      en_proceso: 'info',
      completado: 'success',
      cancelado: 'danger'
    }
    return severityMap[status] || 'info'
  }

  const canPayTestOrder = (testOrder: TestOrder): boolean => {
    // Puede pagar si está en estado 'pendiente'
    return testOrder.status === 'pendiente'
  }

  // Funciones de acción
  const applyFilters = () => {
    // Los filtros se aplican automáticamente a través del computed
  }

  const clearFilters = () => {
    filters.value = {
      date: null,
      testType: null,
      status: null
    }
  }

  const handlePayment = (testOrder: TestOrder) => {
    // Abrir modal de selección de slots
    selectedTestOrder.value = testOrder
    showSlotSelectionModal.value = true
  }

  const viewResults = (_testOrder: TestOrder) => {
    // TODO: Implementar visualización de resultados
    notifications.showInfo('Próximamente', 'La visualización de resultados estará disponible pronto')
  }

  const refreshTestOrders = async () => {
    await fetchPatientTestOrders()
  }

  // Lifecycle
  onMounted(async () => {
    await fetchPatientTestOrders()
  })
</script>

<style scoped>
  .patient-test-orders-view {
    max-width: 1200px;
    margin: 0 auto;
  }

  .test-orders-content {
    border-radius: 12px;
    min-height: 400px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .test-orders-list-container {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Filtros */
  .filters-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-weight: 500;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .filter-actions {
    display: flex;
    align-items: flex-end;
  }

  .test-orders-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  /* Lista de test orders */
  .test-orders-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .test-order-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    overflow: hidden;
  }

  .test-order-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .test-order-header {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    gap: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .test-order-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-sf-green-light), var(--color-sf-green-normal));
    border-radius: 8px;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .test-order-main {
    flex: 1;
    min-width: 0;
  }

  .test-order-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .cpt-code {
    display: inline-block;
    background: var(--color-sf-green-light);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-right: 0.5rem;
  }

  .test-order-date {
    font-size: 0.85rem;
    color: #718096;
  }

  .test-order-status {
    display: flex;
    align-items: center;
  }

  .status-tag {
    white-space: nowrap;
  }

  .test-order-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .test-order-description {
    color: #4a5568;
    line-height: 1.6;
  }

  .test-order-instructions {
    background: #f0fdf4;
    border-left: 4px solid var(--color-sf-green-normal);
    padding: 1rem;
    border-radius: 4px;
  }

  .instructions-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-sf-green-normal);
    margin-bottom: 0.5rem;
  }

  .instructions-header i {
    font-size: 1.25rem;
  }

  .test-order-instructions p {
    margin: 0;
    color: #374151;
    line-height: 1.6;
  }

  .test-order-actions {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    background: #f9fafb;
    border-top: 1px solid #f3f4f6;
  }

  /* Estado vacío */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
  }

  .test-orders-info {
    margin-top: 2rem;
  }

  .info-content {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .info-text {
    flex: 1;
  }

  .info-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
  }

  .info-description {
    color: #718096;
    margin: 0;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .patient-test-orders-view {
      padding: 1rem;
    }

    .test-orders-content {
      padding: 1rem;
    }

    .filters-section {
      padding: 1rem;
    }

    .filters-row {
      grid-template-columns: 1fr;
    }

    .filter-actions {
      align-items: stretch;
    }

    .test-orders-actions {
      flex-direction: column;
    }

    .test-orders-actions button {
      width: 100%;
    }

    .test-order-header {
      flex-wrap: wrap;
    }

    .test-order-status {
      width: 100%;
      justify-content: flex-start;
    }

    .test-order-actions {
      flex-direction: column;
    }

    .test-order-actions button {
      width: 100%;
    }
  }
</style>

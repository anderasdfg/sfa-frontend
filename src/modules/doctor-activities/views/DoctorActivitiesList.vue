<template>
  <div class="doctor-activities-view">
    <!-- Header con título y acciones -->
    <!-- Título removido para integración con MainLayout -->

    <!-- Estado de carga -->
    <div v-if="loading && activities.length === 0" class="loading-state">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="text-gray-600 mt-3">Cargando tus citas...</p>
    </div>

    <!-- Mensaje de error -->
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
      <template #icon>
        <i class="pi pi-exclamation-circle"></i>
      </template>
    </Message>

    <!-- Lista de citas -->
    <div v-else class="appointments-list-container">
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
            <label class="filter-label">Tipo</label>
            <Dropdown
              v-model="filters.type"
              :options="typeOptions"
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

        <div class="appointments-actions">
          <Button
            label="Actualizar"
            icon="pi pi-refresh"
            @click="refreshActivities"
            :loading="loading"
            class="p-button-outlined"
          />
        </div>
      </div>

      <!-- Lista de citas filtradas -->
      <div v-if="filteredActivities.length > 0" class="appointments-list">
        <DoctorActivityCard
          v-for="activity in filteredActivities"
          :key="`${activity.type}-${activity.id}`"
          :activity="activity"
          @view-details="handleViewDetails"
          @start-consultation="handleStartConsultation"
          @start-test-processing="handleStartTestProcessing"
          @complete-test-processing="handleCompleteTestProcessing"
          @upload-results="handleUploadResults"
        />
      </div>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <i class="pi pi-calendar text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">
          {{ hasActiveFilters 
            ? 'No se encontraron citas con los filtros aplicados' 
            : 'No tienes citas programadas en este momento' 
          }}
        </p>
      </div>
    </div>

    <!-- Modal de detalles de Test Order -->
    <TestOrderDetailsModal
      :visible="testOrderDetailsVisible"
      :test-order-id="selectedTestOrderId"
      @update:visible="testOrderDetailsVisible = $event"
      @schedule-slot="handleScheduleSlot"
    />

    <!-- Modal de subida de resultados -->
    <TestOrderUploadModal
      :visible="uploadModalVisible"
      :test-order="selectedTestOrderForUpload"
      @update:visible="uploadModalVisible = $event"
      @upload-success="handleUploadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDoctorAppointments } from '@/modules/user-roles/doctor/composables/useDoctorAppointments'
  import type { DoctorActivityItem } from '@/modules/user-roles/doctor/composables/useDoctorAppointments'
  import { useDoctorActivityActions } from '@/modules/user-roles/doctor/composables/useDoctorActivityActions'
  import { useDoctorActivityFilters } from '@/modules/user-roles/doctor/composables/useDoctorActivityFilters'
  import DoctorActivityCard from '@/modules/doctor-activities/components/DoctorActivityCard.vue'
  import TestOrderDetailsModal from '@/modules/test-orders/components/TestOrderDetailsModal.vue'
  import TestOrderUploadModal from '@/modules/test-orders/components/TestOrderUploadModal.vue'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner'
  import Message from 'primevue/message'
  import Calendar from 'primevue/calendar'
  import Dropdown from 'primevue/dropdown'

  const router = useRouter()

  const { 
    todayActivities, 
    loading, 
    error, 
    fetchTodayActivities,
    fetchDoctorAppointments,
    fetchDoctorTestOrders 
  } = useDoctorAppointments()

  // Composable para las acciones de actividades
  const {
    startConsultation,
    startTestProcessing,
    completeTestProcessing,
    viewDetails
  } = useDoctorActivityActions()

  // Composable para filtros y utilidades
  const {
    typeOptions,
    statusOptions,
    matchesStatusFilter
  } = useDoctorActivityFilters()

  // Estado de filtros
  const filters = ref({
    date: new Date(), // Por defecto mostrar el día de hoy
    type: null as string | null,
    status: null as string | null
  })

  // Activities fusionadas (hoy + otras fechas)
  const activities = ref<DoctorActivityItem[]>([])

  // Estado para el modal de detalles de test order
  const testOrderDetailsVisible = ref(false)
  const selectedTestOrderId = ref<number | null>(null)
  
  // Estado para el modal de subida de archivos
  const uploadModalVisible = ref(false)
  const selectedTestOrderForUpload = ref<DoctorActivityItem | null>(null)

  // Computed properties para estadísticas
  const filteredActivities = computed(() => {
    let filtered = [...activities.value]

    // Filtro por fecha
    if (filters.value.date) {
      const selectedDate = new Date(filters.value.date)
      selectedDate.setHours(0, 0, 0, 0)

      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.scheduled_at)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate.getTime() === selectedDate.getTime()
      })
    }

    // Filtro por tipo
    if (filters.value.type) {
      filtered = filtered.filter(activity => activity.type === filters.value.type)
    }

    // Filtro por estado (usando estados agrupados)
    if (filters.value.status) {
      filtered = filtered.filter(activity => matchesStatusFilter(activity, filters.value.status!))
    }

    // Ordenar por hora programada
    return filtered.sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )
  })





  const hasActiveFilters = computed(() => {
    // No considerar la fecha como filtro activo si es hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const filterDate = filters.value.date ? new Date(filters.value.date) : null
    filterDate?.setHours(0, 0, 0, 0)
    
    const hasDateFilter = filterDate && filterDate.getTime() !== today.getTime()
    return !!(hasDateFilter || filters.value.type || filters.value.status)
  })

  // Funciones
  const refreshActivities = async () => {
    const selectedDate = filters.value.date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate) {
      const filterDate = new Date(selectedDate)
      filterDate.setHours(0, 0, 0, 0)
      
      if (filterDate.getTime() === today.getTime()) {
        // Si es hoy, usar la función optimizada
        await fetchTodayActivities()
        activities.value = [...todayActivities.value]
      } else {
        // Si es otra fecha, cargar por separado (puedes implementar funciones específicas)
        await Promise.all([fetchDoctorAppointments(), fetchDoctorTestOrders()])
        // Aquí deberías filtrar las actividades por la fecha seleccionada
        // Por ahora, usamos las de hoy como fallback
        activities.value = [...todayActivities.value]
      }
    } else {
      await fetchTodayActivities()
      activities.value = [...todayActivities.value]
    }
  }

  const applyFilters = () => {
    // Los filtros se aplican automáticamente a través del computed
    // Si se cambia la fecha, refrescar datos
    if (filters.value.date) {
      refreshActivities()
    }
  }

  const clearFilters = () => {
    filters.value = {
      date: new Date(), // Resetear a hoy
      type: null,
      status: null
    }
    refreshActivities()
  }

  // Handlers que usan el composable y actualizan el estado local
  const handleViewDetails = (activity: DoctorActivityItem) => {
    if (activity.type === 'test_order') {
      // Para test orders, abrir el modal de detalles
      selectedTestOrderId.value = activity.id
      testOrderDetailsVisible.value = true
    } else {
      // Para citas médicas, usar el handler original
      viewDetails(activity)
    }
  }

  const handleStartConsultation = async (activity: DoctorActivityItem) => {
    const success = await startConsultation(activity, (updatedActivity) => {
      // Actualizar localmente el estado
      const activityIndex = activities.value.findIndex(a => a.type === 'appointment' && a.id === activity.id)
      if (activityIndex !== -1) {
        activities.value[activityIndex].status = updatedActivity.status
      }
    })

    // Siempre navegar a consulta después de cambiar el estado exitosamente
    if (success) {
      router.push(`/appointments/${activity.id}/prepare`)
    }
  }

  const handleStartTestProcessing = async (activity: DoctorActivityItem) => {
    await startTestProcessing(activity, (updatedActivity) => {
      // Actualizar localmente el estado
      const activityIndex = activities.value.findIndex(a => a.type === 'test_order' && a.id === activity.id)
      if (activityIndex !== -1) {
        activities.value[activityIndex].status = updatedActivity.status
      }
    })
  }

  const handleCompleteTestProcessing = async (activity: DoctorActivityItem) => {
    await completeTestProcessing(activity, (updatedActivity) => {
      // Actualizar localmente el estado
      const activityIndex = activities.value.findIndex(a => a.type === 'test_order' && a.id === activity.id)
      if (activityIndex !== -1) {
        activities.value[activityIndex].status = updatedActivity.status
      }
    })
  }

  const handleUploadResults = async (activity: DoctorActivityItem) => {
    // Abrir el modal de subida con la actividad seleccionada
    selectedTestOrderForUpload.value = activity
    uploadModalVisible.value = true
  }

  const handleScheduleSlot = (testOrder: any) => {
    // Cerrar el modal de detalles
    testOrderDetailsVisible.value = false
    selectedTestOrderId.value = null
    
    // Aquí puedes agregar lógica para abrir el modal de selección de slots
    console.log('Programar slot para test order:', testOrder)
  }

  const handleUploadSuccess = (testOrder: any, fileInfo: any) => {
    // Cerrar el modal de subida
    uploadModalVisible.value = false
    selectedTestOrderForUpload.value = null
    
    // Actualizar el estado del test order en la lista
    const activityIndex = activities.value.findIndex(a => 
      a.type === 'test_order' && a.id === testOrder.id
    )
    
    if (activityIndex !== -1) {
      // Cambiar el estado a "completado" después de subir resultados
      activities.value[activityIndex].status = 'completado'
    }

    // Mostrar información detallada del archivo subido
    console.log('📁 Archivo subido exitosamente:')
    console.log('📄 Archivo:', fileInfo.fileName)
    console.log('🔗 URL:', fileInfo.url)
    console.log('📊 Tamaño:', fileInfo.size, 'bytes')
    console.log('🆔 Test Result ID:', fileInfo.testResultId)
    console.log('📝 Resumen:', fileInfo.resultSummary)
    
    // Refrescar la lista para obtener los datos más actuales
    refreshActivities()
  }

  // Lifecycle
  onMounted(async () => {
    await refreshActivities()
  })
</script>

<style scoped>
  .doctor-activities-view {
    max-width: 1200px;
    margin: 0 auto;
  }

  .appointments-list-container {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
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

  .appointments-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  /* Lista de citas */
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  /* Responsive */
  @media (max-width: 768px) {
    .doctor-activities-view {
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

    .appointments-actions {
      flex-direction: column;
    }

    .appointments-actions button {
      width: 100%;
    }


  }
</style>
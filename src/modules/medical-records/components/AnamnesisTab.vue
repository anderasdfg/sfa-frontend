<template>
  <div class="anamnesis-tab">
    <div class="anamnesis-layout">
      <div class="complaints-section">
        <Card>
          <template #header>
            <div class="section-header">
              <div>
                <h3 class="section-title">Motivo de consulta</h3>
                <p class="section-subtitle">
                  Selecciona o agrega manualmente las molestias que presenta el paciente
                </p>
              </div>
              <Button icon="pi pi-file-edit" text rounded severity="primary" v-tooltip="'Editar'" />
            </div>
          </template>
          <template #content>
            <!-- Search/Add Complaint -->
            <div class="search-section">
              <AutoComplete
                v-model="searchValue"
                :suggestions="suggestions"
                @complete="handleSearch"
                @item-select="handleSelectSuggestion"
                placeholder="Buscar quejas..."
                class="w-full"
                dropdown
                completeOnFocus
              >
                <template #option="slotProps">
                  <div class="suggestion-item">{{ slotProps.option }}</div>
                </template>
              </AutoComplete>

              <div class="custom-complaint-input mt-3">
                <InputText
                  v-model="customComplaint"
                  placeholder="O escribe una queja personalizada..."
                  class="w-full"
                  @keyup.enter="handleAddCustom"
                />
                <Button
                  icon="pi pi-plus"
                  label="Agregar"
                  @click="handleAddCustom"
                  :disabled="!customComplaint.trim()"
                  size="small"
                />
              </div>
            </div>

            <!-- Selected Complaints Display -->
            <div v-if="hasComplaints" class="selected-complaints mt-4">
              <div class="complaints-header">
                <h4 class="complaints-title">Quejas seleccionadas</h4>
                <Button
                  label="Limpiar todo"
                  text
                  size="small"
                  severity="danger"
                  @click="clearComplaints"
                />
              </div>
              <div class="complaints-chips">
                <Chip
                  v-for="complaint in selectedComplaints"
                  :key="complaint"
                  :label="complaint"
                  removable
                  @remove="removeComplaint(complaint)"
                  class="complaint-chip"
                />
              </div>
            </div>

            <div v-else class="empty-complaints">
              <i class="pi pi-inbox text-3xl text-gray-300"></i>
              <p class="text-gray-500 mt-2">No hay quejas seleccionadas</p>
            </div>
          </template>
        </Card>
      </div>

      <div class="suggestions-section">
        <Card class="suggestions-card">
          <template #header>
            <div class="suggestions-header">
              <div class="flex items-center gap-2">
                <i class="pi pi-lightbulb text-xl"></i>
                <h3 class="suggestions-title">Sugerencias</h3>
              </div>
              <p class="suggestions-subtitle">
                Selecciona plantillas según la categoría del paciente
              </p>
            </div>
          </template>
          <template #content>
            <!-- Category Selection -->
            <div class="category-filter mb-3">
              <Select
                v-model="selectedCategory"
                :options="complaintCategories"
                optionLabel="name"
                optionValue="id"
                placeholder="Seleccionar categoría..."
                class="w-full"
                showClear
              />
            </div>

            <!-- Category Complaints Templates -->
            <div v-if="selectedCategory" class="category-complaints">
              <div v-for="category in filteredCategories" :key="category.id" class="category-group">
                <div class="category-group-header">
                  <h4 class="category-name">{{ category.name }}</h4>
                  <div class="category-actions">
                    <Button
                      icon="pi pi-check-square"
                      text
                      rounded
                      size="small"
                      v-tooltip="'Seleccionar todos'"
                      @click="selectAllFromCategory(category.id)"
                    />
                  </div>
                </div>
                <div class="category-complaints-list">
                  <Chip
                    v-for="complaint in category.complaints"
                    :key="complaint"
                    :label="complaint"
                    :class="['suggestion-chip', { selected: isComplaintSelected(complaint) }]"
                    @click="toggleComplaint(complaint)"
                  />
                </div>
              </div>
            </div>

            <!-- All Categories -->
            <div v-else class="all-categories">
              <div
                v-for="category in complaintCategories"
                :key="category.id"
                class="category-group"
              >
                <div class="category-group-header">
                  <h4 class="category-name">{{ category.name }}</h4>
                  <div class="category-actions">
                    <Button
                      icon="pi pi-check-square"
                      text
                      rounded
                      size="small"
                      v-tooltip="'Seleccionar todos'"
                      @click="selectAllFromCategory(category.id)"
                    />
                  </div>
                </div>
                <div class="category-complaints-list">
                  <Chip
                    v-for="complaint in category.complaints.slice(0, 6)"
                    :key="complaint"
                    :label="complaint"
                    :class="['suggestion-chip', { selected: isComplaintSelected(complaint) }]"
                    @click="toggleComplaint(complaint)"
                  />
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
        @click="handleSave"
        :disabled="!hasComplaints"
        :loading="saving"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import AutoComplete from 'primevue/autocomplete'
  import InputText from 'primevue/inputtext'
  import Chip from 'primevue/chip'
  import Select from 'primevue/select'
  import { useAnamnesis } from '../composables/useAnamnesis'
  import { COMPLAINT_CATEGORIES, type ComplaintCategory } from '../data/complaints.data'

  interface Props {
    consultationId: number
  }

  defineProps<Props>()

  const emit = defineEmits(['next-tab'])

  // Composable
  const {
    selectedComplaints,
    customComplaint,
    suggestions,
    hasComplaints,
    addComplaint,
    removeComplaint,
    clearComplaints,
    searchComplaints,
    toggleComplaint,
    isComplaintSelected,
    saveComplaints
  } = useAnamnesis()

  // Local State
  const searchValue = ref('')
  const selectedCategory = ref<string | null>(null)
  const saving = ref(false)
  const complaintCategories = ref<ComplaintCategory[]>(COMPLAINT_CATEGORIES)

  // Computed
  const filteredCategories = computed(() => {
    if (!selectedCategory.value) return complaintCategories.value

    return complaintCategories.value.filter(cat => cat.id === selectedCategory.value)
  })

  // Methods
  const handleSearch = (event: { query: string }) => {
    searchComplaints(event.query)
  }

  const handleSelectSuggestion = (event: any) => {
    addComplaint(event.value)
    searchValue.value = ''
  }

  const handleAddCustom = () => {
    if (customComplaint.value.trim()) {
      addComplaint(customComplaint.value)
    }
  }

  const selectAllFromCategory = (categoryId: string) => {
    const category = complaintCategories.value.find(cat => cat.id === categoryId)
    if (category) {
      category.complaints.forEach(complaint => {
        if (!isComplaintSelected(complaint)) {
          addComplaint(complaint)
        }
      })
    }
  }

  const handleSave = async () => {
    saving.value = true

    try {
      saveComplaints()
      emit('next-tab', 'diagnosis')
    } catch (error) {
      console.error('Error saving complaints:', error)
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped>
  .anamnesis-tab {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }

  .anamnesis-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    flex: 1;
  }

  /* Section Headers */
  .section-header {
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-light) 0%,
      var(--color-sf-green-normal) 100%
    );
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-radius: 1rem 1rem 0 0;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    border-radius: 1rem 1rem 0 0;
  }

  .section-subtitle {
    font-size: 0.875rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.95;
  }

  .suggestions-card {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 350px);
    max-height: 700px;
  }

  .suggestions-card :deep(.p-card-body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .suggestions-card :deep(.p-card-content) {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .suggestions-header {
    padding: 1.5rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .suggestions-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #1f2937;
  }

  .suggestions-subtitle {
    font-size: 0.8125rem;
    color: #6b7280;
    margin: 0.5rem 0 0 0;
  }

  /* Search Section */
  .search-section {
    margin-bottom: 1rem;
  }

  .custom-complaint-input {
    display: flex;
    gap: 0.75rem;
  }

  .suggestion-item {
    padding: 0.5rem 0;
    color: #374151;
  }

  /* Selected Complaints */
  .selected-complaints {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .complaints-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .complaints-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .complaints-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .complaint-chip {
    background: var(--color-sf-green-light) !important;
    color: white !important;
  }

  .empty-complaints {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    margin-top: 1rem;
  }

  /* Category Groups */
  .all-categories,
  .category-complaints {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .category-group {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .category-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .category-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .category-actions {
    display: flex;
    gap: 0.25rem;
  }

  .category-complaints-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
  }

  .suggestion-chip {
    cursor: pointer;
    transition: all 0.2s;
    background: #f3f4f6 !important;
    color: #6b7280 !important;
    border: 1px solid #d1d5db;
  }

  .suggestion-chip:hover {
    background: #e5e7eb !important;
    border-color: var(--color-sf-green-light);
  }

  .suggestion-chip.selected {
    background: var(--color-sf-green-light) !important;
    color: white !important;
    border-color: var(--color-sf-green-normal);
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
    .anamnesis-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .section-header {
      padding: 1rem;
    }

    .custom-complaint-input {
      flex-direction: column;
    }

    .custom-complaint-input button {
      width: 100%;
    }

    .category-complaints-list {
      padding: 0.75rem;
    }
  }
</style>

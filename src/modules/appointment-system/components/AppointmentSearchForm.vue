<template>
  <Card class="search-form-card">
    <template #content>
      <form @submit.prevent="handleSubmit" class="search-form">
        <div class="form-row">
          <div class="form-field">
            <label for="specialty" class="field-label">Especialidad</label>
            <Dropdown
              id="specialty"
              v-model="searchForm.specialty"
              :options="activeSpecialties"
              option-label="name"
              option-value="id"
              placeholder="Selecciona una especialidad"
              class="w-full"
              :loading="loadingSpecialties"
            />
          </div>
          <div class="form-field">
            <label for="date" class="field-label">Fecha</label>
            <Calendar
              id="date"
              v-model="searchForm.date"
              :min-date="minDate"
              :max-date="maxDate"
              placeholder="dd/mm/yyyy"
              date-format="dd/mm/yy"
              class="w-full"
              :show-icon="true"
              icon="pi pi-calendar"
            />
          </div>
          <div class="form-field">
            <label for="doctor" class="field-label">Doctor</label>
            <Dropdown
              id="doctor"
              v-model="searchForm.doctor"
              :options="filteredDoctors"
              option-label="fullName"
              option-value="id"
              placeholder="Selecciona un doctor"
              class="w-full"
              :disabled="!searchForm.specialty"
              :loading="loadingDoctors"
            />
          </div>
          <div class="form-field">
            <Button
              type="submit"
              label="Buscar cita"
              icon="pi pi-search"
              class="search-button"
              :loading="loading"
              :disabled="!isFormValid"
            />
          </div>
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import Card from 'primevue/card'
  import Dropdown from 'primevue/dropdown'
  import Calendar from 'primevue/calendar'
  import Button from 'primevue/button'
  import { useSpecialties } from '@/core/composables/useSpecialties'
  import { useDoctors } from '@/core/composables/useDoctors'
  import type { AppointmentSlotQueryParams } from '@/types/slots.types'
  import { getCurrentDateInTimezone, formatDateToISO } from '@/shared/lib/formatters'

  // Props
  defineProps<{
    loading?: boolean
  }>()

  // Emits
  const emit = defineEmits<{
    search: [criteria: AppointmentSlotQueryParams]
  }>()

  // Form interface
  interface SearchForm {
    specialty: number | null
    doctor: number | null
    date: Date | null
  }

  // Composables
  const { activeSpecialties, loading: loadingSpecialties, loadSpecialties } = useSpecialties()
  const { getDoctorsBySpecialtyId, loading: loadingDoctors, loadDoctors } = useDoctors()

  // Reactive state
  const searchForm = ref<SearchForm>({
    specialty: null,
    doctor: null,
    date: null
  })

  // Computed
  const minDate = computed(() => {
    const today = new Date()
    return today
  })

  const maxDate = computed(() => {
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setMonth(today.getMonth() + 3) // 3 meses adelante
    return maxDate
  })

  // Filtrar doctores por especialidad seleccionada
  const filteredDoctors = computed(() => {
    if (!searchForm.value.specialty) return []
    return getDoctorsBySpecialtyId(searchForm.value.specialty)
  })

  const isFormValid = computed(() => {
    return searchForm.value.specialty //&& searchForm.value.date
  })

  // Methods

  const handleSubmit = () => {
    if (!isFormValid.value) return

    // Obtener las entidades seleccionadas
    const selectedSpecialty = activeSpecialties.value.find(s => s.id === searchForm.value.specialty)
    const selectedDoctor = filteredDoctors.value.find(d => d.id === searchForm.value.doctor)
    const criteria: AppointmentSlotQueryParams = {
      date: searchForm.value.date
        ? formatDateToISO(searchForm.value.date)
        : getCurrentDateInTimezone(),
      specialtyId: selectedSpecialty?.id || 0,
      doctorId: selectedDoctor?.id || null
    }

    emit('search', criteria)
  }

  // Watchers
  watch(
    () => searchForm.value.specialty,
    () => {
      // Reset doctor when specialty changes
      if (searchForm.value.doctor) {
        const doctorStillValid = filteredDoctors.value.some(
          doctor => doctor.id === searchForm.value.doctor
        )
        if (!doctorStillValid) {
          searchForm.value.doctor = null
        }
      }
    }
  )

  // Lifecycle
  onMounted(() => {
    loadSpecialties()
    loadDoctors()
  })
</script>

<style scoped>
  .search-form-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border: none;
  }

  .search-form {
    padding: 0;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 1.5rem;
    align-items: end;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .field-label {
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .search-button {
    background: var(--color-sf-green-normal);
    border: none;
    padding: 0.75rem 2rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .search-button:hover {
    background: var(--color-sf-green-dark);
  }

  .search-button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  /* Override PrimeVue styles */
  :deep(.p-dropdown),
  :deep(.p-calendar) {
    border-color: #e2e8f0;
  }

  :deep(.p-dropdown:not(.p-disabled):hover),
  :deep(.p-calendar:not(.p-disabled):hover) {
    border-color: var(--color-sf-green-light);
  }

  :deep(.p-dropdown:not(.p-disabled).p-focus),
  :deep(.p-calendar:not(.p-disabled).p-focus) {
    border-color: var(--color-sf-green-normal);
    box-shadow: 0 0 0 0.2rem rgba(109, 189, 119, 0.2);
  }

  @media (max-width: 1024px) {
    .form-row {
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .search-button {
      grid-column: 1 / -1;
      justify-self: center;
      min-width: 200px;
    }
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .search-button {
      width: 100%;
    }
  }
</style>

<template>
  <div class="doctor-card">
    <div class="doctor-info">
      <div class="doctor-avatar-section">
        <Avatar :image="doctor.avatar" size="xlarge" shape="circle" class="doctor-avatar" />
      </div>

      <div class="doctor-details">
        <h3 class="doctor-name">{{ doctor.name }}</h3>
        <p class="doctor-specialty">{{ doctor.specialtyName }}</p>
        <p class="doctor-cmp">{{ doctor.cmp }}</p>

        <div class="consultation-info">
          <Tag
            v-if="filteredSlots[0]?.schedule_modality"
            :value="filteredSlots[0]?.schedule_modality"
            :severity="
              filteredSlots[0]?.schedule_modality === AppointmentModality.TELECONSULTA ? 'info' : 'success'
            "
            class="consultation-tag"
          />
          <p class="doctor-location">{{ doctor.location }}</p>
        </div>
      </div>
    </div>

    <div class="availability-section">
      <div class="date-selector">
        <div class="date-tabs">
          <button
            v-for="date in availableDates"
            :key="date.value"
            @click="selectedDateTab = date.value"
            :class="['date-tab', { active: selectedDateTab === date.value }]"
          >
            <span class="date-day">{{ date.day }}</span>
            <span class="date-number">{{ date.number }}</span>
          </button>
        </div>
      </div>

      <div class="time-slots">
        <div v-if="filteredSlots.length === 0" class="no-slots-message">
          <i class="pi pi-calendar-times"></i>
          <p>No hay horarios disponibles para esta fecha</p>
        </div>
        <div v-else-if="!hasAvailableSlots" class="no-available-slots-message">
          <i class="pi pi-clock"></i>
          <p>Todos los horarios están ocupados para esta fecha</p>
        </div>
        <div v-else class="slots-grid">
          <button
            v-for="slot in filteredSlots"
            :key="slot.time"
            @click="selectSlot(slot)"
            :disabled="!slot.available"
            :class="[
              'time-slot',
              {
                available: slot.available,
                occupied: !slot.available
              }
            ]"
          >
            <span class="slot-time">{{ slot.time }}</span>
            <span class="slot-price">S/ {{ slot.price }}</span>
            <span v-if="!slot.available" class="slot-status">Ocupado</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import Avatar from 'primevue/avatar'
  import Tag from 'primevue/tag'
  import type { Doctor, TimeSlot, AppointmentSelection } from '../types'
  import { generateAvailableDates } from '@/shared/lib/formatters'
  import { AppointmentModality } from '@/types/enums'
  import { useAuthStore } from '@/stores/auth/authStore'

  // Props
  const props = defineProps<{
    doctor: Doctor
    selectedDate: string
  }>()
  console.log('Doctor:', props.doctor)
  console.log('Selected date from props:', props.selectedDate)

  // Emits
  const emit = defineEmits<{
    selectAppointment: [appointment: AppointmentSelection]
  }>()

  // Stores
  const authStore = useAuthStore()

  // Reactive state
  const selectedDateTab = ref('')

  // Computed
  const availableDates = computed(() => {
    const dates = generateAvailableDates(props.selectedDate, 7)

    // Inicializar fecha seleccionada si no existe
    if (!selectedDateTab.value) {
      selectedDateTab.value = props.selectedDate || dates[0]?.value || ''
    }

    console.log('Generated dates:', dates)
    console.log('Selected date tab:', selectedDateTab.value)

    return dates
  })

  // Computed para filtrar slots por fecha seleccionada
  const filteredSlots = computed(() => {
    if (!selectedDateTab.value) return props.doctor.availableSlots

    return props.doctor.availableSlots.filter(slot => {
      return slot.date === selectedDateTab.value
    })
  })

  // Computed para verificar si hay slots disponibles para la fecha seleccionada
  const hasAvailableSlots = computed(() => {
    return filteredSlots.value.some(slot => slot.available)
  })

  // Watchers
  watch(
    () => props.selectedDate,
    newDate => {
      if (newDate) {
        selectedDateTab.value = newDate
      }
    },
    { immediate: true }
  )

  // Methods
  const selectSlot = (slot: TimeSlot) => {
    if (!slot.available) return

    const appointment: AppointmentSelection = {
      doctorId: props.doctor.id,
      patientId: authStore.user?.patient_id || 0, // 0 si no está autenticado
      slotId: slot.id,
      appointmentDate: slot.date,
      modality: slot.schedule_modality,
      // Información adicional para mostrar en UI
      time: slot.time,
      price: slot.price,
      doctorName: props.doctor.name,
      doctorSpecialty: props.doctor.specialtyName,
      doctorAvatar: props.doctor.avatar,
      doctorLocation: slot.schedule_modality === 'teleconsulta' ? 'Virtual' : 'Los Olivos',
    }

    emit('selectAppointment', appointment)
  }
</script>

<style scoped>
  @import '../styles/DoctorAvailabilityCard.css';
</style>

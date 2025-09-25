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
            :value="doctor.consultationType"
            :severity="doctor.consultationType === 'TELECONSULTA' ? 'info' : 'success'"
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
  import type { Doctor, TimeSlot } from '../types'

  // Props
  const props = defineProps<{
    doctor: Doctor
    selectedDate: string
  }>()

  // Emits
  const emit = defineEmits<{
    selectAppointment: [appointment: TimeSlot & { doctor: Doctor }]
  }>()

  // Reactive state
  const selectedDateTab = ref('')

  // Computed
  const availableDates = computed(() => {
    // Usar la fecha seleccionada del formulario como base
    const baseDate = props.selectedDate ? new Date(props.selectedDate) : new Date()
    const dates = []

    // Generar fechas disponibles (próximos 7 días desde la fecha seleccionada)
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + i)

      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

      dates.push({
        value: date.toISOString().split('T')[0],
        day: dayNames[date.getDay()],
        number: date.getDate().toString()
      })
    }

    // Seleccionar la fecha del formulario por defecto
    if (props.selectedDate) {
      selectedDateTab.value = props.selectedDate
    } else if (!selectedDateTab.value && dates.length > 0) {
      selectedDateTab.value = dates[0].value
    }

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

    const appointment = {
      ...slot,
      doctor: props.doctor
    }

    emit('selectAppointment', appointment)
  }
</script>

<style scoped>
  .doctor-card {
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background: white;
    transition: box-shadow 0.3s ease;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .doctor-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .doctor-info {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .doctor-avatar-section {
    flex-shrink: 0;
  }

  .doctor-avatar {
    width: 80px;
    height: 80px;
    border: 3px solid var(--color-sf-green-light);
  }

  .doctor-details {
    flex: 1;
  }

  .doctor-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 0.25rem;
  }

  .doctor-specialty {
    font-size: 1rem;
    color: #64748b;
    margin-bottom: 0.25rem;
  }

  .doctor-cmp {
    font-size: 0.9rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .consultation-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .consultation-tag {
    align-self: flex-start;
    font-weight: 600;
  }

  .doctor-location {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.4;
  }

  .availability-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .date-tabs {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .date-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 60px;
    flex-shrink: 0;
  }

  .date-tab:hover {
    border-color: var(--color-sf-green-light);
  }

  .date-tab.active {
    border-color: var(--color-sf-green-normal);
    background: var(--color-sf-green-normal);
    color: white;
  }

  .date-day {
    font-size: 0.75rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .date-number {
    font-size: 1rem;
    font-weight: 600;
  }

  .slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .time-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .time-slot.available {
    border-color: var(--color-sf-green-light);
    background: #f0fdf4;
  }

  .time-slot.available:hover {
    border-color: var(--color-sf-green-normal);
    background: var(--color-sf-green-normal);
    color: white;
    transform: translateY(-2px);
  }

  .time-slot.occupied {
    border-color: #fca5a5;
    background: #fef2f2;
    color: #991b1b;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .slot-time {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .slot-price {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .slot-status {
    position: absolute;
    bottom: 0.25rem;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .no-slots-message,
  .no-available-slots-message {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }

  .no-slots-message i,
  .no-available-slots-message i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #94a3b8;
  }

  .no-slots-message p,
  .no-available-slots-message p {
    margin: 0;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .doctor-info {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .doctor-avatar {
      width: 60px;
      height: 60px;
    }

    .slots-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5rem;
    }

    .time-slot {
      padding: 0.5rem 0.25rem;
    }
  }
</style>

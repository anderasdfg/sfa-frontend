<template>
  <div class="doctors-list">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Gestión de Médicos</h1>
        <p class="page-description">Administra la información de los médicos de la clínica</p>
      </div>
      <div class="header-actions">
        <Button
          label="Nuevo Médico"
          icon="pi pi-plus"
          class="p-button-success"
          @click="createDoctor"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="search-container">
        <span class="p-input-icon-left">
          <InputText
            v-model="searchQuery"
            placeholder="Buscar médicos..."
            class="search-input"
            @input="filterDoctors"
          />
        </span>
      </div>
      <div class="filter-actions">
        <Dropdown
          v-model="selectedSpecialty"
          :options="specialties"
          optionLabel="name"
          optionValue="value"
          placeholder="Todas las especialidades"
          class="specialty-filter"
          @change="filterDoctors"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Cargando médicos...</p>
    </div>

    <!-- Doctors Grid -->
    <div v-else-if="filteredDoctors.length > 0" class="doctors-grid">
      <div
        v-for="doctor in filteredDoctors"
        :key="doctor.id"
        class="doctor-card"
        @click="viewDoctor(String(doctor.id))"
      >
        <div class="doctor-avatar">
          <Avatar
            :label="getDoctorInitials(doctor)"
            size="large"
            shape="circle"
            :style="{ backgroundColor: getAvatarColor(String(doctor.id)), color: '#ffffff' }"
          />
        </div>
        <div class="doctor-info">
          <h3 class="doctor-name">
            {{ doctor.first_name || 'Sin nombre' }} {{ doctor.last_name || '' }}
          </h3>
          <p class="doctor-specialty">{{ doctor.specialty_name || 'Sin especialidad' }}</p>
          <!-- <p class="doctor-email">{{ doctor.email || 'Sin email' }}</p>
          <div class="doctor-status">
            <Tag
              :value="
                doctor.is_active !== undefined
                  ? doctor.is_active
                    ? 'Activo'
                    : 'Inactivo'
                  : 'Sin estado'
              "
              :severity="
                doctor.is_active !== undefined
                  ? doctor.is_active
                    ? 'success'
                    : 'danger'
                  : 'warning'
              "
            />
          </div> -->
        </div>
        <div class="doctor-actions">
          <Button
            icon="pi pi-pencil"
            class="p-button-text p-button-sm"
            @click.stop="editDoctor(String(doctor.id))"
            v-tooltip="'Editar médico'"
          />
          <Button
            icon="pi pi-eye"
            class="p-button-text p-button-sm"
            @click.stop="viewDoctor(String(doctor.id))"
            v-tooltip="'Ver detalles'"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="pi pi-users empty-icon"></i>
      <h3>No se encontraron médicos</h3>
      <p>
        {{
          searchQuery
            ? 'No hay médicos que coincidan con tu búsqueda'
            : 'Aún no hay médicos registrados'
        }}
      </p>
      <Button
        v-if="!searchQuery"
        label="Agregar primer médico"
        icon="pi pi-plus"
        class="p-button-outlined"
        @click="createDoctor"
      />
    </div>

    <!-- Create Doctor Modal -->
    <CreateDoctorModal v-model="showCreateModal" @doctor-created="onDoctorCreated" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import Dropdown from 'primevue/dropdown'
  import ProgressSpinner from 'primevue/progressspinner'
  import Avatar from 'primevue/avatar'
  import { useToast } from 'primevue/usetoast'
  import type { Doctor } from '@/types/doctor.types'
  import { DoctorService } from '@/services/doctors.service'
  import {
    getDoctorInitials,
    getAvatarColor,
    filterDoctorsBySearch,
    filterDoctorsBySpecialty,
    getUniqueSpecialties
  } from '../utils/doctor.utils'
  import CreateDoctorModal from '../components/CreateDoctorModal.vue'

  const router = useRouter()
  const toast = useToast()

  // State
  const doctors = ref<Doctor[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const selectedSpecialty = ref('')
  const showCreateModal = ref(false)

  // Computed
  const specialties = computed(() => {
    return getUniqueSpecialties(doctors.value)
  })

  const filteredDoctors = computed(() => {
    let filtered = doctors.value

    // Filtrar por búsqueda
    filtered = filterDoctorsBySearch(filtered, searchQuery.value)

    // Filtrar por especialidad
    filtered = filterDoctorsBySpecialty(filtered, selectedSpecialty.value)

    return filtered
  })

  // Methods
  const loadDoctors = async () => {
    loading.value = true
    try {
      doctors.value = await DoctorService.getDoctors()
      console.log('Doctors loaded:', doctors.value) // Debug: ver estructura de datos
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los médicos',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  const filterDoctors = () => {
    // Filtrado reactivo manejado por computed
  }

  // Las funciones getDoctorInitials y getAvatarColor ahora se importan desde utils

  const createDoctor = () => {
    showCreateModal.value = true
  }

  const onDoctorCreated = () => {
    // Recargar la lista de doctores después de crear uno nuevo
    loadDoctors()
  }

  const viewDoctor = (id: string) => {
    router.push(`/admin/doctors/${id}`)
  }

  const editDoctor = (id: string) => {
    router.push(`/admin/doctors/${id}/edit`)
  }

  // Lifecycle
  onMounted(() => {
    loadDoctors()
  })
</script>

<style scoped src="../styles/AdminDoctorsList.css"></style>

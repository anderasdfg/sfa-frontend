<template>
  <div class="doctor-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Cargando información del médico...</p>
    </div>

    <!-- Doctor Detail Content -->
    <div v-else-if="doctor" class="detail-content">
      <!-- Header -->
      <div class="detail-header">
        <Button icon="pi pi-arrow-left" class="p-button-text" @click="goBack" label="Volver" />
        <div class="header-actions">
          <Button
            v-if="!isEditing"
            label="Editar"
            icon="pi pi-pencil"
            class="p-button-outlined"
            @click="toggleEdit"
          />
          <template v-else>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              class="p-button-outlined p-button-secondary"
              @click="cancelEdit"
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              class="p-button-success"
              @click="saveDoctor"
              :loading="saving"
            />
          </template>
        </div>
      </div>

      <!-- Doctor Info Card -->
      <div class="doctor-card">
        <div class="doctor-header">
          <div class="doctor-avatar">
            <Avatar
              :label="getDoctorInitialsWrapper()"
              size="xlarge"
              shape="circle"
              :style="{ backgroundColor: getAvatarColorWrapper(), color: '#ffffff' }"
            />
          </div>
          <div class="doctor-basic-info">
            <h1 v-if="!isEditing" class="doctor-name">
              {{ doctor.first_name }} {{ doctor.last_name }}
            </h1>
            <div v-else class="name-inputs">
              <div class="input-group">
                <label>Nombre</label>
                <InputText v-model="editForm.first_name" placeholder="Nombre" />
              </div>
              <div class="input-group">
                <label>Apellido</label>
                <InputText v-model="editForm.last_name" placeholder="Apellido" />
              </div>
            </div>

            <p v-if="!isEditing" class="doctor-specialty">{{ doctor.specialty_name }}</p>
            <div v-else class="input-group">
              <label>Especialidad</label>
              <InputText v-model="editForm.specialty_name" placeholder="Especialidad" />
            </div>

            <div class="doctor-status">
              <Tag
                :value="(isEditing ? editForm.is_active : doctor.is_active) ? 'Activo' : 'Inactivo'"
                :severity="
                  (isEditing ? editForm.is_active : doctor.is_active) ? 'success' : 'danger'
                "
              />
              <ToggleButton
                v-if="isEditing"
                v-model="editForm.is_active"
                onLabel="Activo"
                offLabel="Inactivo"
                class="status-toggle"
              />
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="info-section">
          <h3>Información de Contacto</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <p v-if="!isEditing">{{ doctor.email }}</p>
              <InputText v-else v-model="editForm.email" placeholder="Email" />
            </div>
            <div class="info-item">
              <label>Teléfono</label>
              <p v-if="!isEditing">{{ doctor.phone || 'No especificado' }}</p>
              <InputText v-else v-model="editForm.phone" placeholder="Teléfono" />
            </div>
          </div>
        </div>

        <!-- Professional Information -->
        <div class="info-section">
          <h3>Información Profesional</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Número de Licencia</label>
              <p v-if="!isEditing">{{ doctor.license_number || 'No especificado' }}</p>
              <InputText
                v-else
                v-model="editForm.license_number"
                placeholder="Número de licencia"
              />
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="timestamps">
          <p>
            <strong>Creado:</strong>
            {{ formatDate(doctor.created_at || '') }}
          </p>
          <p>
            <strong>Actualizado:</strong>
            {{ formatDate(doctor.updated_at || '') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <i class="pi pi-exclamation-triangle error-icon"></i>
      <h3>Error al cargar el médico</h3>
      <p>No se pudo encontrar la información del médico solicitado</p>
      <Button label="Volver" icon="pi pi-arrow-left" @click="goBack" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import ToggleButton from 'primevue/togglebutton'
  import ProgressSpinner from 'primevue/progressspinner'
  import Avatar from 'primevue/avatar'
  import Tag from 'primevue/tag'
  import { useToast } from 'primevue/usetoast'
  import type { Doctor } from '@/types/doctor.types'
  import { DoctorService } from '@/services/doctors.service'
  import { getDoctorInitials, getAvatarColor, formatDate } from '../utils/doctor.utils'

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  // State
  const doctor = ref<Doctor | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const isEditing = ref(false)
  const editForm = ref<Doctor>({} as Doctor)

  // Computed
  const doctorId = computed(() => route.params.id as string)

  // Methods
  const loadDoctor = async () => {
    loading.value = true
    try {
      doctor.value = await DoctorService.getDoctorById(doctorId.value)
      resetEditForm()
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la información del médico',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  const resetEditForm = () => {
    if (doctor.value) {
      editForm.value = { ...doctor.value }
    }
  }

  const toggleEdit = () => {
    isEditing.value = true
    resetEditForm()
  }

  const cancelEdit = () => {
    isEditing.value = false
    resetEditForm()
  }

  const saveDoctor = async () => {
    saving.value = true
    try {
      const updatedDoctor = await DoctorService.updateDoctor(doctorId.value, editForm.value)
      doctor.value = updatedDoctor
      isEditing.value = false

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Información del médico actualizada correctamente',
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar la información del médico',
        life: 3000
      })
    } finally {
      saving.value = false
    }
  }

  // Funciones wrapper para usar las utilidades con el doctor actual
  const getDoctorInitialsWrapper = () => {
    if (!doctor.value) return ''
    return getDoctorInitials(doctor.value)
  }

  const getAvatarColorWrapper = () => {
    if (!doctor.value) return '#059669'
    return getAvatarColor(doctor.value.id)
  }

  const goBack = () => {
    router.push('/admin/doctors')
  }

  // Lifecycle
  onMounted(() => {
    loadDoctor()
  })
</script>

<style scoped src="../styles/AdminDoctorDetail.css"></style>

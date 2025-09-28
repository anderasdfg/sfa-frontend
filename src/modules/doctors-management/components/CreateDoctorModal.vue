<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Crear Nuevo Médico"
    :style="{ width: '600px' }"
    :closable="!loading"
    @hide="resetForm"
  >
    <form @submit.prevent="handleSubmit" class="create-doctor-form">
      <!-- Información Personal -->
      <div class="form-section">
        <h4>Información Personal</h4>
        <div class="form-grid">
          <div class="form-field">
            <label for="first_name">Nombres *</label>
            <InputText
              id="first_name"
              v-model="form.first_name"
              placeholder="Nombres"
              :class="{ 'p-invalid': errors.first_name && touched.first_name }"
              @blur="onFieldBlur('first_name')"
              @input="() => touched.first_name && validateField('first_name', form.first_name)"
              autocomplete="given-name"
            />
            <small v-if="errors.first_name && touched.first_name" class="p-error">
              <i class="pi pi-exclamation-circle mr-1"></i>
              {{ errors.first_name }}
            </small>
          </div>

          <div class="form-field">
            <label for="last_name">Apellidos *</label>
            <InputText
              id="last_name"
              v-model="form.last_name"
              placeholder="Apellidos"
              :class="{ 'p-invalid': errors.last_name && touched.last_name }"
              @blur="onFieldBlur('last_name')"
              @input="() => touched.last_name && validateField('last_name', form.last_name)"
              autocomplete="given-name"
            />
            <small v-if="errors.last_name && touched.last_name" class="p-error">
              <i class="pi pi-exclamation-circle mr-1"></i>
              {{ errors.last_name }}
            </small>
          </div>

          <div class="form-field">
            <label for="email">Correo Electrónico *</label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Correo electrónico"
              :class="{ 'p-invalid': errors.email && touched.email }"
              @blur="onFieldBlur('email')"
              @input="() => touched.email && validateField('email', form.email)"
              autocomplete="email"
            />
            <small v-if="errors.email && touched.email" class="p-error">
              <i class="pi pi-exclamation-circle mr-1"></i>
              {{ errors.email }}
            </small>
          </div>

          <div class="form-field">
            <label for="phone">Teléfono</label>
            <InputText
              id="phone"
              v-model="form.phone"
              placeholder="Número de teléfono"
              :class="{ 'p-invalid': errors.phone && touched.phone }"
              @blur="onFieldBlur('phone')"
              @input="() => touched.phone && validateField('phone', form.phone)"
              autocomplete="tel"
              maxlength="9"
            />
            <small v-if="errors.phone && touched.phone" class="p-error">
              <i class="pi pi-exclamation-circle mr-1"></i>
              {{ errors.phone }}
            </small>
          </div>

          <div class="form-field">
            <label for="gender">Género</label>
            <Dropdown
              id="gender"
              v-model="form.gender"
              :options="genderOptions"
              option-label="label"
              option-value="value"
              placeholder="Seleccionar género"
              :class="{ 'p-invalid': errors.gender }"
              @blur="validateField('gender', form.gender)"
            />
            <small v-if="errors.gender" class="p-error">{{ errors.gender }}</small>
          </div>

          <div class="form-field">
            <label for="birth_date">Fecha de Nacimiento</label>
            <Calendar
              id="birth_date"
              v-model="form.birth_date"
              date-format="dd/mm/yy"
              placeholder="dd/mm/aaaa"
              :class="{ 'p-invalid': errors.birth_date }"
              @blur="validateField('birth_date', form.birth_date)"
            />
            <small v-if="errors.birth_date" class="p-error">{{ errors.birth_date }}</small>
          </div>
        </div>
      </div>

      <!-- Información de Documento -->
      <div class="form-section">
        <h4>Información de Documento</h4>
        <div class="form-grid">
          <div class="form-field">
            <label for="document_type">Tipo de Documento *</label>
            <Dropdown
              id="document_type"
              v-model="form.document_type"
              :options="documentTypes"
              option-label="label"
              option-value="value"
              placeholder="Seleccionar tipo"
              :class="{ 'p-invalid': errors.document_type && touched.document_type }"
              required
              @blur="onFieldBlur('document_type')"
            />
            <small v-if="errors.document_type && touched.document_type" class="p-error">
              {{ errors.document_type }}
            </small>
          </div>

          <div class="form-field">
            <label for="document_number">Número de Documento *</label>
            <InputText
              id="document_number"
              v-model="form.document_number"
              :class="{ 'p-invalid': errors.document_number && touched.document_number }"
              placeholder="Número de documento"
              required
              @blur="onFieldBlur('document_number')"
            />
            <small v-if="errors.document_number && touched.document_number" class="p-error">
              {{ errors.document_number }}
            </small>
          </div>
        </div>
      </div>

      <!-- Información Profesional -->
      <div class="form-section">
        <h4>Información Profesional</h4>
        <div class="form-grid">
          <div class="form-field">
            <label for="specialty_id">Especialidad</label>
            <Dropdown
              id="specialty_id"
              v-model="form.specialty_id"
              :options="specialties"
              option-label="name"
              option-value="id"
              placeholder="Seleccionar especialidad"
              :loading="loadingSpecialties"
              :class="{ 'p-invalid': errors.specialty_id }"
              show-clear
              @blur="validateField('specialty_id', form.specialty_id)"
            />
            <small v-if="loadingSpecialties" class="p-info">Cargando especialidades...</small>
            <small v-if="errors.specialty_id" class="p-error">{{ errors.specialty_id }}</small>
          </div>

          <div class="form-field">
            <label for="license_number">Número de Licencia</label>
            <InputText
              id="license_number"
              v-model="form.license_number"
              placeholder="Número de licencia médica"
              :class="{ 'p-invalid': errors.license_number }"
              @blur="validateField('license_number', form.license_number)"
            />
            <small v-if="errors.license_number" class="p-error">{{ errors.license_number }}</small>
          </div>
        </div>
      </div>

      <!-- Contraseña -->
      <div class="form-section">
        <h4>Credenciales de Acceso</h4>
        <label for="password">Contraseña Temporal *</label>
        <div class="password-field">
          <Password
            id="password"
            v-model="form.password"
            :class="{ 'p-invalid': errors.password }"
            placeholder="Contraseña temporal"
            toggle-mask
            required
            @blur="validateField('password', form.password)"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          <!-- <Button
            type="button"
            icon="pi pi-refresh"
            class="p-button-outlined p-button-sm"
            @click="generateDefaultPassword"
            v-tooltip="'Generar contraseña por defecto'"
          /> -->
        </div>
        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        <small class="p-info">
          Se recomienda usar la contraseña por defecto. El médico deberá cambiarla en su primer
          acceso.
        </small>
        <small class="p-info" v-if="form.password === defaultPassword">
          <strong>Contraseña por defecto:</strong>
          {{ defaultPassword }}
        </small>
      </div>
    </form>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-text"
        @click="visible = false"
        :disabled="loading"
      />
      <Button
        label="Crear Médico"
        icon="pi pi-check"
        class="p-button-success"
        @click="handleSubmit"
        :loading="loading"
        :disabled="!isFormValid || loading"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import Dialog from 'primevue/dialog'
  import InputText from 'primevue/inputtext'
  import Dropdown from 'primevue/dropdown'
  import Calendar from 'primevue/calendar'
  import Password from 'primevue/password'
  import Button from 'primevue/button'
  import { useToast } from 'primevue/usetoast'
  import { UserService } from '@/services/user.service'
  import { SpecialtyService } from '@/services/specialty.service'
  import type { Specialty } from '@/types/specialty.types'
  import { useFormValidation } from '@/composables/useFormValidation'
  import { createDoctorSchema, type CreateDoctorFormData } from '@/shared/validations/user.schemas'

  // Props
  interface Props {
    modelValue: boolean
  }

  const props = defineProps<Props>()

  // Emits
  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'doctor-created'): void
  }

  const emit = defineEmits<Emits>()

  // Composables
  const toast = useToast()

  // State
  const loading = ref(false)
  const loadingSpecialties = ref(false)
  const specialties = ref<Specialty[]>([])
  const defaultPassword = ref('Doctor2024!')

  // Formulario con validación
  const {
    errors,
    touched,
    validateForm: validateFormData,
    validateField,
    setFieldTouched,
    clearErrors
  } = useFormValidation(createDoctorSchema)

  const form = ref<CreateDoctorFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: undefined,
    gender: undefined,
    document_type: '',
    document_number: '',
    birth_date: undefined,
    specialty_id: undefined,
    license_number: undefined,
    password: defaultPassword.value
  })

  // Computed
  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const isFormValid = computed(() => {
    return validateFormData(form.value, true)
  })

  // Watch para validación en tiempo real solo en campos tocados
  watch(
    () => form.value,
    () => {
      // Solo validar si algún campo ha sido tocado
      if (Object.keys(touched.value).length > 0) {
        validateFormData(form.value, false)
      }
    },
    { deep: true }
  )

  // Manejar blur en los campos
  const onFieldBlur = (fieldName: string) => {
    setFieldTouched(fieldName, true)
    // Solo validar el campo específico que perdió el foco
    const error = validateField(fieldName, form.value[fieldName as keyof typeof form.value])

    // Actualizar el error específico para este campo
    if (error) {
      errors.value[fieldName] = error
    } else {
      delete errors.value[fieldName]
    }
  }

  // Options
  const genderOptions = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Femenino', value: 'femenino' }
  ]

  const documentTypes = [
    { label: 'DNI', value: 'DNI' },
    /*   { label: 'Pasaporte', value: 'PASSPORT' }, */
    { label: 'Carnet de Extranjería', value: 'CE' }
  ]

  // Methods
  const loadSpecialties = async () => {
    loadingSpecialties.value = true
    try {
      specialties.value = await SpecialtyService.getActiveSpecialties()
    } catch (error) {
      console.error('Error loading specialties:', error)
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudieron cargar las especialidades',
        life: 3000
      })
    } finally {
      loadingSpecialties.value = false
    }
  }

  const generateDefaultPassword = () => {
    form.value.password = defaultPassword.value
  }

  const resetForm = () => {
    form.value = {
      first_name: '',
      last_name: '',
      email: '',
      phone: undefined,
      gender: undefined,
      document_type: '',
      document_number: '',
      birth_date: undefined,
      specialty_id: undefined,
      license_number: undefined,
      password: defaultPassword.value // Resetear con contraseña por defecto
    }
    clearErrors()
  }

  const validateForm = (): boolean => {
    // Marcar todos los campos como tocados al validar el formulario
    Object.keys(form.value).forEach(field => {
      setFieldTouched(field, true)
    })
    return validateFormData(form.value, true) // Forzar validación de todos los campos
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    loading.value = true
    try {
      await UserService.createDoctor({
        email: form.value.email,
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        gender: form.value.gender,
        document_type: form.value.document_type,
        document_number: form.value.document_number,
        phone: form.value.phone || undefined,
        birth_date: form.value.birth_date
          ? form.value.birth_date.toISOString().split('T')[0]
          : undefined,
        password: form.value.password,
        specialty_id: form.value.specialty_id,
        license_number: form.value.license_number || undefined
      })

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Médico creado correctamente',
        life: 3000
      })

      visible.value = false
      emit('doctor-created')
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo crear el médico',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    loadSpecialties()
  })
</script>

<style scoped>
  .create-doctor-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-section {
    background: var(--surface-card);
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .form-section h4 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--text-color);
    font-weight: 600;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-field label {
    font-weight: 500;
    color: var(--text-color);
  }

  /* Estilos para los inputs con error */
  :deep(.p-inputtext.p-invalid) {
    border-color: #f44336 !important;
  }

  /* Asegurar que las etiquetas no se vean afectadas por los estilos de error */
  :deep(label.p-error) {
    color: var(--text-color) !important;
    background: none !important;
    padding: 0 !important;
    border: none !important;
  }

  /* Estilos para los mensajes de error */
  .p-error {
    color: #f44336 !important;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--surface-border);
  }

  .password-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .p-password {
    width: 100%;
  }

  .p-password input {
    width: 100%;
  }

  .p-error {
    color: #f44336 !important; /* Rojo más visible */
    font-size: 0.7rem;
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .p-info {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
  }

  .p-info strong {
    color: var(--text-color);
  }

  /* Estilos para el botón de generar contraseña */
  .generate-password {
    margin-top: 0.5rem;
  }

  /* Estilos para el campo de especialidad */
  .specialty-field {
    grid-column: 1 / -1;
  }

  /* Estilos para el campo de licencia */
  .license-field {
    grid-column: 1 / -1;
    max-width: 50%;
  }

  /* Estilos responsivos */
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .license-field {
      max-width: 100%;
    }
  }

  /* Estilos para los inputs con error */
  :deep(.p-inputtext.p-invalid) {
    border-color: var(--red-500) !important;
  }

  /* Estilos para el botón de generar contraseña */
  .generate-password {
    margin-top: 0.5rem;
  }
</style>

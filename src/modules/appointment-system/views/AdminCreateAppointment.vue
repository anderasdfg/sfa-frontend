<template>
  <div class="admin-create-appointment">
    <div class="form-container">
      <!-- Paso 1: Buscar Paciente -->
      <div class="form-section">
        <h2>1. Buscar Paciente</h2>
        <div class="search-patient">
          <div class="input-group">
            <label>DNI del Paciente *</label>
            <div class="search-input">
              <input
                v-model="patientDNI"
                type="text"
                placeholder="Ingrese DNI"
                @input="searchPatient"
                maxlength="8"
              />
              <button @click="searchPatient" class="btn-search" :disabled="searching">
                {{ searching ? '🔍 Buscando...' : '🔍 Buscar' }}
              </button>
            </div>
          </div>

          <div v-if="selectedPatient" class="patient-card">
            <div class="patient-info">
              <div class="patient-avatar">
                {{ selectedPatient.first_name?.charAt(0)
                }}{{ selectedPatient.last_name?.charAt(0) }}
              </div>
              <div class="patient-details">
                <h3>{{ selectedPatient.first_name }} {{ selectedPatient.last_name }}</h3>
                <p>DNI: {{ selectedPatient.document_number }}</p>
                <p>Email: {{ selectedPatient.email }}</p>
                <p>Teléfono: {{ selectedPatient.phone }}</p>
              </div>
            </div>
            <button @click="clearPatient" class="btn-clear">✕</button>
          </div>

          <div v-if="patientError" class="error-message">
            {{ patientError }}
          </div>
        </div>
      </div>

      <!-- Paso 2: Seleccionar Especialidad y Doctor -->
      <div class="form-section" :class="{ disabled: !selectedPatient }">
        <h2>2. Seleccionar Especialidad y Doctor</h2>

        <div class="input-group">
          <label>Especialidad *</label>
          <select
            v-model="formData.specialty_id"
            @change="loadDoctorsBySpecialty"
            :disabled="!selectedPatient"
          >
            <option :value="null">Seleccione una especialidad</option>
            <option v-for="specialty in specialties" :key="specialty.id" :value="specialty.id">
              {{ specialty.name }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label>Doctor *</label>
          <select
            v-model="formData.doctor_id"
            @change="loadDoctorSchedule"
            :disabled="!formData.specialty_id"
          >
            <option :value="null">Seleccione un doctor</option>
            <option v-for="doctor in filteredDoctors" :key="doctor.id" :value="doctor.id">
              Dr. {{ doctor.first_name }} {{ doctor.last_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Paso 3: Seleccionar Fecha y Hora -->
      <div class="form-section" :class="{ disabled: !formData.doctor_id }">
        <h2>3. Seleccionar Fecha y Hora</h2>

        <div class="input-group">
          <label>Fecha *</label>
          <input
            v-model="formData.date"
            type="date"
            :min="minDate"
            @change="loadAvailableSlots"
            :disabled="!formData.doctor_id"
          />
        </div>

        <div v-if="loadingSlots" class="loading">Cargando horarios disponibles...</div>

        <div v-else-if="availableSlots.length > 0" class="slots-grid">
          <button
            v-for="slot in availableSlots"
            :key="slot.id"
            @click="selectSlot(slot)"
            class="slot-btn"
            :class="{ selected: formData.slot_id === slot.id }"
          >
            {{ formatSlotTime(String(slot.scheduled_at)) }}
          </button>
        </div>

        <div v-else-if="formData.date && formData.doctor_id" class="empty-slots">
          No hay horarios disponibles para esta fecha
        </div>
      </div>

      <!-- Paso 4: Modalidad -->
      <div class="form-section" :class="{ disabled: !formData.slot_id }">
        <h2>4. Modalidad de Atención</h2>

        <div class="modality-options">
          <button
            @click="formData.modality = 'presencial'"
            class="modality-btn"
            :class="{ selected: formData.modality === 'presencial' }"
            :disabled="!formData.slot_id"
          >
            <i class="pi pi-building"></i>
            <span>Presencial</span>
          </button>
          <button
            @click="formData.modality = 'teleconsulta'"
            class="modality-btn"
            :class="{ selected: formData.modality === 'teleconsulta' }"
            :disabled="!formData.slot_id"
          >
            <i class="pi pi-video"></i>
            <span>Teleconsulta</span>
          </button>
        </div>
      </div>

      <!-- Resumen y Confirmación -->
      <div v-if="canSubmit" class="summary-section">
        <h2>Resumen de la Cita</h2>
        <div class="summary-card">
          <div class="summary-item">
            <strong>Paciente:</strong>
            {{ selectedPatient?.first_name }} {{ selectedPatient?.last_name }}
          </div>
          <div class="summary-item">
            <strong>Doctor:</strong>
            Dr. {{ getSelectedDoctor()?.first_name }} {{ getSelectedDoctor()?.last_name }}
          </div>
          <div class="summary-item">
            <strong>Especialidad:</strong>
            {{ getSelectedSpecialty()?.name }}
          </div>
          <div class="summary-item">
            <strong>Fecha y Hora:</strong>
            {{ formatDate(formData.date) }} - {{ getSelectedSlotTime() }}
          </div>
          <div class="summary-item">
            <strong>Modalidad:</strong>
            {{ formData.modality === 'presencial' ? 'Presencial' : 'Teleconsulta' }}
          </div>
        </div>

        <div class="form-actions">
          <button @click="goBack" class="btn-cancel">Cancelar</button>
          <button @click="createAppointment" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Creando...' : 'Confirmar Cita' }}
          </button>
        </div>
      </div>

      <div v-if="submitError" class="error-message">
        {{ submitError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { PatientService } from '@/services/patient.service'
  import { DoctorService } from '@/services/doctors.service'
  import { SpecialtyService } from '@/services/specialty.service'
  import { SlotService } from '@/services/slots.service'
  import { AppointmentStatus, AppointmentModality } from '@/types/enums'
  import { AppointmentService } from '@/services/appointments.service'
  import { VideoMeetingService } from '@/services/videoMeeting.service'
  import type { Patient } from '@/types/medical.types'
  import type { Doctor } from '@/types/doctor.types'
  import type { Specialty } from '@/types/specialty.types'
  import type { Slot } from '@/types/schedules.types'

  const router = useRouter()

  const patientDNI = ref('')
  const selectedPatient = ref<Patient | null>(null)
  const patientError = ref('')
  const searching = ref(false)

  const specialties = ref<Specialty[]>([])
  const doctors = ref<Doctor[]>([])
  const availableSlots = ref<Slot[]>([])
  const loadingSlots = ref(false)

  const formData = ref({
    patient_id: null as number | null,
    doctor_id: null as number | null,
    specialty_id: null as number | null,
    slot_id: null as number | null,
    date: '',
    modality: 'presencial' as 'presencial' | 'teleconsulta'
  })

  const submitting = ref(false)
  const submitError = ref('')

  const minDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const filteredDoctors = computed(() => {
    if (!formData.value.specialty_id) return []
    return doctors.value.filter(d => d.specialty_id === formData.value.specialty_id)
  })

  const canSubmit = computed(() => {
    return (
      selectedPatient.value &&
      formData.value.doctor_id &&
      formData.value.slot_id &&
      formData.value.modality
    )
  })

  const searchPatient = async () => {
    if (patientDNI.value.length < 8) {
      patientError.value = 'Ingrese un DNI válido (8 dígitos)'
      return
    }

    searching.value = true
    patientError.value = ''

    try {
      const patient = await PatientService.getPatientByDNI(patientDNI.value)

      if (patient) {
        selectedPatient.value = patient
        formData.value.patient_id = patient.id
      } else {
        patientError.value = 'No se encontró un paciente con ese DNI'
        selectedPatient.value = null
      }
    } catch (e: any) {
      patientError.value = e.message || 'Error al buscar paciente'
    } finally {
      searching.value = false
    }
  }

  const clearPatient = () => {
    selectedPatient.value = null
    patientDNI.value = ''
    formData.value.patient_id = null
    resetForm()
  }

  const resetForm = () => {
    formData.value.doctor_id = null
    formData.value.specialty_id = null
    formData.value.slot_id = null
    formData.value.date = ''
    availableSlots.value = []
  }

  const loadDoctorsBySpecialty = () => {
    formData.value.doctor_id = null
    formData.value.slot_id = null
    formData.value.date = ''
    availableSlots.value = []
  }

  const loadDoctorSchedule = () => {
    formData.value.slot_id = null
    availableSlots.value = []
  }

  const loadAvailableSlots = async () => {
    if (!formData.value.doctor_id || !formData.value.date) return

    loadingSlots.value = true
    try {
      const slots = await SlotService.getSlots({
        doctor_id: formData.value.doctor_id,
        date: formData.value.date
      })
      availableSlots.value = slots
    } catch (e) {
      console.error('Error loading slots:', e)
      availableSlots.value = []
    } finally {
      loadingSlots.value = false
    }
  }

  const selectSlot = (slot: Slot) => {
    formData.value.slot_id = slot.id
  }

  const formatSlotTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSelectedDoctor = () => {
    return doctors.value.find(d => d.id === formData.value.doctor_id)
  }

  const getSelectedSpecialty = () => {
    return specialties.value.find(s => s.id === formData.value.specialty_id)
  }

  const getSelectedSlotTime = () => {
    const slot = availableSlots.value.find(s => s.id === formData.value.slot_id)
    return slot ? formatSlotTime(String(slot.scheduled_at)) : ''
  }

  const createAppointment = async () => {
    if (!canSubmit.value) return

    submitting.value = true
    submitError.value = ''

    try {
      const slot = availableSlots.value.find(s => s.id === formData.value.slot_id)
      if (!slot) throw new Error('Slot no encontrado')

      const appointment = await AppointmentService.createAppointment({
        patient_id: formData.value.patient_id!,
        doctor_id: formData.value.doctor_id!,
        slot_id: formData.value.slot_id!,
        appointment_date: String(slot.scheduled_at),
        status: AppointmentStatus.RESERVADA,
        modality: formData.value.modality === 'presencial' ? AppointmentModality.PRESENCIAL : AppointmentModality.TELECONSULTA,
        scheduled_at: new Date() as any
      })

      // Si es teleconsulta, crear videollamada automáticamente
      if (formData.value.modality === 'teleconsulta') {
        try {
          await VideoMeetingService.createMeeting({ appointment_id: appointment.id })
        } catch (e) {
          console.error('Error creating video meeting:', e)
        }
      }

      alert('✅ Cita creada exitosamente')
      router.push('/appointments/calendar')
    } catch (e: any) {
      submitError.value = e.message || 'Error al crear la cita'
    } finally {
      submitting.value = false
    }
  }

  const goBack = () => {
    router.back()
  }

  onMounted(async () => {
    try {
      specialties.value = await SpecialtyService.getSpecialties()
      doctors.value = await DoctorService.getDoctors()
    } catch (e) {
      console.error('Error loading data:', e)
    }
  })
</script>

<style scoped>
  .admin-create-appointment {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .header h1 {
    font-size: 2rem;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #718096;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    background: white;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s;
  }

  .form-section.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .form-section h2 {
    font-size: 1.25rem;
    color: #2d3748;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .input-group {
    margin-bottom: 1.5rem;
  }

  .input-group label {
    display: block;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }

  .input-group input,
  .input-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 0.375rem;
    font-size: 1rem;
  }

  .search-input {
    display: flex;
    gap: 0.5rem;
  }

  .search-input input {
    flex: 1;
  }

  .btn-search {
    padding: 0.75rem 1.5rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn-search:hover:not(:disabled) {
    background: #3182ce;
  }

  .btn-search:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .patient-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background: #f7fafc;
    border: 2px solid #4299e1;
    border-radius: 0.5rem;
    margin-top: 1rem;
  }

  .patient-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .patient-avatar {
    width: 3rem;
    height: 3rem;
    background: #4299e1;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.25rem;
  }

  .patient-details h3 {
    font-size: 1.125rem;
    color: #1a202c;
    margin-bottom: 0.25rem;
  }

  .patient-details p {
    font-size: 0.875rem;
    color: #718096;
    margin: 0.125rem 0;
  }

  .btn-clear {
    width: 2rem;
    height: 2rem;
    background: #fc8181;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-clear:hover {
    background: #f56565;
  }

  .slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .slot-btn {
    padding: 0.75rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .slot-btn:hover {
    border-color: #4299e1;
    background: #ebf8ff;
  }

  .slot-btn.selected {
    background: #4299e1;
    color: white;
    border-color: #4299e1;
  }

  .modality-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .modality-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .modality-btn i {
    font-size: 2rem;
    color: #4a5568;
  }

  .modality-btn:hover:not(:disabled) {
    border-color: #4299e1;
    background: #ebf8ff;
  }

  .modality-btn.selected {
    border-color: #4299e1;
    background: #ebf8ff;
  }

  .modality-btn.selected i {
    color: #4299e1;
  }

  .modality-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .summary-section {
    background: #f7fafc;
    padding: 2rem;
    border-radius: 0.75rem;
    border: 2px solid #4299e1;
  }

  .summary-section h2 {
    font-size: 1.25rem;
    color: #2d3748;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .summary-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.9375rem;
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .summary-item strong {
    color: #4a5568;
    margin-right: 0.5rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn-cancel,
  .btn-submit {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: #e2e8f0;
    color: #4a5568;
  }

  .btn-cancel:hover {
    background: #cbd5e0;
  }

  .btn-submit {
    background: #48bb78;
    color: white;
  }

  .btn-submit:hover:not(:disabled) {
    background: #38a169;
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    padding: 1rem;
    background: #fed7d7;
    color: #742a2a;
    border-radius: 0.375rem;
    margin-top: 1rem;
  }

  .loading,
  .empty-slots {
    text-align: center;
    padding: 2rem;
    color: #718096;
  }
</style>

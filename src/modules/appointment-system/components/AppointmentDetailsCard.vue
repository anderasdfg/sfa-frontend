<template>
  <div class="appointment-details-card">
    <div class="card-header">
      <h3 class="card-title">Detalles de la Cita</h3>
    </div>

    <div class="card-content">
      <!-- Información del Doctor -->
      <div class="section">
        <h4 class="section-title">Doctor</h4>
        <div class="doctor-info">
          <div class="doctor-avatar">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
              :alt="`Dr. ${appointment.doctor_data.last_name}`"
              class="avatar-image"
            />
          </div>
          <div class="doctor-details">
            <p class="doctor-name">
              Dr. {{ appointment.doctor_data.first_name }} {{ appointment.doctor_data.last_name }}
            </p>
            <p class="doctor-license">{{ appointment.doctor_data.license_number }}</p>
            <p class="specialty">{{ appointment.specialty }}</p>
          </div>
        </div>
      </div>

      <!-- Información del Paciente -->
      <div class="section">
        <h4 class="section-title">Paciente</h4>
        <div class="patient-info">
          <div class="patient-avatar">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
              :alt="`${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`"
              class="avatar-image"
            />
          </div>
          <div class="patient-details">
            <p class="patient-name">
              {{ appointment.patient_data.first_name }} {{ appointment.patient_data.last_name }}
            </p>
            <p class="patient-document">
              {{ 'DNI' }}:
              {{ appointment.patient_data.document_number }}
            </p>
          </div>
        </div>
      </div>

      <!-- Información de la Cita -->
      <div class="section">
        <h4 class="section-title">Información de la Cita</h4>
        <div class="appointment-info">
          <div class="info-grid">
            <div class="info-item">
              <CalendarIcon class="info-icon" />
              <div>
                <p class="info-label">Fecha</p>
                <p class="info-value">{{ formatDate(appointment.appointment_date) }}</p>
              </div>
            </div>

            <div class="info-item">
              <ClockIcon class="info-icon" />
              <div>
                <p class="info-label">Hora</p>
                <p class="info-value">{{ formatTime(appointment.slot.scheduled_at) }}</p>
              </div>
            </div>

            <div class="info-item">
              <VideoCameraIcon v-if="appointment.modality === 'teleconsulta'" class="info-icon" />
              <BuildingOfficeIcon v-else class="info-icon" />
              <div>
                <p class="info-label">Modalidad</p>
                <p class="info-value">{{ formatModality(appointment.modality) }}</p>
              </div>
            </div>

            <div class="info-item">
              <CurrencyDollarIcon class="info-icon" />
              <div>
                <p class="info-label">Precio</p>
                <p class="info-value">S/ {{ appointment.slot.price }}</p>
              </div>
            </div>

            <div class="info-item">
              <ClockIcon class="info-icon" />
              <div>
                <p class="info-label">Duración</p>
                <p class="info-value">{{ appointment.slot.duration_minutes }} minutos</p>
              </div>
            </div>

            <div class="info-item">
              <CheckCircleIcon class="info-icon" />
              <div>
                <p class="info-label">Estado</p>
                <p class="info-value">
                  <span class="status-badge" :class="getStatusClass(appointment.status)">
                    {{ formatStatus(appointment.status) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    CalendarIcon,
    ClockIcon,
    VideoCameraIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    CheckCircleIcon
  } from '@heroicons/vue/24/outline'
  import type { Appointment } from '@/types/appointments.types'
  import { AppointmentStatus, AppointmentModality } from '@/types/enums'

  interface Props {
    appointment: Appointment
  }

  defineProps<Props>()

  // Métodos de formateo
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  const formatTime = (dateString: string | Date): string => {
    let dateStr: string
    if (typeof dateString === 'string') {
      dateStr = dateString
    } else {
      dateStr = dateString.toISOString()
    }

    let date: Date
    if (dateStr.endsWith('Z')) {
      const localDateString = dateStr.replace('Z', '')
      date = new Date(localDateString)
    } else {
      date = new Date(dateStr)
    }

    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatModality = (modality: AppointmentModality): string => {
    return modality === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'
  }

  const formatStatus = (status: AppointmentStatus): string => {
    const statuses: Record<AppointmentStatus, string> = {
      reservada: 'Reservada',
      pagada: 'Pagada',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
      confirmada: 'Confirmada'
    }
    return statuses[status] || status
  }

  const getStatusClass = (status: AppointmentStatus): string => {
    const classes: Record<AppointmentStatus, string> = {
      reservada: 'status-reserved',
      pagada: 'status-paid',
      realizada: 'status-completed',
      cancelada: 'status-cancelled',
      confirmada: 'status-confirmada'
    }
    return classes[status] || 'status-default'
  }
</script>

<style scoped>
  .appointment-details-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .card-header {
    background-color: #f9fafb;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .card-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  .doctor-info,
  .patient-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .doctor-avatar,
  .patient-avatar {
    flex-shrink: 0;
  }

  .avatar-image {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e5e7eb;
  }

  .doctor-name,
  .patient-name {
    font-weight: 600;
    color: #111827;
  }

  .doctor-license,
  .patient-document {
    font-size: 0.875rem;
    color: #4b5563;
  }

  .specialty {
    font-size: 0.875rem;
    color: #2563eb;
    font-weight: 500;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .info-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
    flex-shrink: 0;
  }

  .info-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-reserved {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .status-paid {
    background-color: #dcfce7;
    color: #166534;
  }

  .status-completed {
    background-color: #f3f4f6;
    color: #374151;
  }

  .status-cancelled {
    background-color: #fecaca;
    color: #991b1b;
  }

  .status-default {
    background-color: #f3f4f6;
    color: #374151;
  }
</style>

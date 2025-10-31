<template>
  <div class="video-meeting-room">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando sala de videollamada...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="$emit('close')" class="btn-close">Cerrar</button>
    </div>

    <div v-else-if="meetingUrl" class="meeting-container">
      <div class="meeting-header">
        <h2>{{ title }}</h2>
        <div class="meeting-actions">
          <button v-if="!meetingStarted" @click="startMeeting" class="btn-start">
            🎥 Iniciar Videollamada
          </button>
          <button v-if="meetingStarted" @click="endMeeting" class="btn-end">
            🔴 Finalizar
          </button>
          <button @click="$emit('close')" class="btn-close-small">✕</button>
        </div>
      </div>

      <div class="meeting-info">
        <p><strong>Cita:</strong> {{ appointmentInfo }}</p>
        <p><strong>Rol:</strong> {{ roleLabel }}</p>
      </div>

      <div class="iframe-container">
        <iframe
          :src="meetingUrl"
          allow="camera; microphone; fullscreen; display-capture"
          allowfullscreen
          class="jitsi-iframe"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { VideoMeetingService } from '@/services/videoMeeting.service'
import type { VideoMeeting } from '@/types/videoMeeting.types'

interface Props {
  appointmentId: number
  role: 'doctor' | 'patient'
  title?: string
  appointmentInfo?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Videollamada',
  appointmentInfo: ''
})

defineEmits<{
  close: []
  started: [meeting: VideoMeeting]
  ended: [meeting: VideoMeeting]
}>()

const meeting = ref<VideoMeeting | null>(null)
const meetingUrl = ref<string>('')
const loading = ref(true)
const error = ref<string | null>(null)
const meetingStarted = ref(false)

const roleLabel = computed(() => {
  return props.role === 'doctor' ? 'Doctor' : 'Paciente'
})

const loadMeeting = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Get meeting info
    meeting.value = await VideoMeetingService.getMeetingByAppointment(props.appointmentId)
    
    // Get join URL for role
    meetingUrl.value = await VideoMeetingService.getJoinUrl(props.appointmentId, props.role)
    
    // Check if meeting is already active
    if (meeting.value.status === 'active') {
      meetingStarted.value = true
    }
  } catch (e: any) {
    error.value = e.message || 'Error al cargar la videollamada'
  } finally {
    loading.value = false
  }
}

const startMeeting = async () => {
  if (!meeting.value) return
  
  try {
    const updatedMeeting = await VideoMeetingService.startMeeting(meeting.value.id)
    meeting.value = updatedMeeting
    meetingStarted.value = true
  } catch (e: any) {
    alert(e.message || 'Error al iniciar la videollamada')
  }
}

const endMeeting = async () => {
  if (!meeting.value) return
  
  if (!confirm('¿Está seguro de finalizar la videollamada?')) return
  
  try {
    const updatedMeeting = await VideoMeetingService.endMeeting(meeting.value.id)
    meeting.value = updatedMeeting
    meetingStarted.value = false
    alert('Videollamada finalizada')
  } catch (e: any) {
    alert(e.message || 'Error al finalizar la videollamada')
  }
}

onMounted(() => {
  loadMeeting()
})
</script>

<style scoped>
.video-meeting-room {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state p {
  color: #e53e3e;
  margin-bottom: 1rem;
}

.btn-close {
  padding: 0.75rem 1.5rem;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #2d3748;
}

.meeting-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #1a202c;
  color: white;
}

.meeting-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.meeting-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-start,
.btn-end,
.btn-close-small {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start {
  background: #48bb78;
  color: white;
}

.btn-start:hover {
  background: #38a169;
}

.btn-end {
  background: #e53e3e;
  color: white;
}

.btn-end:hover {
  background: #c53030;
}

.btn-close-small {
  background: #4a5568;
  color: white;
  padding: 0.5rem 0.75rem;
}

.btn-close-small:hover {
  background: #2d3748;
}

.meeting-info {
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.meeting-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #4a5568;
}

.iframe-container {
  flex: 1;
  position: relative;
  background: #000;
}

.jitsi-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>

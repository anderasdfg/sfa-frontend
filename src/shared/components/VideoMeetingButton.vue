<template>
  <div class="video-meeting-button">
    <button @click="openMeeting" class="btn-video" :disabled="!canJoin">🎥 {{ buttonText }}</button>

    <!-- Modal de videollamada -->
    <teleport to="body">
      <div v-if="showMeeting" class="meeting-modal" @click.self="closeMeeting">
        <div class="meeting-modal-content">
          <VideoMeetingRoom
            :appointment-id="appointmentId"
            :role="role"
            :title="title"
            :appointment-info="appointmentInfo"
            @close="closeMeeting"
          />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import VideoMeetingRoom from './VideoMeetingRoom.vue'

  interface Props {
    appointmentId: number
    role: 'doctor' | 'patient'
    canJoin?: boolean
    buttonText?: string
    title?: string
    appointmentInfo?: string
  }

  withDefaults(defineProps<Props>(), {
    canJoin: true,
    buttonText: 'Unirse a Videollamada',
    title: 'Videollamada',
    appointmentInfo: ''
  })

  const showMeeting = ref(false)

  const openMeeting = () => {
    showMeeting.value = true
  }

  const closeMeeting = () => {
    showMeeting.value = false
  }
</script>

<style scoped>
  .btn-video {
    padding: 0.75rem 1.5rem;
    background: var(--color-sf-green-light);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-video:hover:not(:disabled) {
    background: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .btn-video:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .meeting-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  }

  .meeting-modal-content {
    width: 100%;
    max-width: 1400px;
    height: 90vh;
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
</style>

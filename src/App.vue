<template>
  <div id="app">
    <router-view />
    <Toast />
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import Toast from 'primevue/toast'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { useLayoutStore } from '@/stores/ui/layoutStore'

  const authStore = useAuthStore()
  const layoutStore = useLayoutStore()

  onMounted(() => {
    authStore.initializeAuth()
    layoutStore.initializeLayout()
  })
</script>

<style>
  @import '@/assets/css/base.css';
</style>

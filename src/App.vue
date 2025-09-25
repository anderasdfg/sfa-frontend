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
    // Inicializar autenticación
    authStore.initializeAuth()

    // Inicializar layout
    layoutStore.initializeLayout()
  })
</script>

<style>
  * {
    /*   margin: 0;
    padding: 0; */
    box-sizing: border-box;
  }

  #app {
    font-family: 'Nunito', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  .p-toast {
    z-index: 9999;
  }
</style>

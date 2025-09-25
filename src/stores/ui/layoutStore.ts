import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // State
  const sidebarVisible = ref(false)
  const loading = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const scale = ref(14) // Escala de fuente

  // Actions
  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
  }

  const setSidebarVisible = (visible: boolean) => {
    sidebarVisible.value = visible
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'

    // Aplicar tema al documento
    const element = document.querySelector('html')
    if (element) {
      if (theme.value === 'dark') {
        element.classList.add('dark-mode')
      } else {
        element.classList.remove('dark-mode')
      }
    }

    // Guardar en localStorage
    localStorage.setItem('theme', theme.value)
  }

  const setScale = (newScale: number) => {
    scale.value = newScale
    document.documentElement.style.fontSize = newScale + 'px'
    localStorage.setItem('scale', newScale.toString())
  }

  const initializeLayout = () => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      theme.value = savedTheme
      const element = document.querySelector('html')
      if (element && savedTheme === 'dark') {
        element.classList.add('dark-mode')
      }
    }

    // Cargar escala guardada
    const savedScale = localStorage.getItem('scale')
    if (savedScale) {
      const scaleValue = parseInt(savedScale)
      if (!isNaN(scaleValue)) {
        setScale(scaleValue)
      }
    }
  }

  return {
    // State
    sidebarVisible,
    loading,
    theme,
    scale,

    // Actions
    toggleSidebar,
    setSidebarVisible,
    setLoading,
    toggleTheme,
    setScale,
    initializeLayout,
  }
})

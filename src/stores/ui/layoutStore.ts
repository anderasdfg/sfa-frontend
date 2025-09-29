import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // State
  const sidebarVisible = ref(false)
  const loading = ref(false)
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

  const setScale = (newScale: number) => {
    scale.value = newScale
    document.documentElement.style.fontSize = newScale + 'px'
    localStorage.setItem('scale', newScale.toString())
  }

  const initializeLayout = () => {
    // Asegurar que no haya tema oscuro
    const element = document.documentElement
    element.classList.remove('dark-mode')

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
    scale,

    // Actions
    toggleSidebar,
    setSidebarVisible,
    setLoading,
    setScale,
    initializeLayout,
  }
})

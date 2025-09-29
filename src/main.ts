import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'

// Asegurar que el tema claro se aplique forzadamente
document.documentElement.classList.remove('dark')
document.documentElement.classList.add('light')
document.documentElement.style.colorScheme = 'light'
document.body.classList.remove('dark-mode')

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
      darkModeClass: 'dark',
      lightModeClass: 'light'
    }
  }
})
app.use(ToastService)

app.mount('#app')

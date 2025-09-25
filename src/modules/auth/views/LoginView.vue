<template>
  <div class="w-4/5">
    <div class="flex items-center justify-center flex-col gap-10">
      <img src="https://www.clinicasanmiguel.pe/img/logo.png" alt="SISFAHD Logo" class="h-[50px]" />
      <h1 class="text-center text-sf-green-normal text-2xl font-bold">Iniciar sesión</h1>
    </div>
    <div class="py-5">
      <form class="flex flex-col" @submit.prevent="handleSubmit">
        <div class="mb-4 relative">
          <label for="username" class="block text-sm font-medium text-sf-green-normal mb-1">
            Usuario
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <user-icon />
            </span>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              class="w-full"
              :class="{ 'p-invalid': emailError }"
              autocomplete="email"
              required
            />
          </div>
        </div>

        <div class="mb-4 relative">
          <label for="password" class="block text-sm font-medium text-sf-green-normal mb-1">
            Contraseña
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <lock-closed-icon />
            </span>
            <Password
              id="password"
              v-model="password"
              placeholder="Tu contraseña"
              class="w-full"
              :class="{ 'p-invalid': passwordError }"
              :feedback="false"
              toggle-mask
              autocomplete="current-password"
              required
            />
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>
          <p class="mt-1">
            <router-link to="/auth/forgot-password" class="text-sf-green-normal text-sm">
              ¿Olvidaste tu contraseña?
            </router-link>
            <!-- :to="{ name: 'recover' }"  -->
          </p>
        </div>

        <!-- Error Message -->
        <Message v-if="error" severity="error" class="mb-3">
          {{ error }}
        </Message>

        <!-- Submit Button -->
        <Button
          type="submit"
          label="Iniciar Sesión"
          class="w-full p-button-lg"
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
          icon="pi pi-sign-in"
        />

        <!-- Forgot Password Link -->
        <div class="text-center mt-4">
          <router-link to="/auth/forgot-password" class="text-primary hover:underline text-sm">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Button from 'primevue/button'
  //import Checkbox from 'primevue/checkbox'
  import Message from 'primevue/message'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { useNotificationStore } from '@/stores/ui/notificationStore'
  import { validateEmail, validatePassword } from '@/shared/lib/validators'

  const router = useRouter()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Form state
  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const isLoading = ref(false)
  const error = ref('')

  // Validation
  const emailError = computed(() => {
    if (!email.value) return ''
    return validateEmail(email.value) ? '' : 'Ingresa un email válido'
  })

  const passwordError = computed(() => {
    if (!password.value) return ''
    return validatePassword(password.value) ? '' : 'La contraseña debe tener al menos 6 caracteres'
  })

  const isFormValid = computed(() => {
    return email.value && password.value && !emailError.value && !passwordError.value
  })

  // Methods
  const handleSubmit = async () => {
    if (!isFormValid.value) return

    isLoading.value = true
    error.value = ''

    try {
      const success = await authStore.login({
        username: email.value,
        password: password.value
        //rememberMe: rememberMe.value
      })

      if (success) {
        notificationStore.showSuccess(
          'Bienvenido',
          `Hola ${authStore.user?.first_name}, has iniciado sesión correctamente`
        )

        // Redirigir según el rol
        const userRole = authStore.userRole
        switch (userRole) {
          case 'admin':
            router.push('/dashboard/admin')
            break
          case 'doctor':
            router.push('/dashboard/doctor')
            break
          case 'receptionist':
            router.push('/dashboard/receptionist')
            break
          case 'patient':
            router.push('/dashboard/patient')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        error.value = authStore.error || 'Error al iniciar sesión'
      }
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión'
      notificationStore.showError(
        'Error de autenticación',
        'Verifica tus credenciales e intenta nuevamente'
      )
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    const emailInput = document.getElementById('email')
    if (emailInput) {
      emailInput.focus()
    }

    error.value = ''
  })
</script>

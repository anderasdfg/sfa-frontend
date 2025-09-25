<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HamburguerIcon from '@/assets/icons/HamburguerIcon.vue';
import UserIcon from '@/assets/icons/UserIcon.vue';
import LogOutIcon from '@/assets/icons/LogOutIcon.vue';
import { useAuthStore } from '@/modules/auth/store/auth.store';

const router = useRouter();
const mobileMenuOpen = ref(false);
const userDropdownOpen = ref(false);
const authStore = useAuthStore();

const navigateToLogin = () => {
  router.push({ name: 'login' });
};

const navigateToDashboard = () => {
  if (authStore.isAuthenticated) {
    router.push(authStore.getUserRoleRoute.url);
  } else {
    router.push({ name: 'login' });
  }
};

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  mobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  userDropdownOpen.value = false;
  router.push({ name: 'home' });
};

const userDisplayName = computed(() => {
  const user = authStore.getUser;
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
});

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-dropdown')) {
    userDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const headerOptions = [
  {
    label: 'Inicio',
    href: '#inicio',
    onClick: () => scrollToSection('inicio'),
  },
  {
    label: '¿Cómo Funciona?',
    href: '#como-funciona',
    onClick: () => scrollToSection('como-funciona'),
  },
  {
    label: 'Especialidades',
    href: '#especialidades',
    onClick: () => scrollToSection('especialidades'),
  },
  {
    label: 'Doctores',
    href: '#doctores',
    onClick: () => scrollToSection('doctores'),
  },
  {
    label: 'Preguntas Frecuentes',
    href: '#faq',
    onClick: () => scrollToSection('faq'),
  },
];
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white shadow-sm">
    <div
      class="mx-auto max-w-full sm:max-w-[calc(100%-200px)] flex justify-between items-center px-8 py-4 sm:justify-around"
    >
      <!-- Logo -->
      <div class="flex-shrink-0">
        <img
          src="https://www.clinicasanmiguel.pe/img/logo.png"
          alt="SISFAHD Logo"
          class="h-[50px]"
        />
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:block flex-grow mx-8">
        <ul class="flex justify-center gap-8 list-none p-0 m-0">
          <li v-for="option in headerOptions" :key="option.label">
            <a
              :href="option.href"
              @click.prevent="option.onClick"
              class="nav-link text-slate-600 no-underline transition hover:text-sf-green-light"
              :data-content="option.label"
            >
              {{ option.label }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- Buttons -->
      <div class="hidden lg:flex items-center gap-4">
        <button
          class="px-6 py-3 bg-sf-green-light text-white border-0 rounded-lg text-base font-bold cursor-pointer transition hover:bg-sf-green-normal"
          @click="navigateToLogin"
        >
          Reservar una cita
        </button>

        <!-- User Dropdown (when authenticated) -->
        <div v-if="authStore.isAuthenticated" class="relative user-dropdown">
          <button
            @click="toggleUserDropdown"
            class="flex items-center gap-2 px-4 py-2 bg-transparent text-[--color-sf-green-normal] font-bold cursor-pointer text-base rounded-lg border-solid border-sf-green-normal hover:bg-sf-green-light hover:text-white transition"
          >
            <UserIcon class="w-5 h-5" />
            {{ userDisplayName }}
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="userDropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            <button
              @click="navigateToDashboard"
              class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <UserIcon class="w-4 h-4" />
              Mi Portal
            </button>
            <hr class="my-1" />
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOutIcon class="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- Login Button (when not authenticated) -->
        <button
          v-else
          class="px-4 py-2 bg-transparent text-[--color-sf-green-normal] font-bold cursor-pointer text-base rounded-lg border-solid border-sf-green-normal"
          @click="navigateToDashboard"
        >
          Ingresar al portal
        </button>
      </div>

      <!-- Hamburger Menu Button -->
      <button
        class="lg:hidden flex flex-col items-center justify-center bg-transparent border-0 cursor-pointer p-2.5"
        @click="toggleMobileMenu"
        aria-label="Menú"
      >
        <hamburguer-icon />
      </button>
    </div>

    <!-- Mobile Menu -->
    <div
      class="lg:hidden w-full bg-white overflow-hidden transition-all duration-300"
      :class="mobileMenuOpen ? 'max-h-96 border-t border-slate-200 shadow-md' : 'max-h-0'"
    >
      <nav class="w-full">
        <ul class="flex flex-col gap-1 p-0 m-0 list-none">
          <li v-for="option in headerOptions" :key="option.label">
            <a
              :href="option.href"
              @click.prevent="option.onClick"
              class="block py-3 px-8 text-slate-600 no-underline font-medium transition hover:bg-slate-50 hover:text-sf-green-light"
            >
              {{ option.label }}
            </a>
          </li>
          <li class="border-t border-slate-100 mt-2 pt-2">
            <a
              href="#"
              @click.prevent="navigateToLogin"
              class="block py-3 px-8 text-[--color-sf-green-dark] font-bold no-underline"
            >
              Reservar una cita
            </a>
          </li>

          <!-- User Section (when authenticated) -->
          <li v-if="authStore.isAuthenticated" class="border-t border-slate-100 mt-2 pt-2">
            <div class="px-8 py-3">
              <div class="flex items-center gap-2 text-[--color-sf-green-dark] font-bold">
                <UserIcon class="w-5 h-5" />
                {{ userDisplayName }}
              </div>
            </div>
            <a
              href="#"
              @click.prevent="navigateToDashboard"
              class="block py-3 px-8 text-[--color-sf-green-dark] font-bold no-underline"
            >
              Mi Portal
            </a>
            <a
              href="#"
              @click.prevent="handleLogout"
              class="block py-3 px-8 text-red-600 font-bold no-underline"
            >
              Cerrar Sesión
            </a>
          </li>

          <!-- Login Button (when not authenticated) -->
          <li v-else>
            <a
              href="#"
              @click.prevent="navigateToDashboard"
              class="block py-3 px-8 text-[--color-sf-green-dark] font-bold no-underline"
            >
              Ingresar al portal
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  display: inline-block;
  font-weight: 500;
  position: relative;
}

.nav-link::after {
  content: attr(data-content);
  display: block;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  font-weight: bold;
}

.nav-link:hover {
  font-weight: bold;
}
</style>

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

// Importar rutas de módulos
import authRoutes from '@/modules/auth/router'
import landingRoutes from '@/modules/landing/router'
import appointmentRoutes from '@/modules/appointment-system/router'
import userRolesRoutes from '@/modules/user-roles/router'
import doctorsRoutes from '@/modules/doctors-management/router'
import patientRoutes from '@/modules/patient-management/router'
import medicalRecordsRoutes from '@/modules/medical-records/router'

const routes: RouteRecordRaw[] = [
  // Combinar todas las rutas de los módulos
  ...landingRoutes,
  ...authRoutes,
  ...userRolesRoutes,
  ...appointmentRoutes,
  ...doctorsRoutes,
  ...patientRoutes,
  ...medicalRecordsRoutes,

  // Rutas de error
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Función helper para obtener la ruta del dashboard según el rol
const getDashboardRouteByRole = (role: string | null): string => {
  switch (role) {
    case 'patient':
      return '/dashboard/patient'
    case 'doctor':
      return '/dashboard/doctor'
    case 'admin':
      return '/dashboard/admin'
    case 'receptionist':
      return '/dashboard/receptionist'
    default:
      return '/dashboard/patient' // fallback
  }
}

// Guards de autenticación
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Inicializar autenticación si no está inicializada
  if (!authStore.isAuthenticated && localStorage.getItem('auth_token')) {
    authStore.initializeAuth()
  }

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
    return
  }

  // Verificar si la ruta es solo para invitados
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const dashboardRoute = getDashboardRouteByRole(authStore.userRole)
    next(dashboardRoute)
    return
  }

  // Redirección automática para /dashboard según el rol
  if (to.path === '/dashboard' && authStore.isAuthenticated) {
    const dashboardRoute = getDashboardRouteByRole(authStore.userRole)
    next(dashboardRoute)
    return
  }

  // Redirección automática para / según el estado de autenticación
  if (to.path === '/' && authStore.isAuthenticated) {
    const dashboardRoute = getDashboardRouteByRole(authStore.userRole)
    next(dashboardRoute)
    return
  }

  // Verificar roles requeridos
  if (to.meta.roles && authStore.isAuthenticated) {
    const hasRequiredRole = (to.meta.roles as string[]).some(role => authStore.hasRole(role))

    if (!hasRequiredRole) {
      next('/unauthorized')
      return
    }
  }

  next()
})

export default router

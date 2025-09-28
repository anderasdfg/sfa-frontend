import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'
import doctorsRoutes from '@/modules/doctors-management/router'

// Layouts
const AuthLayout = () => import('@/core/layouts/AuthLayout.vue')
const MainLayout = () => import('@/core/layouts/MainLayout.vue')
const LandingLayout = () => import('@/core/layouts/LandingLayout.vue')

// Views principales
const LoginView = () => import('@/modules/auth/views/LoginView.vue')
const LandingView = () => import('@/modules/landing/views/LandingView.vue')
const AppointmentBooking = () => import('@/modules/appointment-system/views/AppointmentBooking.vue')

// Payment callback views
const PaymentSuccess = () => import('@/modules/appointment-system/views/PaymentSuccess.vue')
const PaymentPending = () => import('@/modules/appointment-system/views/PaymentPending.vue')
const PaymentFailure = () => import('@/modules/appointment-system/views/PaymentFailure.vue')

// Views por rol
const PatientDashboard = () => import('@/modules/user-roles/patient/views/PatientDashboard.vue')
const DoctorDashboard = () => import('@/modules/user-roles/doctor/views/DoctorDashboard.vue')
const AdminDashboard = () => import('@/modules/user-roles/admin/views/AdminDashboard.vue')
const ReceptionistDashboard = () =>
  import('@/modules/user-roles/receptionist/views/ReceptionistDashboard.vue')

const routes: RouteRecordRaw[] = [
  // Landing page para visitantes no autenticados
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: LandingView
      },
      {
        path: 'appointment-booking',
        name: 'AppointmentBooking',
        component: AppointmentBooking
      },
      // Payment callback routes
      {
        path: 'payment/success',
        name: 'PaymentSuccess',
        component: PaymentSuccess
      },
      {
        path: 'payment/pending',
        name: 'PaymentPending',
        component: PaymentPending
      },
      {
        path: 'payment/failure',
        name: 'PaymentFailure',
        component: PaymentFailure
      }
    ]
  },

  // Rutas de autenticación
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView
      }
      /*       {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/auth/ForgotPasswordView.vue')
      },
      {
        path: 'reset-password/:token',
        name: 'ResetPassword',
        component: () => import('@/views/auth/ResetPasswordView.vue'),
        props: true
      } */
    ]
  },

  // Ruta de redirección para dashboard
  {
    path: '/dashboard',
    redirect: _to => {
      // Esta redirección se manejará en el guard de navegación
      return '/dashboard/patient' // fallback temporal
    }
  },

  // Dashboard específico por rol
  {
    path: '/dashboard/patient',
    name: 'PatientDashboard',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['patient'],
      title: 'Dashboard'
    },
    children: [
      {
        path: '',
        component: PatientDashboard
      }
    ]
  },
  {
    path: '/dashboard/doctor',
    name: 'DoctorDashboard',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor'],
      title: 'Dashboard'
    },
    children: [
      {
        path: '',
        component: DoctorDashboard
      }
    ]
  },
  {
    path: '/dashboard/admin',
    name: 'AdminDashboard',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Dashboard'
    },
    children: [
      {
        path: '',
        component: AdminDashboard
      }
    ]
  },
  {
    path: '/dashboard/receptionist',
    name: 'ReceptionistDashboard',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['receptionist'],
      title: 'Dashboard'
    },
    children: [
      {
        path: '',
        component: ReceptionistDashboard
      }
    ]
  },

  // Rutas de gestión de médicos
  {
    path: '/admin',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    },
    children: doctorsRoutes
  },

  // Rutas de gestión de pacientes
  {
    path: '/patients',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor', 'admin', 'receptionist']
    }
  },

  // Rutas de citas médicas
  {
    path: '/appointments',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: []
  },

  // Rutas de administración
  {
    path: '/admin',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    },
    children: [
      {
        path: 'schedules',
        name: 'Horarios Médicos',
        component: () => import('@/modules/schedule-management/views/AdminSchedulesList.vue')
      }
    ]
  },

  // Rutas de historial médico
  {
    path: '/medical-records',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor', 'admin']
    },
    children: []
  },

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

import type { RouteRecordRaw } from 'vue-router'

// Layouts
const AuthLayout = () => import('@/core/layouts/AuthLayout.vue')

// Views
const LoginView = () => import('../views/LoginView.vue')

const authRoutes: RouteRecordRaw[] = [
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
      // Rutas futuras como forgot-password, reset-password, etc.
    ]
  }
]

export default authRoutes

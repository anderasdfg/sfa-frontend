import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

// Views por rol
const PatientDashboard = () => import('../patient/views/PatientDashboard.vue')
const DoctorDashboard = () => import('../doctor/views/DoctorDashboard.vue')
const AdminDashboard = () => import('../admin/views/AdminDashboard.vue')
const ReceptionistDashboard = () => import('../receptionist/views/ReceptionistDashboard.vue')

const userRolesRoutes: RouteRecordRaw[] = [
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
  }
]

export default userRolesRoutes

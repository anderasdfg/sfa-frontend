import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const patientRoutes: RouteRecordRaw[] = [
  // Rutas de gestión de pacientes
  {
    path: '/patients',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor', 'admin', 'receptionist']
    },
    children: [
      // Rutas futuras para gestión de pacientes
      // {
      //   path: '',
      //   name: 'PatientsList',
      //   component: () => import('../views/PatientsList.vue')
      // },
      // {
      //   path: 'new',
      //   name: 'CreatePatient',
      //   component: () => import('../views/CreatePatient.vue')
      // },
      // {
      //   path: ':id',
      //   name: 'PatientDetail',
      //   component: () => import('../views/PatientDetail.vue'),
      //   props: true
      // },
      // {
      //   path: ':id/edit',
      //   name: 'EditPatient',
      //   component: () => import('../views/EditPatient.vue'),
      //   props: true
      // }
    ]
  }
]

export default patientRoutes

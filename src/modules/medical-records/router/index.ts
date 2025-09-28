import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const medicalRecordsRoutes: RouteRecordRaw[] = [
  // Rutas de historiales médicos
  {
    path: '/medical-records',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor', 'admin']
    },
    children: [
      // Rutas futuras para historiales médicos
      // {
      //   path: 'patient/:patientId',
      //   name: 'PatientMedicalRecords',
      //   component: () => import('../views/PatientMedicalRecords.vue'),
      //   props: true
      // },
      // {
      //   path: 'new/:patientId',
      //   name: 'CreateMedicalRecord',
      //   component: () => import('../views/CreateMedicalRecord.vue'),
      //   props: true
      // }
    ]
  }
]

export default medicalRecordsRoutes

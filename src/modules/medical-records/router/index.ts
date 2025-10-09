import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')
const ConsultationLayout = () => import('@/core/layouts/ConsultationLayout.vue')

// Views
const MedicalConsultation = () => import('../views/MedicalConsultation.vue')

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
  },
  // Consulta médica (sin sidebar, full width)
  {
    path: '/consultation/:id',
    name: 'MedicalConsultation',
    component: ConsultationLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor'],
      title: 'Consulta Médica'
    },
    children: [
      {
        path: '',
        component: MedicalConsultation
      }
    ]
  }
]

export default medicalRecordsRoutes

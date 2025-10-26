import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')
const ConsultationLayout = () => import('@/core/layouts/ConsultationLayout.vue')

// Views
const MedicalConsultation = () => import('../views/MedicalConsultation.vue')
const PatientMedicalRecord = () => import('../views/PatientMedicalRecord.vue')

const medicalRecordsRoutes: RouteRecordRaw[] = [
  // Rutas de historiales médicos
  {
    path: '/medical-records',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['doctor', 'admin']
    },
    children: []
  },
  // Ruta para ver la historia clínica del paciente
  {
    path: '/medical-records/patient/:patientId',
    name: 'PatientMedicalRecord',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['patient'],
      title: 'Historia Clínica'
    },
    children: [
      {
        path: '',
        component: PatientMedicalRecord
      }
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

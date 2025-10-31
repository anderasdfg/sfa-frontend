import type { RouteRecordRaw } from 'vue-router'

const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const patientQueueRoutes: RouteRecordRaw[] = [
  {
    path: '/patient-queue',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'PatientQueue',
        component: () => import('../views/PatientQueueView.vue'),
        meta: {
          roles: ['admin'],
          title: 'Cola de Pacientes'
        }
      },
      {
        path: 'statistics',
        name: 'PatientQueueStatistics',
        component: () => import('../views/PatientQueueStatistics.vue'),
        meta: {
          roles: ['admin'],
          title: 'Estadísticas de Cola'
        }
      }
    ]
  }
]

export default patientQueueRoutes

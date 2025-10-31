import type { RouteRecordRaw } from 'vue-router'

const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const doctorAttendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/doctor-attendance',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DoctorAttendance',
        component: () => import('../views/DoctorAttendanceView.vue'),
        meta: {
          roles: ['admin'],
          title: 'Asistencia de Doctores'
        }
      },
      {
        path: 'check-in',
        name: 'DoctorCheckIn',
        component: () => import('../views/DoctorCheckInView.vue'),
        meta: {
          roles: ['admin'],
          title: 'Registrar Check-In'
        }
      },
      {
        path: 'statistics',
        name: 'DoctorAttendanceStatistics',
        component: () => import('../views/DoctorAttendanceStatistics.vue'),
        meta: {
          roles: ['admin'],
          title: 'Estadísticas de Asistencia'
        }
      }
    ]
  }
]

export default doctorAttendanceRoutes

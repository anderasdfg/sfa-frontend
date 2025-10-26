import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const appointmentRoutes: RouteRecordRaw[] = [
  // Rutas privadas de gestión de citas (en MainLayout)
  {
    path: '/appointments',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'PatientAppointmentsList',
        component: () => import('../views/PatientAppointmentsList.vue'),
        meta: {
          roles: ['patient'],
          title: 'Mis Citas'
        }
      },
      {
        path: 'calendar',
        name: 'AppointmentsCalendar',
        component: () => import('../views/AppointmentsCalendar.vue'),
        meta: {
          roles: ['doctor', 'admin', 'receptionist'],
          title: 'Calendario de Citas'
        }
      }
      // Rutas futuras para gestión de citas
      // {
      //   path: 'new',
      //   name: 'CreateAppointment',
      //   component: () => import('../views/CreateAppointment.vue'),
      //   meta: { roles: ['doctor', 'admin', 'receptionist'] }
      // },
      // {
      //   path: ':id',
      //   name: 'AppointmentDetail',
      //   component: () => import('../views/AppointmentDetail.vue'),
      //   props: true
      // }
    ]
  }
]

export default appointmentRoutes

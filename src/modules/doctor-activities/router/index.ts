import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const doctorActivitiesRoutes: RouteRecordRaw[] = [
  {
    path: '/activities',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DoctorActivitiesToday',
        component: () => import('../views/DoctorActivitiesList.vue'),
        meta: {
          roles: ['doctor', 'admin'],
          title: 'Mis Citas'
        }
      },
      {
        path: 'my-schedule',
        name: 'DoctorMySchedule',
        component: () => import('../views/DoctorMySchedule.vue'),
        meta: {
          roles: ['doctor', 'admin'],
          title: 'Mi Horario'
        }
      }
    ]
  }
]

export default doctorActivitiesRoutes
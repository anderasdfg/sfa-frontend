import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const doctorsRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/doctors',
    component: MainLayout,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    },
    children: [
      {
        path: '',
        name: 'AdminDoctors',
        component: () => import('../views/AdminDoctorsList.vue'),
        meta: {
          title: 'Gestión de Médicos'
        }
      },
      {
        path: ':id',
        name: 'AdminDoctorDetail',
        component: () => import('../views/AdminDoctorDetail.vue'),
        meta: {
          title: 'Detalle del Médico'
        }
      },
      {
        path: ':id/edit',
        name: 'AdminDoctorEdit',
        component: () => import('../views/AdminDoctorDetail.vue'),
        meta: {
          title: 'Editar Médico'
        }
      }
    ]
  }
]

export default doctorsRoutes

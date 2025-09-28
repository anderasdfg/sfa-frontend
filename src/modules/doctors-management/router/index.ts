import type { RouteRecordRaw } from 'vue-router'

const doctorsRoutes: RouteRecordRaw[] = [
  {
    path: 'doctors',
    name: 'AdminDoctors',
    component: () => import('../views/AdminDoctorsList.vue'),
    meta: {
      title: 'Gestión de Médicos'
    }
  },
  {
    path: 'doctors/:id',
    name: 'AdminDoctorDetail',
    component: () => import('../views/AdminDoctorDetail.vue'),
    meta: {
      title: 'Detalle del Médico'
    }
  },
  {
    path: 'doctors/:id/edit',
    name: 'AdminDoctorEdit',
    component: () => import('../views/AdminDoctorDetail.vue'),
    meta: {
      title: 'Editar Médico'
    }
  }
]

export default doctorsRoutes

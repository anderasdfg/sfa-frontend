import { type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/core/layouts/MainLayout.vue'
import AdminSchedulesList from '../views/AdminSchedulesList.vue'

export default [
  {
    path: '/admin/schedule-availability',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'admin-schedule-availability',
        component: AdminSchedulesList,
        meta: {
          requiresAuth: true,
          roles: ['admin'],
          title: 'Gestión de Horarios'
        }
      }
    ]
  }
] as RouteRecordRaw[]

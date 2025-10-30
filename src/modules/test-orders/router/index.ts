import type { RouteRecordRaw } from 'vue-router'

// Layouts
const MainLayout = () => import('@/core/layouts/MainLayout.vue')

const testOrderRoutes: RouteRecordRaw[] = [
  {
    path: '/test-orders',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'PatientTestOrdersList',
        component: () => import('../views/PatientTestOrdersList.vue'),
        meta: {
          roles: ['patient'],
          title: 'Mis Exámenes'
        }
      }
      // Rutas futuras
      // {
      //   path: ':id',
      //   name: 'TestOrderDetail',
      //   component: () => import('../views/TestOrderDetail.vue'),
      //   props: true,
      //   meta: {
      //     roles: ['patient', 'doctor', 'admin'],
      //     title: 'Detalle de Orden'
      //   }
      // }
    ]
  }
]

export default testOrderRoutes

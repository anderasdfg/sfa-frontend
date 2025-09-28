import type { RouteRecordRaw } from 'vue-router'

// Layouts
const LandingLayout = () => import('@/core/layouts/LandingLayout.vue')

// Views
const LandingView = () => import('../views/LandingView.vue')
const AppointmentBooking = () => import('@/modules/appointment-system/views/AppointmentBooking.vue')
const PaymentSuccess = () => import('@/modules/appointment-system/views/PaymentSuccess.vue')
const PaymentPending = () => import('@/modules/appointment-system/views/PaymentPending.vue')
const PaymentFailure = () => import('@/modules/appointment-system/views/PaymentFailure.vue')

const landingRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: LandingView
      },
      {
        path: 'appointment-booking',
        name: 'AppointmentBooking',
        component: AppointmentBooking
      },
      // Payment callback routes
      {
        path: 'payment/success',
        name: 'PaymentSuccess',
        component: PaymentSuccess
      },
      {
        path: 'payment/pending',
        name: 'PaymentPending',
        component: PaymentPending
      },
      {
        path: 'payment/failure',
        name: 'PaymentFailure',
        component: PaymentFailure
      }
    ]
  }
]

export default landingRoutes

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next('/auth/login')
  } else {
    next()
  }
}

export const roleGuard = (allowedRoles: string[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      next('/auth/login')
      return
    }

    const hasRole = allowedRoles.some((role) => authStore.hasRole(role))

    if (hasRole) {
      next()
    } else {
      next('/unauthorized')
    }
  }
}

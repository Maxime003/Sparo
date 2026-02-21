import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function useAuth() {
  const { initialize, ...rest } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return rest
}

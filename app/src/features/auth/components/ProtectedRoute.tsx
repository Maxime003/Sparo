import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { FullPageLoader } from '@/components/shared/FullPageLoader'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <FullPageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

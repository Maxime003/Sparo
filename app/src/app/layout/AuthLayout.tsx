import { Outlet, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { FullPageLoader } from '@/components/shared/FullPageLoader'

export function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (user) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-semibold">Finzeo</h1>
            <p className="text-sm text-muted-foreground">
              Gestion de finances personnelles
            </p>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function MainLayout() {
  const navigate = useNavigate()
  const signOut = useAuthStore((s) => s.signOut)

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/app" className="font-semibold">
            Finzeo
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/app">
              <Button variant="ghost" size="sm">
                Tableau de bord
              </Button>
            </Link>
            <Link to="/app/import">
              <Button variant="ghost" size="sm">
                Importer
              </Button>
            </Link>
            <Link to="/app/transactions">
              <Button variant="ghost" size="sm">
                Transactions
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <Outlet />
      </main>
    </div>
  )
}

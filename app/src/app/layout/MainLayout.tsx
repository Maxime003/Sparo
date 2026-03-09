import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/app', label: 'Tableau de bord', exact: true },
  { to: '/app/import', label: 'Importer' },
  { to: '/app/categorize', label: 'Catégoriser' },
  { to: '/app/transactions', label: 'Transactions' },
  { to: '/app/pending', label: 'En attente' },
]

export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = useAuthStore((s) => s.signOut)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  function isActive(to: string, exact?: boolean) {
    return exact ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/app" className="font-semibold">
            Finzeo
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={isActive(item.to, item.exact) ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </nav>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all',
            mobileOpen ? 'max-h-64 border-t' : 'max-h-0'
          )}
        >
          <nav className="container flex flex-col gap-1 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant={isActive(item.to, item.exact) ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

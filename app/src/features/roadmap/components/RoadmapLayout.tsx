import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/roadmap', label: 'Roadmap', exact: true },
  { to: '/roadmap/ideas', label: 'Idées' },
]

export function RoadmapLayout() {
  const { user } = useAuthStore()
  const location = useLocation()
  const isAdmin = user?.user_metadata?.is_admin === true

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <img src="/sparo-logo.svg" alt="Sparo" className="hidden sm:block h-8" />
            <img src="/sparo-icon.svg" alt="Sparo" className="sm:hidden h-7 w-7" />
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium px-3 py-2 rounded-md transition-colors',
                  isActive(link.to, link.exact)
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/roadmap/admin"
                className={cn(
                  'text-sm font-medium px-3 py-2 rounded-md transition-colors',
                  isActive('/roadmap/admin')
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

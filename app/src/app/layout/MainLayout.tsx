import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Upload,
  Tag,
  List,
  Clock,
  Menu,
  LogOut,
  Map,
} from 'lucide-react'
import { useState } from 'react'

function getInitials(user: { email?: string; user_metadata?: { full_name?: string } } | null): string {
  const fullName = user?.user_metadata?.full_name
  if (fullName) {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return fullName.slice(0, 2).toUpperCase()
  }
  const email = user?.email ?? ''
  return email.slice(0, 2).toUpperCase()
}

const NAV_ITEMS = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { to: '/app/import', label: 'Importer', icon: Upload },
  { to: '/app/categorize', label: 'Catégoriser', icon: Tag },
  { to: '/app/transactions', label: 'Transactions', icon: List },
  { to: '/app/pending', label: 'En attente', icon: Clock },
]

export function MainLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavLink = ({
    to,
    label,
    icon: Icon,
    exact,
    mobile = false,
  }: {
    to: string
    label: string
    icon: React.ElementType
    exact?: boolean
    mobile?: boolean
  }) => {
    const active = isActive(to, exact)
    return (
      <Link
        to={to}
        onClick={() => mobile && setMobileOpen(false)}
        className={cn(
          'flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-md',
          mobile ? 'w-full text-base py-3' : '',
          active
            ? 'text-primary bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        <Icon className={cn('shrink-0', mobile ? 'h-5 w-5' : 'h-4 w-4')} />
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/app"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <img src="/sparo-logo.svg" alt="Sparo" className="hidden sm:block h-8" />
            <img src="/sparo-icon.svg" alt="Sparo" className="sm:hidden h-7 w-7" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Avatar dropdown — desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: '#4f46e5', fontSize: '12px' }}
                >
                  {getInitials(user)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <span className="text-xs text-muted-foreground truncate block">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/roadmap" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Roadmap & idées
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Sheet header */}
                  <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                    <img src="/sparo-icon.svg" alt="Sparo" className="h-7 w-7" />
                    <span className="font-display font-semibold">Sparo</span>
                  </div>

                  {/* Sheet nav */}
                  <nav className="flex flex-col gap-1 p-3 flex-1">
                    {NAV_ITEMS.map((item) => (
                      <NavLink key={item.to} {...item} mobile />
                    ))}
                    <Link
                      to="/roadmap"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-base font-medium transition-colors px-3 py-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <Map className="h-5 w-5 shrink-0" />
                      Roadmap & idées
                    </Link>
                  </nav>

                  {/* Sheet footer */}
                  <div className="p-3 border-t border-border">
                    {user?.email && (
                      <p className="text-xs text-muted-foreground px-3 mb-2 truncate">
                        {user.email}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignOut()
                      }}
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

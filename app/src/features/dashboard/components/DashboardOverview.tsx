import { TrendingUp, TrendingDown, Wallet, Building2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAmount, formatAmountSigned } from '@/lib/utils/currency'
import { formatTransactionDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

interface BalanceOverviewProps {
  bankBalance: number
  bankBalanceDate: string | null
  pendingTotal: number
  realBalance: number
  isLoading: boolean
}

interface MonthlyOverviewProps {
  income: number
  expenses: number
  net: number
  isLoading: boolean
}

export function BalanceOverview({
  bankBalance,
  bankBalanceDate,
  pendingTotal,
  realBalance,
  isLoading,
}: BalanceOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Card className="shadow-sm">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-10 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="h-4 w-24 animate-pulse rounded bg-muted mb-2" />
                <div className="h-7 w-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Hero card — Solde réel */}
      <Card className="shadow-sm border-border">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Solde réel
              </p>
              <p
                className={cn(
                  'text-4xl font-bold tabular-nums tracking-tight',
                  realBalance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive'
                )}
              >
                {formatAmountSigned(realBalance)}
              </p>
              <p className="text-xs text-muted-foreground">
                Solde bancaire + dépenses en attente
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary row — Solde bancaire + En attente */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Solde bancaire
              </p>
            </div>
            <p className="text-xl font-semibold tabular-nums">
              {formatAmount(bankBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bankBalanceDate
                ? `au ${formatTransactionDate(bankBalanceDate)}`
                : 'Aucun relevé importé'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                En attente
              </p>
            </div>
            <p
              className={cn(
                'text-xl font-semibold tabular-nums',
                pendingTotal !== 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : ''
              )}
            >
              {formatAmount(pendingTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingTotal === 0 ? 'Rien en attente' : 'dépenses à venir'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function DashboardOverview({ income, expenses, net, isLoading }: MonthlyOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatAmount(income)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive tabular-nums">
            {formatAmount(Math.abs(expenses))}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solde du mois</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums',
              net >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-destructive'
            )}
          >
            {formatAmountSigned(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

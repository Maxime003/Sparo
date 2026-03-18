import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '../hooks/useDashboard'
import { BalanceOverview, DashboardOverview } from '../components/DashboardOverview'
import { TopCategories } from '../components/TopCategories'
import { formatMonthYear, formatTransactionDate } from '@/lib/utils/date'

export function DashboardPage() {
  const [month, setMonth] = useState(() => new Date())
  const { totals, topCategories, stats, balance, lastCategorizedDate, isLoading, isBalanceLoading, error } = useDashboard(month)

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-destructive">
          Erreur : {error instanceof Error ? error.message : 'Une erreur est survenue'}
        </p>
      </div>
    )
  }

  const hasNoData = !isLoading && stats.totalTransactions === 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>

      <BalanceOverview
        bankBalance={balance.bankBalance}
        bankBalanceDate={balance.bankBalanceDate}
        pendingTotal={balance.pendingTotal}
        realBalance={balance.realBalance}
        isLoading={isBalanceLoading}
      />

      {lastCategorizedDate ? (
        <p className="text-xs text-muted-foreground text-center">
          Transactions catégorisées jusqu'au {formatTransactionDate(lastCategorizedDate)}
        </p>
      ) : (
        !isBalanceLoading && (
          <p className="text-xs text-muted-foreground text-center">
            Aucune transaction catégorisée
          </p>
        )
      )}

      {/* Section header + month navigator — always visible */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Analyse mensuelle
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize">
            {formatMonthYear(month)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasNoData ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Aucune donnée ce mois-ci. Importe un relevé pour voir ta vision.
          </p>
          <Button asChild>
            <Link to="/app/import">Importer ton premier relevé</Link>
          </Button>
        </div>
      ) : (
        <>
          <DashboardOverview
            income={totals.income}
            expenses={totals.expenses}
            net={totals.net}
            isLoading={isLoading}
          />

          <TopCategories
            categories={topCategories}
            isLoading={isLoading}
          />

          {!isLoading && (
            stats.uncategorized > 0 ? (
              <div className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    {stats.uncategorized} transaction{stats.uncategorized > 1 ? 's' : ''} non catégorisée{stats.uncategorized > 1 ? 's' : ''}. Ça prend 30 secondes.
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 shrink-0"
                >
                  <Link to="/app/categorize">Catégoriser</Link>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                {stats.totalTransactions} transaction{stats.totalTransactions > 1 ? 's' : ''} · tout est catégorisé
              </p>
            )
          )}
        </>
      )}
    </div>
  )
}

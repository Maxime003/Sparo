import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '../hooks/useDashboard'
import { BalanceOverview, DashboardOverview } from '../components/DashboardOverview'
import { TopCategories } from '../components/TopCategories'
import { formatMonthYear } from '@/lib/utils/date'

export function DashboardPage() {
  const [month, setMonth] = useState(() => new Date())
  const { totals, topCategories, stats, balance, isLoading, isBalanceLoading, error } = useDashboard(month)

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center font-medium capitalize">
            {formatMonthYear(month)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BalanceOverview
        bankBalance={balance.bankBalance}
        bankBalanceDate={balance.bankBalanceDate}
        pendingTotal={balance.pendingTotal}
        realBalance={balance.realBalance}
        isLoading={isBalanceLoading}
      />

      {hasNoData ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Aucune transaction pour le moment.
          </p>
          <Button asChild>
            <Link to="/app/import">Importer votre premier relevé bancaire</Link>
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold">Ce mois-ci</h2>
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
            <p className="text-sm text-muted-foreground">
              {stats.totalTransactions} transaction{stats.totalTransactions > 1 ? 's' : ''}
              {stats.uncategorized > 0 && (
                <>
                  {' · '}{stats.uncategorized} non catégorisée{stats.uncategorized > 1 ? 's' : ''}{' '}
                  <Link
                    to="/app/categorize"
                    className="text-primary underline hover:no-underline"
                  >
                    Catégoriser →
                  </Link>
                </>
              )}
            </p>
          )}
        </>
      )}
    </div>
  )
}

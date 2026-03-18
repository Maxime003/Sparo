import { useState } from 'react'
import { PiggyBank, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import { useBudgets } from '../hooks/useBudgets'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { BudgetProgressBar } from './BudgetProgressBar'
import { MonthNavigator } from './MonthNavigator'

export function BudgetsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [month, setMonth] = useState(() => new Date())
  const { data: budgets = [], isLoading, error } = useBudgets(month)

  const sorted = [...budgets].sort((a, b) => b.percentage - a.percentage)

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const totalPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
  const isOver = totalRemaining < 0

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Mes budgets</h1>
        <p className="text-destructive">
          Erreur : {error instanceof Error ? error.message : 'Une erreur est survenue'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Mes budgets</h1>
        <Button variant="outline" size="icon" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-center -mt-3">
        <MonthNavigator value={month} onChange={setMonth} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      ) : budgets.length === 0 ? (
        /* Empty state */
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PiggyBank className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Aucun budget défini pour le moment</p>
              <p className="text-sm text-muted-foreground">
                Définis un budget par catégorie pour suivre tes dépenses.
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)} size="sm">
              Créer mon premier budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Global summary card */}
          <Card className="shadow-sm">
            <CardContent className="pt-5 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total budgeté
                </p>
                <p className="text-sm font-medium text-muted-foreground tabular-nums">
                  {formatAmount(totalBudgeted)}
                </p>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tabular-nums">
                  {formatAmount(totalSpent)}
                </span>
                <span className="text-sm text-muted-foreground">
                  dépensé ce mois
                </span>
              </div>
              <BudgetProgressBar percentage={totalPercentage} />
              <div className="flex items-center justify-between text-sm">
                <span
                  className={cn(
                    'font-medium',
                    isOver ? 'text-[#ef4444]' : 'text-[#22c55e]'
                  )}
                >
                  {isOver
                    ? `Dépassé de ${formatAmount(Math.abs(totalRemaining))}`
                    : `${formatAmount(totalRemaining)} restant`}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(totalPercentage)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Budget cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        </>
      )}

      <BudgetForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}

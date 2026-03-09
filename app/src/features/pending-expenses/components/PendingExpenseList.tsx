import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { formatTransactionDate } from '@/lib/utils/date'
import { usePendingExpenses, useDeletePendingExpense } from '../hooks/usePendingExpenses'

export function PendingExpenseList() {
  const { expenses, total, isLoading } = usePendingExpenses()
  const deleteExpense = useDeletePendingExpense()

  function handleDelete(id: string) {
    if (!window.confirm('Supprimer cette dépense en attente ?')) return
    deleteExpense.mutate(id)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Aucune dépense en attente</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez les dépenses qui n'apparaissent pas encore sur votre relevé bancaire
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Dépenses en cours</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{expense.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatTransactionDate(expense.expense_date)}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <AmountDisplay amount={expense.amount} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(expense.id)}
                disabled={deleteExpense.isPending}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3 border-t font-medium">
          <span>Total en attente :</span>
          <AmountDisplay amount={total} />
        </div>
      </CardContent>
    </Card>
  )
}

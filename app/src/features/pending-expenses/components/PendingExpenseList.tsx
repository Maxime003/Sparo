import { Trash2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { formatTransactionDate } from '@/lib/utils/date'
import { formatAmountSigned } from '@/lib/utils/currency'
import { usePendingExpenses, useDeletePendingExpense } from '../hooks/usePendingExpenses'

export function PendingExpenseList() {
  const { expenses, total, isLoading, error } = usePendingExpenses()
  const deleteExpense = useDeletePendingExpense()

  if (isLoading) {
    return (
      <Card className="shadow-sm">
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

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-3 py-8 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Impossible de charger les dépenses en attente.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Aucune dépense en attente</p>
            <p className="text-sm text-muted-foreground">
              Ajoute les dépenses qui n'apparaissent pas encore
              sur ton relevé bancaire.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <h2 className="text-lg font-semibold">Dépenses en attente</h2>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleteExpense.isPending}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer la dépense ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      « {expense.description} » sera définitivement supprimée.
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteExpense.mutate(expense.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-border">
          <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Total en attente
          </span>
          <span className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {formatAmountSigned(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

import { PendingExpenseForm } from '../components/PendingExpenseForm'
import { PendingExpenseList } from '../components/PendingExpenseList'

export function PendingExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dépenses en attente</h1>
        <p className="text-muted-foreground">
          Ces dépenses ne sont pas encore sur ton relevé bancaire.
        </p>
      </div>
      <PendingExpenseForm />
      <PendingExpenseList />
    </div>
  )
}

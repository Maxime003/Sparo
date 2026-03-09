import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils/currency'
import { formatTransactionDate } from '@/lib/utils/date'
import type { ReconciliationMatch } from '../services/reconciliation'

interface ReconciliationReviewProps {
  matches: ReconciliationMatch[]
  onConfirm: (confirmedMatches: ReconciliationMatch[]) => void
  isImporting: boolean
}

export function ReconciliationReview({ matches, onConfirm, isImporting }: ReconciliationReviewProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const m of matches) {
      initial[m.pendingExpense.id] = m.confidence === 'high'
    }
    return initial
  })

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleConfirm() {
    const confirmed = matches.filter((m) => checked[m.pendingExpense.id])
    onConfirm(confirmed)
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Rapprochement des dépenses en attente</h2>
        <p className="text-sm text-muted-foreground">
          Ces dépenses en attente semblent correspondre à des transactions de votre relevé
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.map((match) => (
          <label
            key={match.pendingExpense.id}
            className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={checked[match.pendingExpense.id] ?? false}
              onChange={() => toggle(match.pendingExpense.id)}
            />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Dépense en attente</p>
                <p className="text-muted-foreground">
                  {formatTransactionDate(match.pendingExpense.expense_date)}
                </p>
                <p>{match.pendingExpense.description}</p>
                <p className="text-red-600 font-medium tabular-nums">
                  {formatAmount(match.pendingExpense.amount)}
                </p>
              </div>
              <div>
                <p className="font-medium">Transaction relevé</p>
                <p className="text-muted-foreground">
                  {formatTransactionDate(match.transaction.date)}
                </p>
                <p className="truncate">{match.transaction.label}</p>
                <p className="text-red-600 font-medium tabular-nums">
                  {formatAmount(-(match.transaction.debit ?? 0))}
                </p>
              </div>
            </div>
            <Badge variant={match.confidence === 'high' ? 'default' : 'secondary'}>
              {match.confidence === 'high' ? 'Forte' : 'Moyenne'}
            </Badge>
          </label>
        ))}

        <Button className="w-full" onClick={handleConfirm} disabled={isImporting}>
          {isImporting ? 'Import en cours...' : 'Continuer l\'import'}
        </Button>
      </CardContent>
    </Card>
  )
}

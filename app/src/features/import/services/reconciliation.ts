import type { PendingExpense } from '@/types/transaction'
import type { ParsedCSVRow } from '@/types/csv'

export interface ReconciliationMatch {
  pendingExpense: PendingExpense
  transaction: ParsedCSVRow
  confidence: 'high' | 'medium'
}

function daysDiff(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / msPerDay
}

export function findReconciliationMatches(
  pendingExpenses: PendingExpense[],
  newTransactions: ParsedCSVRow[]
): ReconciliationMatch[] {
  const matches: ReconciliationMatch[] = []
  const usedTransactions = new Set<number>()
  const usedExpenses = new Set<string>()

  // Build candidate matches for each pending expense
  type Candidate = { expenseIdx: number; txIdx: number; dateDiff: number }
  const candidates: Candidate[] = []

  for (let ei = 0; ei < pendingExpenses.length; ei++) {
    const expense = pendingExpenses[ei]
    const expenseAbs = Math.abs(expense.amount)

    for (let ti = 0; ti < newTransactions.length; ti++) {
      const tx = newTransactions[ti]
      if (!tx.debit) continue // only match debits

      if (Math.abs(expenseAbs - tx.debit) <= 0.01) {
        const diff = daysDiff(expense.expense_date, tx.date)
        if (diff <= 7) {
          candidates.push({ expenseIdx: ei, txIdx: ti, dateDiff: diff })
        }
      }
    }
  }

  // Sort by date proximity (closest first) for greedy 1:1 matching
  candidates.sort((a, b) => a.dateDiff - b.dateDiff)

  for (const c of candidates) {
    const expense = pendingExpenses[c.expenseIdx]
    if (usedExpenses.has(expense.id) || usedTransactions.has(c.txIdx)) continue

    usedExpenses.add(expense.id)
    usedTransactions.add(c.txIdx)

    matches.push({
      pendingExpense: expense,
      transaction: newTransactions[c.txIdx],
      confidence: c.dateDiff <= 3 ? 'high' : 'medium',
    })
  }

  return matches
}

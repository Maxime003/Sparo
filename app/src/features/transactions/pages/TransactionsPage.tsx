import { useState, useCallback } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { TransactionFilters } from '../components/TransactionFilters'
import { TransactionList } from '../components/TransactionList'
import { TransactionEditModal } from '../components/TransactionEditModal'
import { formatAmountSigned } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types/transaction'

export function TransactionsPage() {
  const [month, setMonth] = useState(() => new Date())
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [search, setSearch] = useState<string | undefined>()
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { transactions, totalCount, pageTotal, page, totalPages, setPage, isLoading, error } =
    useTransactions({ month, categoryId, search })

  const handleSearchChange = useCallback((s?: string) => {
    setSearch(s)
    setPage(0)
  }, [setPage])

  const handleCategoryChange = useCallback((id?: string) => {
    setCategoryId(id)
    setPage(0)
  }, [setPage])

  const handleMonthChange = useCallback((m: Date) => {
    setMonth(m)
    setPage(0)
  }, [setPage])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tes transactions</h1>
        {!isLoading && totalCount > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} transaction{totalCount > 1 ? 's' : ''} · Total page :{' '}
            <span
              className={cn(
                'font-medium tabular-nums',
                pageTotal >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-foreground'
              )}
            >
              {formatAmountSigned(pageTotal)}
            </span>
          </p>
        )}
      </div>

      <TransactionFilters
        month={month}
        onMonthChange={handleMonthChange}
        categoryId={categoryId}
        onCategoryChange={handleCategoryChange}
        search={search}
        onSearchChange={handleSearchChange}
      />

      {error ? (
        <p className="text-destructive">
          Erreur : {error instanceof Error ? error.message : 'Une erreur est survenue'}
        </p>
      ) : (
        <TransactionList
          transactions={transactions}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={setEditing}
          isLoading={isLoading}
        />
      )}

      {editing && (
        <TransactionEditModal
          transaction={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

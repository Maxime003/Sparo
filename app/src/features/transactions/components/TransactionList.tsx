import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionRow } from './TransactionRow'
import type { Transaction, Category } from '@/types/transaction'

type TransactionWithCategory = Transaction & { category: Category | null }

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (transaction: Transaction) => void
  isLoading: boolean
}

export function TransactionList({
  transactions,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onEdit,
  isLoading,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-sm">Chargement des transactions…</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (totalCount === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <List className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Aucune transaction pour le moment.</p>
            <p className="text-sm text-muted-foreground">
              Importe un relevé pour voir tes transactions ici.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/import">Importer un relevé</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[160px]">Catégorie</TableHead>
                <TableHead className="w-[120px] text-right">Montant</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TransactionRow key={t.id} transaction={t} onEdit={onEdit} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

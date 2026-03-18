import { useState, useEffect } from 'react'
import { addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/features/categorization/hooks/useCategories'
import { formatMonthYear } from '@/lib/utils/date'

interface TransactionFiltersProps {
  month: Date
  onMonthChange: (month: Date) => void
  categoryId?: string
  onCategoryChange: (categoryId?: string) => void
  search?: string
  onSearchChange: (search?: string) => void
}

export function TransactionFilters({
  month,
  onMonthChange,
  categoryId,
  onCategoryChange,
  search,
  onSearchChange,
}: TransactionFiltersProps) {
  const { categories } = useCategories()
  const [searchInput, setSearchInput] = useState(search ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, onSearchChange])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[160px] text-center font-medium capitalize">
          {formatMonthYear(month)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={categoryId ?? 'all'}
          onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden
                  />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une transaction…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 w-full sm:w-[200px]"
          />
        </div>
      </div>
    </div>
  )
}

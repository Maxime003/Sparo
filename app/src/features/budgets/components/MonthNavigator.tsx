import { addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonthNavigatorProps {
  value: Date
  onChange: (date: Date) => void
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function formatMonth(date: Date): string {
  const s = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function MonthNavigator({ value, onChange }: MonthNavigatorProps) {
  const isCurrentMonth = isSameMonth(value, new Date())

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onChange(subMonths(value, 1))}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="text-center text-sm font-medium text-muted-foreground">
        {formatMonth(value)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onChange(addMonths(value, 1))}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

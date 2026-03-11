import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAmount } from '@/lib/utils/currency'

interface CategoryExpense {
  category_id: string
  name: string
  color: string
  icon: string
  total: number
}

interface TopCategoriesProps {
  categories: CategoryExpense[]
  isLoading: boolean
}

export function TopCategories({ categories, isLoading }: TopCategoriesProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top dépenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const totalExpenses = categories.reduce((sum, c) => sum + Math.abs(c.total), 0) || 1

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top dépenses</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune dépense catégorisée ce mois.
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const percentage = (Math.abs(cat.total) / totalExpenses) * 100
              return (
                <div key={cat.category_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2 text-sm font-medium truncate">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden
                      />
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(0)}%
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatAmount(Math.abs(cat.total))}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

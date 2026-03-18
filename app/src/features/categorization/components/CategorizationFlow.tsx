import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useCategorization } from '@/features/categorization/hooks/useCategorization'
import { useCategorySuggestions } from '@/features/categorization/hooks/useCategorySuggestions'
import { useCategories } from '@/features/categorization/hooks/useCategories'
import { CategorySelector } from './CategorySelector'
import { formatTransactionDate } from '@/lib/utils/date'
import { formatAmountSigned } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import { ChevronLeft, SkipForward, CheckCircle2 } from 'lucide-react'

export function CategorizationFlow() {
  const {
    transactions,
    totalUncategorized,
    lastCategorizedDate,
    currentIndex,
    current,
    isLoading,
    isSaving,
    error,
    localDescription,
    localCategoryId,
    setDescription,
    setCategoryId,
    saveAndNext,
  } = useCategorization()

  const { categories, isLoading: categoriesLoading } = useCategories()
  const {
    suggestedCategoryId,
    confidence: suggestionConfidence,
    isLoading: suggestionsLoading,
  } = useCategorySuggestions(
    current?.original_label ?? '',
    current?.amount ?? 0
  )

  if (isLoading || categoriesLoading) {
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

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <p className="text-destructive">Erreur : {error instanceof Error ? error.message : 'Une erreur est survenue'}</p>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Tout est catégorisé. Bien joué.</p>
            <p className="text-sm text-muted-foreground">
              Consulte ton tableau de bord pour un résumé.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/transactions">Voir les transactions</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const progressLabel = `${totalUncategorized} transaction${totalUncategorized > 1 ? 's' : ''} restante${totalUncategorized > 1 ? 's' : ''}`

  // Determine the confidence to use when saving: if user picked the suggestion, use
  // the engine's confidence; otherwise the user made a manual choice -> confidence 1.
  const effectiveConfidence =
    localCategoryId && localCategoryId === suggestedCategoryId
      ? suggestionConfidence
      : 1

  const amount = current?.amount ?? 0

  return (
    <div className="space-y-4">
      {/* Progress section */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progressLabel}</span>
          {lastCategorizedDate && (
            <span>Dernière : {formatTransactionDate(lastCategorizedDate)}</span>
          )}
        </div>
        <Progress value={0} className="h-1.5" />
      </div>

      {/* Transaction card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {current?.transaction_date
                  ? format(new Date(current.transaction_date), 'EEEE d MMMM yyyy', { locale: fr })
                  : '—'}
              </p>
              <CardTitle className="text-base font-medium leading-snug">
                {current?.original_label ?? '—'}
              </CardTitle>
            </div>
            <span
              className={cn(
                'text-3xl font-bold tabular-nums shrink-0',
                amount >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-destructive'
              )}
            >
              {formatAmountSigned(amount)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <CategorySelector
              categories={categories}
              value={localCategoryId}
              onChange={setCategoryId}
              suggestedCategoryId={suggestionsLoading ? undefined : suggestedCategoryId}
              placeholder="Choisis une catégorie"
            />
            {!localCategoryId && (
              <p className="text-xs text-muted-foreground">
                Choisis une catégorie pour pouvoir valider.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description personnalisée</Label>
            <Input
              id="description"
              value={localDescription}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex. Restaurant du centre"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-2 pt-4 border-t border-border sm:flex-row sm:justify-between">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => saveAndNext('previous')}
              disabled={currentIndex === 0 || isSaving}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédente
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => saveAndNext('skip')}
              disabled={isSaving}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Passer
            </Button>
          </div>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => saveAndNext('next', effectiveConfidence)}
            disabled={!localCategoryId || isSaving}
          >
            {isSaving ? 'Enregistrement…' : 'Valider & Suivante'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCategorization } from '@/features/categorization/hooks/useCategorization'
import { useCategorySuggestions } from '@/features/categorization/hooks/useCategorySuggestions'
import { useCategories } from '@/features/categorization/hooks/useCategories'
import { CategorySelector } from './CategorySelector'
import { ChevronLeft, SkipForward } from 'lucide-react'

export function CategorizationFlow() {
  const {
    transactions,
    totalUncategorized,
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
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Chargement des transactions…</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Erreur : {error instanceof Error ? error.message : 'Une erreur est survenue'}</p>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">
            Toutes vos transactions sont déjà catégorisées !
          </p>
          <Link to="/app/transactions" className="text-primary underline hover:no-underline">
            Voir la liste des transactions
          </Link>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Catégoriser vos transactions</CardTitle>
        <span className="text-sm text-muted-foreground">{progressLabel}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {current?.transaction_date
                ? format(new Date(current.transaction_date), 'EEEE d MMMM yyyy', { locale: fr })
                : '—'}
            </span>
            <span
              className={
                (current?.amount ?? 0) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
              }
            >
              {(current?.amount ?? 0) >= 0 ? '+' : ''}
              {(current?.amount ?? 0).toFixed(2)} €
            </span>
          </div>
          <p className="font-medium">{current?.original_label ?? '—'}</p>
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

        <div className="space-y-2">
          <Label>Catégorie</Label>
          <CategorySelector
            categories={categories}
            value={localCategoryId}
            onChange={setCategoryId}
            suggestedCategoryId={suggestionsLoading ? undefined : suggestedCategoryId}
            placeholder="Sélectionnez une catégorie"
          />
          {!localCategoryId && (
            <p className="text-xs text-muted-foreground">
              Sélectionnez une catégorie pour pouvoir valider.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => saveAndNext('previous')}
          disabled={currentIndex === 0 || isSaving}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédente
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => saveAndNext('skip')}
          disabled={isSaving}
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Passer
        </Button>
        <Button
          type="button"
          onClick={() => saveAndNext('next', effectiveConfidence)}
          disabled={!localCategoryId || isSaving}
        >
          {isSaving ? 'Enregistrement…' : 'Valider & Suivante'}
        </Button>
      </CardFooter>
    </Card>
  )
}

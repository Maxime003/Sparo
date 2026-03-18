import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ParsedCSVResult } from '@/types/csv'
import { CSVUpload } from '@/features/import/components/CSVUpload'
import { ImportSummary } from '@/features/import/components/ImportSummary'
import { ReconciliationReview } from '@/features/import/components/ReconciliationReview'
import { useCSVImport } from '@/features/import/hooks/useCSVImport'
import { usePendingExpenses } from '@/features/pending-expenses/hooks/usePendingExpenses'
import { findReconciliationMatches, type ReconciliationMatch } from '../services/reconciliation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Step = 'upload' | 'summary' | 'reconciliation'

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Ton fichier' },
  { key: 'summary', label: 'Aperçu' },
  { key: 'reconciliation', label: 'Réconciliation' },
]

export function ImportPage() {
  const [result, setResult] = useState<ParsedCSVResult | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>('upload')
  const [matches, setMatches] = useState<ReconciliationMatch[]>([])
  const { toast } = useToast()
  const navigate = useNavigate()
  const { importToDb, isImporting } = useCSVImport()
  const { expenses: pendingExpenses } = usePendingExpenses()

  const handleParsed = useCallback((parsedResult: ParsedCSVResult, parsedFile: File) => {
    setResult(parsedResult)
    setFile(parsedFile)
    setStep('summary')
  }, [])

  const doImport = useCallback((confirmedMatches: ReconciliationMatch[]) => {
    if (!result || !file) return
    importToDb(result, file, confirmedMatches)
      .then(() => {
        toast({ title: 'Import terminé', description: `${result.transactions.length} transactions prêtes à catégoriser.` })
        navigate('/app/categorize', { replace: true })
      })
      .catch(() => {
        toast({
          title: 'Erreur d\'import',
          description: 'Impossible d\'enregistrer les transactions. Réessayez.',
          variant: 'destructive',
        })
      })
  }, [result, file, importToDb, toast, navigate])

  const handleConfirmSummary = useCallback(() => {
    if (!result) return
    if (pendingExpenses.length > 0) {
      const found = findReconciliationMatches(pendingExpenses, result.transactions)
      if (found.length > 0) {
        setMatches(found)
        setStep('reconciliation')
        return
      }
    }
    doImport([])
  }, [result, pendingExpenses, doImport])

  const handleReconciliationConfirm = useCallback((confirmed: ReconciliationMatch[]) => {
    doImport(confirmed)
  }, [doImport])

  const handleReset = useCallback(() => {
    setResult(null)
    setFile(null)
    setStep('upload')
    setMatches([])
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Importer ton relevé</h1>
        {step !== 'upload' && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Changer de fichier
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">
        Importe un export de compte Crédit Agricole (format CSV).
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const stepIndex = STEPS.findIndex((x) => x.key === step)
          const isDone = i < stepIndex
          const isCurrent = i === stepIndex
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={cn(
                    'h-px w-6',
                    isDone ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    isCurrent ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {step === 'upload' && <CSVUpload onParsed={handleParsed} />}

      {step === 'summary' && result && (
        <ImportSummary
          result={result}
          onConfirm={handleConfirmSummary}
          isImporting={isImporting}
        />
      )}

      {step === 'reconciliation' && (
        <ReconciliationReview
          matches={matches}
          onConfirm={handleReconciliationConfirm}
          isImporting={isImporting}
        />
      )}
    </div>
  )
}

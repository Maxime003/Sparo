import { useState, useCallback, useEffect } from 'react'
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

type Step = 'upload' | 'summary' | 'reconciliation'

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

  // When user confirms summary, check for reconciliation matches
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
    // No matches — import directly
    doImport([])
  }, [result, pendingExpenses])

  const handleReconciliationConfirm = useCallback((confirmed: ReconciliationMatch[]) => {
    doImport(confirmed)
  }, [result, file])

  function doImport(confirmedMatches: ReconciliationMatch[]) {
    if (!result || !file) return
    importToDb(result, file, confirmedMatches)
      .then(() => {
        toast({ title: 'Import réussi', description: 'Les transactions ont été importées.' })
        navigate('/app/categorize', { replace: true })
      })
      .catch(() => {
        toast({
          title: 'Erreur d\'import',
          description: 'Impossible d\'enregistrer les transactions. Réessayez.',
          variant: 'destructive',
        })
      })
  }

  const handleReset = useCallback(() => {
    setResult(null)
    setFile(null)
    setStep('upload')
    setMatches([])
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Importer un CSV</h1>
        {step !== 'upload' && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Changer de fichier
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">
        Importez un export de compte Crédit Agricole (format CSV).
      </p>

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

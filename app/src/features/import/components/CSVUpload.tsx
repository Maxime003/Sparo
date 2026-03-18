import { useCallback, useRef } from 'react'
import { Upload } from 'lucide-react'
import { parseCreditAgricoleCSV } from '@/lib/csv/parser'
import type { ParsedCSVResult } from '@/types/csv'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 Mo
const ACCEPTED_EXT = '.csv'

interface CSVUploadProps {
  onParsed: (result: ParsedCSVResult, file: File) => void
}

export function CSVUpload({ onParsed }: CSVUploadProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return

      const ext = file.name.toLowerCase().slice(-4)
      if (ext !== ACCEPTED_EXT) {
        toast({
          title: 'Fichier invalide',
          description: 'Sélectionne un fichier CSV.',
          variant: 'destructive',
        })
        return
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'Taille maximale : 5 Mo.',
          variant: 'destructive',
        })
        return
      }

      try {
        const result = await parseCreditAgricoleCSV(file)
        if (result.transactions.length === 0) {
          toast({
            title: 'Aucune transaction',
            description: 'Le fichier ne contient pas de ligne de transaction reconnue.',
            variant: 'destructive',
          })
          return
        }
        onParsed(result, file)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Ce fichier n\'a pas pu être lu. Vérifie que c\'est bien un CSV Crédit Agricole.'
        toast({
          title: 'Erreur de lecture',
          description: message,
          variant: 'destructive',
        })
      }
    },
    [onParsed, toast]
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      handleFile(file ?? null)
      e.target.value = ''
    },
    [handleFile]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      handleFile(file ?? null)
    },
    [handleFile]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        className="hidden"
        onChange={onInputChange}
      />
      <div
        role="button"
        tabIndex={0}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium text-foreground mb-1">
          Glisse ton relevé CSV ici ou clique pour choisir
        </p>
        <p className="text-xs text-muted-foreground">
          Fichier Crédit Agricole uniquement, max 5 Mo
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={onClick}
      >
        Choisir un fichier
      </Button>
    </div>
  )
}

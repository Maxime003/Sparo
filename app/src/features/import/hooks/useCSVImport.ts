import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { detectDuplicates } from '@/lib/csv/normalizer'
import { extractOperationType } from '@/lib/csv/parser'
import type { ParsedCSVResult } from '@/types/csv'
import type { ReconciliationMatch } from '../services/reconciliation'

export function useCSVImport() {
  const user = useAuthStore((s) => s.user)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importToDb = useCallback(
    async (result: ParsedCSVResult, file: File, confirmedMatches?: ReconciliationMatch[]) => {
      if (!user) {
        setError('Non connecté')
        return
      }
      setIsImporting(true)
      setError(null)
      try {
        const { metadata, transactions } = result

        // 1) Charger les transactions existantes (période du fichier)
        const { data: existingRows } = await supabase
          .from('transactions')
          .select('id, user_id, transaction_date, amount, original_label')
          .eq('user_id', user.id)
          .gte('transaction_date', metadata.periodStart)
          .lte('transaction_date', metadata.periodEnd)

        const existingTransactions = (existingRows ?? []).map((row) => ({
          transaction_date: row.transaction_date as string,
          amount: row.amount as number,
          original_label: row.original_label as string,
        }))

        // 2) Exclure les doublons
        const { unique, duplicates } = detectDuplicates(
          transactions,
          existingTransactions
        )

        // 3) Créer l'import_batch
        const { data: batchRow, error: batchError } = await supabase
          .from('import_batches')
          .insert({
            user_id: user.id,
            filename: file.name,
            file_size: file.size,
            download_date: metadata.downloadDate,
            account_name: metadata.accountName,
            account_balance: metadata.balance,
            period_start: metadata.periodStart,
            period_end: metadata.periodEnd,
            total_transactions: transactions.length,
            imported_transactions: unique.length,
            duplicates_skipped: duplicates.length,
          })
          .select('id')
          .single()

        if (batchError) throw batchError
        const batchId = batchRow?.id
        if (!batchId) throw new Error('Création du batch impossible')

        // 4) Insérer les transactions uniques
        if (unique.length > 0) {
          const rows = unique.map((tx) => {
            const amount = tx.debit ? -tx.debit : tx.credit ?? 0
            return {
              user_id: user.id,
              transaction_date: tx.date,
              amount,
              original_label: tx.label,
              operation_type: extractOperationType(tx.label) ?? null,
              account_name: metadata.accountName,
              is_recurring: false,
              import_batch_id: batchId,
            }
          })
          const { error: insertError } = await supabase
            .from('transactions')
            .insert(rows)
          if (insertError) throw insertError
        }

        // 5) Créer ou mettre à jour le snapshot
        const { error: snapshotError } = await supabase
          .from('account_snapshots')
          .upsert(
            {
              user_id: user.id,
              snapshot_date: metadata.balanceDate,
              balance: metadata.balance,
              account_name: metadata.accountName,
            },
            {
              onConflict: 'user_id,snapshot_date,account_name',
            }
          )
        if (snapshotError) throw snapshotError

        // 6) Reconcile confirmed pending expenses
        if (confirmedMatches && confirmedMatches.length > 0) {
          // Fetch inserted transactions for this batch to find IDs
          const { data: insertedRows } = await supabase
            .from('transactions')
            .select('id, transaction_date, amount, original_label')
            .eq('import_batch_id', batchId)

          const inserted = insertedRows ?? []

          for (const match of confirmedMatches) {
            const targetAmount = match.transaction.debit ? -match.transaction.debit : match.transaction.credit ?? 0
            const found = inserted.find(
              (row) =>
                row.transaction_date === match.transaction.date &&
                Math.abs(row.amount - targetAmount) < 0.01 &&
                row.original_label.startsWith(match.transaction.label.slice(0, 20))
            )
            if (found) {
              await supabase
                .from('pending_expenses')
                .update({ reconciled_with: found.id, reconciled_at: new Date().toISOString() })
                .eq('id', match.pendingExpense.id)
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors de l\'import'
        setError(message)
        throw err
      } finally {
        setIsImporting(false)
      }
    },
    [user]
  )

  return { importToDb, isImporting, error }
}

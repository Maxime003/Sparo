import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategorySelector } from '@/features/categorization/components/CategorySelector'
import { useCategories } from '@/features/categorization/hooks/useCategories'
import { useToast } from '@/hooks/use-toast'
import type { Transaction } from '@/types/transaction'

interface TransactionEditModalProps {
  transaction: Transaction
  onClose: () => void
}

export function TransactionEditModal({ transaction, onClose }: TransactionEditModalProps) {
  const [description, setDescription] = useState(
    transaction.description || transaction.original_label
  )
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? '')
  const { categories } = useCategories()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('transactions')
        .update({
          description: description || null,
          category_id: categoryId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['uncategorized_transactions'] })
      toast({ title: 'Transaction mise à jour' })
      onClose()
    },
    onError: () => {
      toast({ title: 'Erreur lors de la mise à jour', variant: 'destructive' })
    },
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la transaction</DialogTitle>
          <DialogDescription className="truncate">
            {transaction.original_label}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description personnalisée"
            />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <CategorySelector
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Choisis une catégorie"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

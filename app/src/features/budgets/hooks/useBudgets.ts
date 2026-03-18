import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import type { Budget, BudgetWithSpending } from '../types'

const BUDGETS_KEY = 'budgets'

export function useBudgets(month: Date) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''

  return useQuery({
    queryKey: [BUDGETS_KEY, userId, month.getFullYear(), month.getMonth()],
    queryFn: async (): Promise<BudgetWithSpending[]> => {
      // 1. Fetch all budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true })
      if (budgetsError) throw budgetsError

      if (!budgets || budgets.length === 0) return []

      // 2. Fetch transactions for selected month (expenses only: amount < 0)
      const monthStart = format(startOfMonth(month), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd')
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount, category:categories(name)')
        .eq('user_id', userId)
        .gte('transaction_date', monthStart)
        .lte('transaction_date', monthEnd)
        .lt('amount', 0)
      if (txError) throw txError

      // 3. Aggregate spending per category name
      const spendingByCategory = new Map<string, number>()
      for (const tx of transactions ?? []) {
        const catName = (tx.category as { name: string } | null)?.name
        if (!catName) continue
        spendingByCategory.set(
          catName,
          (spendingByCategory.get(catName) ?? 0) + Math.abs(tx.amount)
        )
      }

      // 4. Enrich budgets with spending data
      return (budgets as Budget[]).map((b) => {
        const spent = spendingByCategory.get(b.category) ?? 0
        const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0
        const remaining = b.amount - spent
        return { ...b, spent, percentage, remaining }
      })
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useUpsertBudget() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (input: { category: string; amount: number }) => {
      if (!user) throw new Error('Non connecté')
      const { error } = await supabase.from('budgets').upsert(
        {
          user_id: user.id,
          category: input.category,
          amount: input.amount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,category' }
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] })
      toast({ title: 'Budget enregistré' })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] })
      toast({ title: 'Budget supprimé' })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    },
  })
}

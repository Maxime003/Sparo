import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { PendingExpense } from '@/types/transaction'

const QUERY_KEY = 'pending_expenses'

export function usePendingExpenses() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''

  const query = useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pending_expenses')
        .select('*')
        .eq('user_id', userId)
        .is('reconciled_with', null)
        .order('expense_date', { ascending: false })
      if (error) throw error
      return data as PendingExpense[]
    },
    enabled: !!userId,
  })

  const expenses = query.data ?? []
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return { expenses, total, isLoading: query.isLoading, error: query.error }
}

export function useAddPendingExpense() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { amount: number; description: string; expense_date: string }) => {
      if (!user) throw new Error('Non connecté')
      const { error } = await supabase.from('pending_expenses').insert({
        user_id: user.id,
        amount: -Math.abs(input.amount),
        description: input.description,
        expense_date: input.expense_date,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useDeletePendingExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pending_expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

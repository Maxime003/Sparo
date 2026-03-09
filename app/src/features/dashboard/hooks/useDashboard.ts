import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { getMonthRange } from '@/lib/utils/date'

interface MonthlyTotals {
  income: number
  expenses: number
  net: number
}

interface CategoryExpense {
  category_id: string
  name: string
  color: string
  icon: string
  total: number
}

interface MonthlyStats {
  totalTransactions: number
  uncategorized: number
}

async function fetchMonthlyTotals(userId: string, month: Date): Promise<MonthlyTotals> {
  const { start, end } = getMonthRange(month)
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
  if (error) throw error

  let income = 0
  let expenses = 0
  for (const row of data ?? []) {
    if (row.amount >= 0) income += row.amount
    else expenses += row.amount
  }
  return { income, expenses, net: income + expenses }
}

async function fetchTopCategories(userId: string, month: Date): Promise<CategoryExpense[]> {
  const { start, end } = getMonthRange(month)
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, category_id, category:categories(name, color, icon)')
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .lt('amount', 0)
    .not('category_id', 'is', null)
  if (error) throw error

  const byCategory = new Map<string, CategoryExpense>()
  for (const row of data ?? []) {
    const cat = row.category as unknown as { name: string; color: string; icon: string } | null
    if (!row.category_id || !cat) continue
    const existing = byCategory.get(row.category_id)
    if (existing) {
      existing.total += row.amount
    } else {
      byCategory.set(row.category_id, {
        category_id: row.category_id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        total: row.amount,
      })
    }
  }

  return Array.from(byCategory.values())
    .sort((a, b) => a.total - b.total)
    .slice(0, 5)
}

async function fetchMonthlyStats(userId: string, month: Date): Promise<MonthlyStats> {
  const { start, end } = getMonthRange(month)
  const { count: total, error: e1 } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
  if (e1) throw e1

  const { count: uncat, error: e2 } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .is('category_id', null)
  if (e2) throw e2

  return { totalTransactions: total ?? 0, uncategorized: uncat ?? 0 }
}

interface BankBalanceData {
  bankBalance: number
  bankBalanceDate: string | null
  pendingTotal: number
  realBalance: number
}

async function fetchLatestBankBalance(userId: string): Promise<BankBalanceData> {
  const { data: snapshot, error: snapErr } = await supabase
    .from('account_snapshots')
    .select('balance, snapshot_date')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (snapErr) throw snapErr

  // Graceful: if pending_expenses table doesn't exist yet, default to 0
  let pendingTotal = 0
  try {
    const { data: pendingRows, error: pendErr } = await supabase
      .from('pending_expenses')
      .select('amount')
      .eq('user_id', userId)
      .is('reconciled_with', null)
    if (!pendErr) {
      pendingTotal = (pendingRows ?? []).reduce((sum, r) => sum + r.amount, 0)
    }
  } catch {
    // table may not exist yet — ignore
  }

  const bankBalance = snapshot?.balance ?? 0
  const bankBalanceDate = snapshot?.snapshot_date ?? null

  return {
    bankBalance,
    bankBalanceDate,
    pendingTotal,
    realBalance: bankBalance + pendingTotal,
  }
}

export function useDashboard(month: Date) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const monthKey = month.toISOString()

  const totals = useQuery({
    queryKey: ['dashboard_totals', userId, monthKey],
    queryFn: () => fetchMonthlyTotals(userId, month),
    enabled: !!userId,
  })

  const topCategories = useQuery({
    queryKey: ['dashboard_top_categories', userId, monthKey],
    queryFn: () => fetchTopCategories(userId, month),
    enabled: !!userId,
  })

  const stats = useQuery({
    queryKey: ['dashboard_stats', userId, monthKey],
    queryFn: () => fetchMonthlyStats(userId, month),
    enabled: !!userId,
  })

  const balanceData = useQuery({
    queryKey: ['dashboard_balance', userId],
    queryFn: () => fetchLatestBankBalance(userId),
    enabled: !!userId,
  })

  return {
    totals: totals.data ?? { income: 0, expenses: 0, net: 0 },
    topCategories: topCategories.data ?? [],
    stats: stats.data ?? { totalTransactions: 0, uncategorized: 0 },
    balance: balanceData.data ?? { bankBalance: 0, bankBalanceDate: null, pendingTotal: 0, realBalance: 0 },
    isLoading: totals.isLoading || topCategories.isLoading || stats.isLoading,
    isBalanceLoading: balanceData.isLoading,
    error: totals.error || topCategories.error || stats.error,
  }
}

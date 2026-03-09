import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/app/layout/MainLayout'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ImportPage } from '@/features/import/pages/ImportPage'
import { CategorizationPage } from '@/features/categorization/pages/CategorizationPage'
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage'
import { PendingExpensesPage } from '@/features/pending-expenses/pages/PendingExpensesPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: '', element: <Navigate to="/login" replace /> },
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'import', element: <ImportPage /> },
      { path: 'categorize', element: <CategorizationPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'pending', element: <PendingExpensesPage /> },
    ],
  },
])

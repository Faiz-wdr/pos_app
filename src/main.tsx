import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import RootLayout from '@/app/layouts/RootLayout'
import Home from '@/app/routes/Home'
import Modules from '@/app/routes/Modules'
import ClockModulePage from '@/modules/clock/pages/ClockModulePage'
import ShoppingModulePage from '@/modules/shopping/pages/ShoppingModulePage'
import ShoppingListPage from '@/modules/shopping/pages/ShoppingListPage'
import HistoryDetailPage from '@/modules/shopping/pages/HistoryDetailPage'
import Settings from '@/app/routes/Settings'
import Profile from '@/app/routes/Profile'
import AuthGuard from '@/core/firebase/components/auth/AuthGuard'
import IncomeModulePage from '@/app/routes/IncomeModulePage'
import DayPlannerModulePage from '@/modules/day-planner/pages/DayPlannerModulePage'
import './index.css'

import { registerPWA } from '@/core/pwa/pwa'

// Lazy loaded admin views for bundle isolation
const AdminGuard = lazy(() => import('@/admin/components/AdminGuard'))
const AdminLayout = lazy(() => import('@/admin/layouts/AdminLayout'))
const AdminLoginPage = lazy(() => import('@/admin/pages/AdminLoginPage'))
const UnauthorizedPage = lazy(() => import('@/admin/pages/UnauthorizedPage'))
const DashboardPage = lazy(() => import('@/admin/pages/DashboardPage'))
const UsersPage = lazy(() => import('@/admin/pages/UsersPage'))
const ModulesPage = lazy(() => import('@/admin/pages/ModulesPage'))
const AnalyticsPage = lazy(() => import('@/admin/pages/AnalyticsPage'))
const PaymentsPage = lazy(() => import('@/admin/pages/PaymentsPage'))
const ReleasesPage = lazy(() => import('@/admin/pages/ReleasesPage'))
const SupportPage = lazy(() => import('@/admin/pages/SupportPage'))
const SettingsPage = lazy(() => import('@/admin/pages/SettingsPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'modules',
        element: <Modules />
      },
      {
        path: 'modules/clock',
        element: <ClockModulePage />
      },
      {
        path: 'modules/shopping',
        element: <ShoppingModulePage />
      },
      {
        path: 'modules/shopping/list/:id',
        element: <ShoppingListPage />
      },
      {
        path: 'modules/shopping/history/:id',
        element: <HistoryDetailPage />
      },
      {
        path: 'modules/income',
        element: (
          <AuthGuard>
            <IncomeModulePage />
          </AuthGuard>
        )
      },
      {
        path: 'modules/day-planner',
        element: <DayPlannerModulePage />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'profile',
        element: <Profile />
      }
    ]
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'users',
        element: <UsersPage />
      },
      {
        path: 'modules',
        element: <ModulesPage />
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />
      },
      {
        path: 'payments',
        element: <PaymentsPage />
      },
      {
        path: 'releases',
        element: <ReleasesPage />
      },
      {
        path: 'support',
        element: <SupportPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }>
        <AdminLoginPage />
      </Suspense>
    )
  },
  {
    path: '/admin/unauthorized',
    element: (
      <Suspense fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }>
        <UnauthorizedPage />
      </Suspense>
    )
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)

// Register PWA service worker
registerPWA()

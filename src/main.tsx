import React from 'react'
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
import DietModulePage from '@/app/routes/DietModulePage'
import './index.css'

import { registerSW } from 'virtual:pwa-register'

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
        path: 'modules/diet',
        element: (
          <AuthGuard>
            <DietModulePage />
          </AuthGuard>
        )
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
registerSW({
  onNeedRefresh() {
    console.log('New version of Personal OS is available. Refresh to update.')
  },
  onOfflineReady() {
    console.log('Personal OS is fully cached and ready to work offline.')
  }
})

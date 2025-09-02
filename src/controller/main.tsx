import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import store from '../store/store.ts'
import { ThemeProvider } from '@mui/material'
import { appTheme } from '../theme/Theme.tsx'
import { HashRouter, Routes, Route } from 'react-router'

// pages
import GlobalProvider from '@/providers/Global.tsx'
import Controller from '@/controller/Controller.tsx'
import ManageUsersPage from '@/controller/pages/ManageUsers'
import ManageURLsPage from '@/controller/pages/ManageURLs'
import ManageFollowsPage from '@/controller/pages/ManageFollows'
import ManageTweetsPage from '@/controller/pages/ManageTweets'

const root = document.getElementById('root')!

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <GlobalProvider>
        <ThemeProvider theme={appTheme}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Controller />}>
                <Route index element={<ManageUsersPage />} />
                <Route path="users" element={<ManageUsersPage />} />
                <Route path="follows" element={<ManageFollowsPage />} />
                <Route path="urls" element={<ManageURLsPage />} />
                <Route path="tweets" element={<ManageTweetsPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </GlobalProvider>
    </Provider>
  </StrictMode>,
)

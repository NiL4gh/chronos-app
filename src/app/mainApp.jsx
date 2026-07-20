import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { AuthProviderApp } from './AuthProviderApp'
import AppRoutes from './AppRoutes'
import '../index.css'

/**
 * Main App entry point — wrapped by AuthProviderApp and HashRouter.
 * This is the chunk loaded when a session exists (Chunk 3).
 *
 * AppShell is a layout route: its <Outlet> renders the matched child route
 * from AppRoutes, and all page components access the outlet context via useOutletContext().
 */
export default function MainApp() {
  return (
    <HashRouter>
      <AuthProviderApp>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/*" element={<AppRoutes />} />
          </Route>
        </Routes>
      </AuthProviderApp>
    </HashRouter>
  )
}

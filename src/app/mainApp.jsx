import React from 'react'
import { HashRouter } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { AuthProviderApp } from './AuthProviderApp'
import AppRoutes from './AppRoutes'
import '../index.css'

/**
 * Main App entry point — wrapped by AuthProviderApp and HashRouter.
 * This is the chunk loaded when a session exists (Chunk 3).
 * 
 * In production, this is dynamically imported from main.jsx after
 * the lightweight session check confirms a user is authenticated.
 */
export default function MainApp() {
  return (
    <HashRouter>
      <AuthProviderApp>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </AuthProviderApp>
    </HashRouter>
  )
}
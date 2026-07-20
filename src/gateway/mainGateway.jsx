import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import AppGateway from './AppGateway'
import { AuthProviderGateway } from './AuthProviderGateway'
import './../index.css'

/**
 * Standalone gateway entry point for Vite multi-page build.
 * This file is the entry for gateway.html — it mounts the gateway
 * directly without the main app's AuthProvider or AppShell.
 * 
 * In production (Chunk 3), main.jsx will dynamically import AppGateway
 * from this module instead of using it as a direct entry.
 */
export { AppGateway }
export { AuthProviderGateway }

function GatewayApp() {
  return (
    <HashRouter>
      <AppGateway onAuthSuccess={() => {}} />
    </HashRouter>
  )
}


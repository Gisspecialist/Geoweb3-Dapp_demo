import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './hooks/useAuthStore'

import AuthScreen from './components/AuthScreen'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'
import MintService from './components/MintService'
import BitcoinFaucet from './components/BitcoinFaucet'
import AccountLinking from './components/AccountLinking'
import DAO from './components/DAO'
import Compliance from './components/Compliance'
import ProductionReadiness from './components/ProductionReadiness'
import OSMRewards from './components/OSMRewards'
import { MyServices, UpdateMetadata, Rewards, OnChainLog } from './components/Screens'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function EsriOAuthCallback() {
  const { loginWithEsri } = useAuthStore()
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code') || 'mock_code'
    loginWithEsri(code)
  }, [loginWithEsri])
  return <div style={{ color: '#00D4AA', padding: 40, fontFamily: 'monospace' }}>Authenticating with Esri...</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/auth/callback" element={<EsriOAuthCallback />} />
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services"  element={<MyServices />} />
          <Route path="mint"      element={<MintService />} />
          <Route path="faucet"    element={<BitcoinFaucet />} />
          <Route path="osm"       element={<OSMRewards />} />
          <Route path="link"      element={<AccountLinking />} />
          <Route path="dao"       element={<DAO />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="production" element={<ProductionReadiness />} />
          <Route path="update"    element={<UpdateMetadata />} />
          <Route path="rewards"   element={<Rewards />} />
          <Route path="chain"     element={<OnChainLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

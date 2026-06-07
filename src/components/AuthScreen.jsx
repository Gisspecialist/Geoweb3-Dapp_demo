import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import { initiateEsriOAuth } from '../utils/esriApi'

export default function AuthScreen() {
  const navigate = useNavigate()
  const { loginWithWallet } = useAuthStore()
  const [connecting, setConnecting] = useState(null)

  function handleWeb3() {
    setConnecting('web3')
    const demoAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    loginWithWallet(demoAddress, 137)
    navigate('/dashboard')
  }

  function handleEsri() {
    setConnecting('esri')
    if (!import.meta.env.VITE_ARCGIS_CLIENT_ID || import.meta.env.VITE_ARCGIS_CLIENT_ID === 'YOUR_ARCGIS_CLIENT_ID') {
      useAuthStore.getState().loginWithEsri('mock_code')
      navigate('/dashboard')
      return
    }
    initiateEsriOAuth()
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          🌐 GeoWeb3
          <div style={styles.logoSub}>Esri Service Registry + Faucet</div>
        </div>
        <p style={styles.tagline}>
          Mint ArcGIS services as spatial NFTs, simulate GEOW rewards, and test a Bitcoin faucet workflow in the browser canvas.
        </p>

        <div style={styles.methods}>
          <button style={{ ...styles.authBtn, ...styles.authBtnWeb3 }} onClick={handleWeb3} disabled={!!connecting}>
            <span style={{ fontSize: 22 }}>🦊</span>
            <div>
              <div style={{ fontSize: 14 }}>{connecting === 'web3' ? 'Connecting…' : 'Continue with Demo Wallet'}</div>
              <div style={{ fontSize: 11, opacity: .65, marginTop: 1 }}>Canvas-safe local wallet session</div>
            </div>
          </button>

          <button style={{ ...styles.authBtn, ...styles.authBtnEsri }} onClick={handleEsri} disabled={!!connecting}>
            <span style={{ fontSize: 22 }}>🌍</span>
            <div>
              <div style={{ fontSize: 14 }}>{connecting === 'esri' ? 'Redirecting…' : 'Continue with Esri Demo'}</div>
              <div style={{ fontSize: 11, opacity: .65, marginTop: 1 }}>ArcGIS Online / Enterprise mock login</div>
            </div>
          </button>
        </div>

        <div style={styles.footer}>
          Canvas mode uses localStorage and mock transactions.<br />Real Polygon, IPFS, Esri OAuth, and faucet APIs can be enabled through .env.
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--geo-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'var(--geo-panel)', border: '1px solid var(--geo-border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 430, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 },
  logo: { fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--geo-accent)', lineHeight: 1.3 },
  logoSub: { fontSize: 14, color: 'var(--geo-muted)', marginTop: 4, fontFamily: 'var(--sans)' },
  tagline: { fontSize: 13, color: 'var(--geo-muted)', lineHeight: 1.6 },
  methods: { display: 'flex', flexDirection: 'column', gap: 10 },
  authBtn: { padding: '14px 20px', borderRadius: 10, cursor: 'pointer', border: 'none', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all .2s' },
  authBtnWeb3: { background: 'rgba(0,212,170,.12)', color: 'var(--geo-accent)', border: '1px solid rgba(0,212,170,.3)' },
  authBtnEsri: { background: 'rgba(59,130,246,.12)', color: 'var(--geo-accent2)', border: '1px solid rgba(59,130,246,.3)' },
  footer: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--geo-muted)', lineHeight: 1.7 },
}

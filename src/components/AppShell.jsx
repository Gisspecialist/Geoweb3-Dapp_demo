import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'

const NAV = [
  { to: '/dashboard', icon: '◫',  label: 'Dashboard'       },
  { to: '/services',  icon: '🗺',  label: 'My Services'     },
  { to: '/mint',      icon: '🪙',  label: 'Mint Service'    },
  { to: '/faucet',    icon: '₿',   label: 'BTC Faucet'      },
  { to: '/osm',       icon: '🌍',  label: 'OSM Rewards'     },
  { to: '/link',      icon: '✉️',  label: 'Link Account'    },
  { to: '/dao',       icon: '⚖️',  label: 'DAO Voting'      },
  { to: '/compliance',icon: '✅',  label: 'Criteria Check'  },
  { to: '/production',icon: '🚀',  label: 'Production'      },
  { to: '/update',    icon: '✏️',  label: 'Update Metadata' },
  { to: '/rewards',   icon: '🏆',  label: 'Rewards'         },
  { to: '/chain',     icon: '🔗',  label: 'On-Chain Log'    },
]

export default function AppShell() {
  const { logout, displayName, authMethod } = useAuthStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={styles.topbar}>
        <div style={styles.logo}>GEO<span style={{ color: 'var(--geo-accent2)' }}>WEB3</span></div>
        <nav style={styles.nav}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              style={({ isActive }) => ({ ...styles.navPill, ...(isActive ? styles.navActive : {}) })}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={styles.chainBadge}>{import.meta.env.VITE_API_BASE_URL ? 'Production API ◆' : 'Canvas Demo ◆'}</span>
          <button style={styles.walletBtn} title="Click to disconnect" onClick={logout}>
            {displayName()}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, fontFamily: 'var(--mono)', color: 'var(--geo-accent)' }}>{displayName()}</div>
            <div style={{ fontSize: 11, color: 'var(--geo-muted)', marginTop: 2 }}>
              {authMethod === 'esri' ? 'Esri Contributor' : 'Web3 Contributor'}
            </div>
          </div>
          <div style={styles.sidebarStat}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--geo-accent)' }}>1,240</div>
            <div style={{ fontSize: 11, color: 'var(--geo-muted)', marginTop: 2 }}>GEOW tokens earned</div>
          </div>
          <div style={{ ...styles.sidebarStat, marginTop: 4 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--geo-accent2)' }}>7</div>
            <div style={{ fontSize: 11, color: 'var(--geo-muted)', marginTop: 2 }}>NFTs minted</div>
          </div>
          <div style={styles.divider} />
          <div style={styles.sectionLabel}>Navigation</div>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              style={({ isActive }) => ({ ...styles.sideItem, ...(isActive ? styles.sideActive : {}) })}
            >
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
          <div style={{ flex: 1 }} />
          <button style={styles.logoutBtn} onClick={logout}>⏻ Disconnect</button>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const styles = {
  topbar: {
    background: 'var(--geo-panel)',
    borderBottom: '1px solid var(--geo-border)',
    padding: '0 20px',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  logo: {
    fontFamily: 'var(--mono)',
    fontSize: 13,
    color: 'var(--geo-accent)',
    letterSpacing: 1,
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    gap: 2,
    flex: 1,
    overflow: 'hidden',
  },
  navPill: {
    fontSize: 12,
    padding: '5px 10px',
    borderRadius: 6,
    color: 'var(--geo-muted)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'all .15s',
  },
  navActive: {
    color: 'var(--geo-accent)',
    background: 'rgba(0,212,170,.1)',
    border: '1px solid rgba(0,212,170,.25)',
  },
  chainBadge: {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    padding: '3px 8px',
    borderRadius: 4,
    background: 'rgba(245,158,11,.1)',
    color: 'var(--geo-accent3)',
    border: '1px solid rgba(245,158,11,.25)',
  },
  walletBtn: {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    border: '1px solid rgba(0,212,170,.3)',
    background: 'rgba(0,212,170,.12)',
    color: 'var(--geo-accent)',
  },
  sidebar: {
    width: 220,
    background: 'var(--geo-panel)',
    borderRight: '1px solid var(--geo-border)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flexShrink: 0,
    overflowY: 'auto',
  },
  sidebarStat: {
    background: 'var(--geo-card)',
    border: '1px solid var(--geo-border)',
    borderRadius: 8,
    padding: 10,
  },
  divider: { height: 1, background: 'var(--geo-border)', margin: '4px 0' },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '1.5px',
    color: 'var(--geo-muted)',
    padding: '6px 0 2px',
    fontFamily: 'var(--mono)',
    textTransform: 'uppercase',
  },
  sideItem: {
    padding: '8px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--geo-muted)',
    textDecoration: 'none',
    transition: 'all .15s',
  },
  sideActive: {
    background: 'rgba(0,212,170,.1)',
    color: 'var(--geo-accent)',
    border: '1px solid rgba(0,212,170,.15)',
  },
  logoutBtn: {
    padding: '8px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--geo-muted)',
    background: 'none',
    border: 'none',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
  },
}

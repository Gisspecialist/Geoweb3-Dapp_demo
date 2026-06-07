import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useAuthStore — global authentication state
 *
 * Supports two auth methods:
 *   1. Web3 wallet (MetaMask / WalletConnect) — address stored as identity
 *   2. Esri OAuth2 — access token stored, wallet address optional
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authMethod: null,        // 'web3' | 'esri'
      address: null,           // wallet address (0x...)
      esriToken: null,         // Esri OAuth access token
      esriUser: null,          // { username, fullName, email, org }
      chainId: null,

      // ── Web3 login (called by wagmi hooks after wallet connect) ──
      loginWithWallet: (address, chainId) => {
        set({
          isAuthenticated: true,
          authMethod: 'web3',
          address,
          chainId,
        })
      },

      // ── Esri OAuth login ─────────────────────────────────────────
      // In production: exchange `code` for token via your backend
      // to keep client_secret off the frontend.
      loginWithEsri: async (code) => {
        try {
          // TODO: POST to your backend /api/auth/esri { code }
          // which exchanges the code for an access token server-side
          const mockToken = 'esri_mock_token_' + Date.now()
          const mockUser  = { username: 'esri_user', fullName: 'Esri User', email: 'user@org.com', org: 'MyOrg' }

          set({
            isAuthenticated: true,
            authMethod: 'esri',
            esriToken: mockToken,
            esriUser: mockUser,
          })

          window.location.href = '/dashboard'
        } catch (err) {
          console.error('Esri auth failed:', err)
        }
      },

      // ── Logout ───────────────────────────────────────────────────
      logout: () => {
        set({
          isAuthenticated: false,
          authMethod: null,
          address: null,
          esriToken: null,
          esriUser: null,
          chainId: null,
        })
        window.location.href = '/auth'
      },

      // ── Helpers ──────────────────────────────────────────────────
      displayName: () => {
        const { authMethod, address, esriUser } = get()
        if (authMethod === 'web3' && address) return address.slice(0, 6) + '...' + address.slice(-4)
        if (authMethod === 'esri' && esriUser)  return esriUser.email
        return 'Unknown'
      },
    }),
    {
      name: 'geoweb3-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authMethod: state.authMethod,
        address: state.address,
        esriUser: state.esriUser,
        chainId: state.chainId,
        // NOTE: do not persist esriToken — re-auth on page load for security
      }),
    }
  )
)

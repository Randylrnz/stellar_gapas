'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { Wallet, Loader2 } from 'lucide-react'

interface WalletConnectProps {
  onSuccess?: (address: string) => void
  variant?: 'full' | 'compact'
}

export default function WalletConnect({ onSuccess, variant = 'full' }: WalletConnectProps) {
  const [loading, setLoading] = useState(false)
  const { setWalletConnected, setConnecting, showToast, setUser } = useGapasStore()

  async function handleConnect() {
    setLoading(true)
    setConnecting(true)

    // Mock connection
    setTimeout(() => {
      const mockAddress = 'GAX_MOCK_USER_7F8E9D2C3B4A5'
      setWalletConnected(mockAddress, 'testnet')
      setUser({
        id: mockAddress,
        walletAddress: mockAddress,
        role: 'INVESTOR',
        displayName: 'Demo User',
        createdAt: new Date().toISOString(),
      })
      showToast('Wallet connected successfully!', 'success')
      setLoading(false)
      setConnecting(false)
      onSuccess?.(mockAddress)
    }, 600)
  }

  if (variant === 'compact') {
    return (
      <button
        id="wallet-connect-compact"
        onClick={handleConnect}
        disabled={loading}
        className="btn btn-primary btn-sm"
        aria-label="Connect Wallet"
      >
        {loading ? (
          <Loader2 size={14} className="spinner" />
        ) : (
          <Wallet size={14} />
        )}
        {loading ? 'Connecting...' : 'Connect'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        id="wallet-connect-btn"
        onClick={handleConnect}
        disabled={loading}
        className="wallet-connect-btn"
        aria-label="Connect Wallet"
      >
        {loading ? (
          <Loader2 size={22} className="spinner" />
        ) : (
          <Wallet size={22} />
        )}
        <span>{loading ? 'Connecting...' : 'Login with Wallet'}</span>
      </button>

      <p style={{
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        Your wallet is your identity. No email or password needed.
      </p>
    </div>
  )
}

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

    try {
      const { connectFreighter, isFreighterInstalled } = await import('@/lib/stellar')
      const installed = await isFreighterInstalled()
      
      if (installed) {
        const res = await connectFreighter()
        if (res.success && res.address) {
          setWalletConnected(res.address, res.network || 'testnet')
          setUser({
            id: res.address,
            walletAddress: res.address,
            role: 'COOPERATIVE',
            displayName: 'Juan dela Cruz (Freighter)',
            createdAt: new Date().toISOString(),
          })
          showToast(`Wallet connected successfully: ${res.address.slice(0, 6)}...${res.address.slice(-4)}`, 'success')
          setLoading(false)
          setConnecting(false)
          onSuccess?.(res.address)
          return
        } else {
          showToast(`Freighter error: ${(res as any).error || 'Failed to connect'}. Connecting in Demo Mode...`, 'info')
        }
      } else {
        showToast('Freighter wallet not detected. Connecting in Demo Mode...', 'info')
      }
    } catch (err) {
      console.warn('Freighter connection failed, falling back to demo:', err)
    }

    // Mock connection fallback using the user's active testnet account
    setTimeout(() => {
      const mockAddress = 'GBTTGUEMWPFC53GBAHJMQIKD6IGDOLPRMSGPYQP34FKV73FJW5K6ZJZD'
      setWalletConnected(mockAddress, 'testnet')
      setUser({
        id: mockAddress,
        walletAddress: mockAddress,
        role: 'COOPERATIVE',
        displayName: 'Demo User (Stellar Expert)',
        createdAt: new Date().toISOString(),
      })
      showToast(`Connected in Demo Mode with account: ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`, 'success')
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

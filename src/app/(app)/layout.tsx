'use client'

import SideNav from '@/components/SideNav'
import Toast from '@/components/Toast'
import { useGapasStore } from '@/store/useGapasStore'
import { useEffect } from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, setWalletConnected, setUser } = useGapasStore()

  useEffect(() => {
    if (!isConnected) {
      const mockAddress = 'GAX_MOCK_USER_7F8E9D2C3B4A5'
      setWalletConnected(mockAddress, 'testnet')
      setUser({
        id: mockAddress,
        walletAddress: mockAddress,
        role: 'INVESTOR',
        displayName: 'Demo User',
        createdAt: new Date().toISOString(),
      })
    }
  }, [isConnected, setWalletConnected, setUser])

  return (
    <div className="app-layout">
      <SideNav />
      <main className="app-main">
        {isConnected ? children : (
          <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <span className="spinner">⏳</span>
          </div>
        )}
      </main>
      <Toast />
    </div>
  )
}

'use client'

import SideNav from '@/components/SideNav'
import MobileHeader from '@/components/MobileHeader'
import Toast from '@/components/Toast'
import { useGapasStore } from '@/store/useGapasStore'
import { useEffect } from 'react'

const FarmingBackground = () => (
  <div style={{
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
    opacity: 0.035,
    userSelect: 'none',
  }}>
    {/* Left Side: Palay Rice Crop and Livestock Scene */}
    <svg
      style={{
        position: 'absolute',
        bottom: '-20px',
        left: '20px',
        width: '320px',
        height: '320px',
        color: 'var(--color-primary-light)'
      }}
      viewBox="0 0 200 200"
      fill="currentColor"
    >
      {/* Rice Stalks (Palay) */}
      <path d="M20,200 C30,160 40,130 50,110 C53,104 57,98 62,95 C67,92 72,90 77,91" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M50,110 C42,100 35,95 28,92 C25,90 22,89 18,91 C22,87 26,85 30,86" fill="currentColor" />
      <path d="M53,104 C46,92 40,86 33,82 C30,80 27,79 23,81 C27,77 31,75 35,76" fill="currentColor" />
      <path d="M57,98 C50,84 45,77 38,72 C35,70 32,69 28,71 C32,67 36,65 40,66" fill="currentColor" />
      <path d="M62,95 C57,80 52,72 45,66 C42,64 39,63 35,65 C39,61 43,59 47,60" fill="currentColor" />
      
      {/* Another stalk */}
      <path d="M10,200 C25,150 40,110 58,85 C62,79 67,73 73,70 C79,67 85,65 91,67" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M58,85 C51,75 44,70 37,67 C34,65 31,64 27,66 C31,62 35,60 39,61" fill="currentColor" />
      <path d="M62,79 C56,67 50,61 43,57 C40,55 37,54 33,56 C37,52 41,50 45,51" fill="currentColor" />

      {/* Livestock (Cow silhouette) */}
      <path d="M110,200 L110,170 C110,165 113,162 118,162 L145,162 C150,162 153,158 155,155 L160,145 C162,142 165,140 168,140 L175,140 C178,140 180,142 181,145 L183,150 C185,155 183,160 178,162 L172,165 C170,166 168,168 168,170 L168,200 L160,200 L160,180 L140,180 L140,200 Z" fill="currentColor" />
      {/* Cow head details */}
      <path d="M175,140 L182,130 C183,128 185,128 186,130 L189,135 C190,137 189,140 186,142 L180,145 Z" fill="currentColor" />
    </svg>

    {/* Right Side: Tree and Mountain scene */}
    <svg
      style={{
        position: 'absolute',
        bottom: '-10px',
        right: '20px',
        width: '360px',
        height: '360px',
        color: 'var(--color-primary-light)'
      }}
      viewBox="0 0 200 200"
      fill="currentColor"
    >
      {/* Mountains */}
      <path d="M0,200 L40,130 L80,170 L130,100 L180,160 L200,140 L220,200 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Highland Pine Trees */}
      <g transform="translate(130, 90)">
        <polygon points="20,50 5,80 35,80" />
        <polygon points="20,30 8,60 32,60" />
        <polygon points="20,15 10,40 30,40" />
        <rect x="18" y="80" width="4" height="25" />
      </g>
      <g transform="translate(85, 115)" opacity="0.8">
        <polygon points="15,40 3,65 27,65" />
        <polygon points="15,22 6,48 24,48" />
        <polygon points="15,10 8,30 22,30" />
        <rect x="13" y="65" width="4" height="20" />
      </g>
      <g transform="translate(160, 110)" opacity="0.9">
        <polygon points="15,40 3,65 27,65" />
        <polygon points="15,22 6,48 24,48" />
        <polygon points="15,10 8,30 22,30" />
        <rect x="13" y="65" width="4" height="20" />
      </g>
    </svg>
  </div>
)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, setWalletConnected, setUser } = useGapasStore()

  useEffect(() => {
    if (!isConnected) {
      const mockAddress = 'GBTTGUEMWPFC53GBAHJMQIKD6IGDOLPRMSGPYQP34FKV73FJW5K6ZJZD'
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
      <FarmingBackground />
      <SideNav />
      <MobileHeader />
      <main className="app-main" style={{ position: 'relative', zIndex: 1 }}>
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

'use client'

import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { shortenAddress } from '@/lib/types'
import {
  Wallet, LogOut, ChevronRight, ExternalLink,
  Shield, Sprout, Users, BarChart3, Star
} from 'lucide-react'
import Link from 'next/link'
import { getAccountExplorerUrl } from '@/lib/stellar'

export default function ProfilePage() {
  const { address, isConnected, user, setWalletDisconnected, showToast } = useGapasStore()
  const router = useRouter()

  function handleDisconnect() {
    setWalletDisconnected()
    showToast('Wallet disconnected', 'info')
  }

  const roleLabel = user?.role === 'FARMER' ? '👨‍🌾 Farmer' : user?.role === 'INVESTOR' ? '💼 Investor' : user?.role === 'COOPERATIVE' ? '🤝 Cooperative' : '👤 User'

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">👤 My Profile</h1>
        <p className="page-subtitle">Account & settings</p>
      </div>

      {/* Profile card */}
      <div className="gapas-card animate-fade-in-up delay-100" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--gradient-primary)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Wallet size={28} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Connected Wallet
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isConnected && address ? shortenAddress(address, 8) : 'Not Connected'}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '0.25rem',
              background: 'rgba(27,67,50,0.1)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '0.1rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {roleLabel}
            </span>
          </div>
        </div>
        {isConnected && address && (
          <a
            id="profile-view-stellar"
            href={getAccountExplorerUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            View on Stellar Explorer
          </a>
        )}
      </div>

      {/* Network info */}
      <div className="gapas-card animate-fade-in-up delay-150" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Stellar Testnet</span>
          </div>
          <span className="badge badge-success">Connected</span>
        </div>
      </div>

      {/* Navigation links */}
      <div className="animate-fade-in-up delay-200" style={{ marginBottom: '1.25rem' }}>
        <h2 className="section-title">Navigation</h2>
        <div className="gapas-card">
          {[
            { href: '/dashboard', icon: BarChart3, label: 'Dashboard', desc: 'Your farm overview' },
            { href: '/farms', icon: Sprout, label: 'Browse Farms', desc: 'Invest in farms' },
            { href: '/create-farm', icon: Sprout, label: 'Create Farm', desc: 'List your farm' },
            { href: '/portfolio', icon: BarChart3, label: 'Portfolio', desc: 'Your investments' },
            { href: '/cooperative', icon: Users, label: 'Cooperative Portal', desc: 'Manage your coop' },
            { href: '/transactions', icon: Shield, label: 'Transactions', desc: 'TX history' },
            { href: '/cash-out', icon: Star, label: 'Cash Out', desc: 'USDC → PHP' },
          ].map(({ href, icon: Icon, label, desc }, i) => (
            <Link
              key={href}
              href={href}
              id={`profile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderBottom: i < 6 ? '1px solid var(--color-border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{
                width: 36, height: 36,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
              <ChevronRight size={16} color="var(--color-text-muted)" />
            </Link>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="gapas-card animate-fade-in-up delay-250" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>App Version</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>1.0.0 (Beta)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Network</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Stellar Testnet</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Smart Contracts</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Soroban v21</span>
        </div>
      </div>

      {/* Disconnect */}
      {isConnected && (
        <div className="animate-fade-in-up delay-300" style={{ marginBottom: '1rem' }}>
          <button
            id="disconnect-wallet-btn"
            onClick={handleDisconnect}
            className="btn btn-outline btn-full"
            style={{ color: '#dc2626', borderColor: '#dc2626' }}
          >
            <LogOut size={18} />
            Disconnect Wallet
          </button>
        </div>
      )}

      <p style={{
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        padding: '1rem 0',
        lineHeight: 1.6,
      }}>
        GAPAS — Global Agricultural Payment & Asset Settlement<br />
        Built on Stellar + Soroban · USDC Powered
      </p>
    </div>
  )
}

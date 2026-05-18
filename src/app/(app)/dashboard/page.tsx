'use client'

import { useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Sprout, Wallet, ArrowUpRight,
  Sun, CloudRain, Wind, RefreshCw, ChevronRight
} from 'lucide-react'
import { formatUSDC, getFundingProgress, shortenAddress } from '@/lib/types'
import { MOCK_FARMS, MOCK_INVESTMENTS, MOCK_TRANSACTIONS } from '@/lib/mockData'
import Link from 'next/link'
import type { Metadata } from 'next'

export default function DashboardPage() {
  const { address, isConnected, setFarms, setMyInvestments, setMyTransactions, setPortfolioStats, farms, myInvestments, myTransactions } = useGapasStore()
  const router = useRouter()

  useEffect(() => {
    // Redirect removed
    // Load mock data
    setFarms(MOCK_FARMS)
    setMyInvestments(MOCK_INVESTMENTS)
    setMyTransactions(MOCK_TRANSACTIONS)
    const total = MOCK_INVESTMENTS.reduce((s, i) => s + i.amount, 0)
    const earnings = MOCK_INVESTMENTS.reduce((s, i) => s + (i.returnAmount || 0), 0)
    setPortfolioStats(total, earnings)
  }, [isConnected, router, setFarms, setMyInvestments, setMyTransactions, setPortfolioStats])

  const totalInvested = myInvestments.reduce((s, i) => s + i.amount, 0)
  const totalReturns = myInvestments.reduce((s, i) => s + (i.returnAmount || 0), 0)
  const activeFarms = farms.filter(f => f.status === 'ACTIVE').length
  const featuredFarms = farms.slice(0, 3)

  return (
    <div className="page-with-nav app-container">
      {/* Hero Banner */}
      <div className="hero-banner animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌾</span>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              GAPAS Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.375rem', fontFamily: 'var(--font-jakarta)' }}>
            Mabuhay, Farmer! 👋
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
            {address ? shortenAddress(address) : 'Connect wallet to start'}
          </p>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                Total Invested
              </p>
              <p style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                {formatUSDC(totalInvested)} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>USDC</span>
              </p>
            </div>
            <div style={{
              background: 'rgba(249,173,0,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(249,173,0,0.25)',
            }}>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(249,173,0,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                Total Returns
              </p>
              <p style={{ fontSize: '1.25rem', color: '#f9ad00', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                {formatUSDC(totalReturns)} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>USDC</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { href: '/farms', icon: Sprout, label: 'Browse\nFarms', color: '#1B4332', bg: 'rgba(27,67,50,0.1)' },
            { href: '/create-farm', icon: RefreshCw, label: 'Create\nFarm', color: '#2d6a4f', bg: 'rgba(45,106,79,0.1)' },
            { href: '/wallet', icon: Wallet, label: 'My\nWallet', color: '#f9ad00', bg: 'rgba(249,173,0,0.12)' },
            { href: '/cash-out', icon: ArrowUpRight, label: 'Cash\nOut', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          ].map(({ href, icon: Icon, label, color, bg }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                whiteSpace: 'pre-line',
                lineHeight: 1.3,
              }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Weather Risk Panel */}
      <div className="gapas-card animate-fade-in-up delay-150" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Weather Risk Today</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Philippines</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { icon: Sun, label: 'Luzon', risk: 'LOW', desc: '32°C Clear' },
            { icon: CloudRain, label: 'Visayas', risk: 'MODERATE', desc: '28°C Rainy' },
            { icon: Wind, label: 'Mindanao', risk: 'HIGH', desc: 'Storm Warning' },
          ].map(({ icon: Icon, label, risk, desc }) => (
            <div key={label} style={{
              background: risk === 'LOW' ? 'rgba(34,197,94,0.08)' : risk === 'MODERATE' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${risk === 'LOW' ? 'rgba(34,197,94,0.2)' : risk === 'MODERATE' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
            }}>
              <Icon size={20} color={risk === 'LOW' ? '#16a34a' : risk === 'MODERATE' ? '#d97706' : '#dc2626'} style={{ margin: '0 auto 0.25rem' }} />
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.125rem' }}>{label}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{desc}</p>
              <span className={`badge ${risk === 'LOW' ? 'badge-success' : risk === 'MODERATE' ? 'badge-warning' : 'badge-danger'}`} style={{ marginTop: '0.375rem', fontSize: '0.5625rem' }}>
                {risk}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Farms Section */}
      <div className="animate-fade-in-up delay-200" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Active Farms
            <span style={{
              marginLeft: '0.5rem',
              background: 'rgba(27,67,50,0.1)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '0.1rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>{activeFarms}</span>
          </h2>
          <Link
            href="/farms"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8125rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {featuredFarms.map((farm) => {
            const progress = getFundingProgress(farm.currentFunding, farm.fundingGoal)
            return (
              <Link
                key={farm.id}
                href={`/farms/${farm.id}`}
                className="gapas-card"
                style={{ padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #1B4332, #40916c)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Sprout size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {farm.name}
                      </h3>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0, marginLeft: '0.5rem' }}>
                        +{farm.expectedReturn}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.625rem' }}>
                      {farm.cropType || farm.livestockType} · {farm.location}
                    </p>
                    <div className="progress-bar-container" style={{ marginBottom: '0.375rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{progress}% Funded</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatUSDC(farm.currentFunding)} / {formatUSDC(farm.fundingGoal)} USDC
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="animate-fade-in-up delay-300" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Activity</h2>
          <Link
            href="/transactions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8125rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="gapas-card" style={{ padding: '0.5rem 1rem' }}>
          {myTransactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="tx-item">
              <div className="tx-icon" style={{
                background: tx.type === 'FUND' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)',
              }}>
                {tx.type === 'FUND' ? (
                  <ArrowUpRight size={18} color="#2563eb" />
                ) : (
                  <TrendingUp size={18} color="#16a34a" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.memo || tx.type}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: tx.type === 'FUND' ? '#dc2626' : '#16a34a',
                flexShrink: 0,
              }}>
                {tx.type === 'FUND' ? '-' : '+'}{formatUSDC(tx.amount)} USDC
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

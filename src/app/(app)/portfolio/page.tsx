'use client'

import { useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { formatUSDC, getFundingProgress, getProfitDistribution } from '@/lib/types'
import { MOCK_INVESTMENTS } from '@/lib/mockData'
import { TrendingUp, Sprout, RefreshCw, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function PortfolioPage() {
  const { isConnected, myInvestments, setMyInvestments } = useGapasStore()
  const router = useRouter()

  useEffect(() => {
    // Redirect removed
    if (myInvestments.length === 0) setMyInvestments(MOCK_INVESTMENTS)
  }, [isConnected, router, myInvestments.length, setMyInvestments])

  const totalInvested = myInvestments.reduce((s, i) => s + i.amount, 0)
  const totalReturns = myInvestments.reduce((s, i) => s + (i.returnAmount || 0), 0)
  const totalExpected = myInvestments.reduce((s, i) => {
    const roi = i.farm?.expectedReturn || 0
    return s + i.amount * (1 + roi / 100)
  }, 0)
  const projectedProfit = totalExpected - totalInvested

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">📊 My Portfolio</h1>
        <p className="page-subtitle">Your farm investment tracker</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }} className="animate-fade-in-up delay-100">
        {[
          { label: 'Total Invested', value: formatUSDC(totalInvested), unit: 'USDC', icon: Sprout, color: 'var(--color-primary)', bg: 'rgba(27,67,50,0.08)' },
          { label: 'Total Returns', value: formatUSDC(totalReturns), unit: 'USDC', icon: TrendingUp, color: '#16a34a', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Active Farms', value: `${myInvestments.filter(i => i.status === 'ACTIVE').length}`, unit: 'farms', icon: BarChart3, color: '#2563eb', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Projected Profit', value: formatUSDC(projectedProfit), unit: 'USDC', icon: RefreshCw, color: '#d97706', bg: 'rgba(249,173,0,0.08)' },
        ].map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card" style={{ padding: '1rem' }}>
            <div style={{
              width: 36, height: 36,
              background: bg, borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.625rem',
            }}>
              <Icon size={18} color={color} />
            </div>
            <p className="stat-label" style={{ marginBottom: '0.25rem' }}>{label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {value} <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.7 }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Investment list */}
      <div className="animate-fade-in-up delay-150">
        <h2 className="section-title">My Investments</h2>
        {myInvestments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <span style={{ fontSize: '3rem' }}>🌱</span>
            <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No investments yet</p>
            <Link href="/farms" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Farms
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {myInvestments.map((inv, i) => {
              const farm = inv.farm
              const roi = farm?.expectedReturn || 0
              const expectedReturn = inv.amount * (1 + roi / 100)
              const progress = farm ? getFundingProgress(farm.currentFunding, farm.fundingGoal) : 0
              const dist = getProfitDistribution(farm?.cooperativeEnabled || false)

              return (
                <div
                  key={inv.id}
                  className="gapas-card animate-fade-in-up"
                  style={{ padding: '1.25rem', animationDelay: `${i * 80}ms` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {farm?.name || 'Unknown Farm'}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {farm?.cropType || farm?.livestockType || 'Farm'} · {farm?.location}
                      </p>
                    </div>
                    <span className={`badge ${inv.returnAmount ? 'badge-success' : 'badge-info'}`}>
                      {inv.returnAmount ? 'COMPLETED' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Investment amounts */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
                    {[
                      { label: 'Invested', value: formatUSDC(inv.amount), color: 'var(--color-text)' },
                      { label: `+${roi}% ROI`, value: formatUSDC(expectedReturn - inv.amount), color: '#16a34a' },
                      { label: 'Total Return', value: formatUSDC(inv.returnAmount || expectedReturn), color: 'var(--color-primary)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{label}</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Farm progress */}
                  {farm && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Farm funding progress</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>{progress}%</span>
                      </div>
                      <div className="progress-bar-container" style={{ marginBottom: '0.875rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </>
                  )}

                  {/* Distribution note */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <span>👨‍🌾 {dist.farmerPercent}% Farmer</span>
                    <span>💼 {dist.investorPercent}% Investors</span>
                    {dist.cooperativeEnabled && <span>🤝 {dist.cooperativePercent}% Coop</span>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem' }}>
                    <Link
                      href={`/farms/${inv.farmId}`}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                      id={`portfolio-view-farm-${inv.id}`}
                    >
                      View Farm
                    </Link>
                    {!inv.returnAmount && (
                      <Link
                        href="/farms"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        id={`portfolio-reinvest-${inv.id}`}
                      >
                        <RefreshCw size={14} /> Reinvest
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

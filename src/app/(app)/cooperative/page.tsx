'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { MOCK_COOPERATIVES } from '@/lib/mockData'
import {
  formatUSDC, shortenAddress, getFundingProgress
} from '@/lib/types'
import {
  Users, MapPin, CheckCircle, XCircle, TrendingUp,
  Building2, Sprout, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function CooperativePortalPage() {
  const { isConnected, cooperatives, setCooperatives } = useGapasStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'browse' | 'dashboard'>('browse')

  useEffect(() => {
    // Redirect removed
    setCooperatives(MOCK_COOPERATIVES)
  }, [isConnected, router, setCooperatives])

  // Simulate: user is member of first coop
  const myCoop = cooperatives[0]

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">🤝 Cooperative Portal</h1>
        <p className="page-subtitle">Barangay agricultural cooperatives</p>
      </div>

      {/* Tab switcher */}
      <div className="animate-fade-in-up delay-100" style={{
        display: 'flex',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-full)',
        padding: '4px',
        marginBottom: '1.5rem',
        gap: '4px',
      }}>
        {(['browse', 'dashboard'] as const).map((tab) => (
          <button
            key={tab}
            id={`coop-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.625rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === tab ? 'var(--color-card)' : 'transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
            }}
            aria-pressed={activeTab === tab}
          >
            {tab === 'browse' ? '🗺️ Browse Coops' : '📊 My Coop'}
          </button>
        ))}
      </div>

      {activeTab === 'browse' ? (
        <BrowseCoops cooperatives={cooperatives} />
      ) : (
        <CoopDashboard coop={myCoop} />
      )}
    </div>
  )
}

function BrowseCoops({ cooperatives }: { cooperatives: ReturnType<typeof MOCK_COOPERATIVES[0]['__proto__']>[] }) {
  return (
    <div>
      {/* Info banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(27,67,50,0.06), rgba(64,145,108,0.06))',
        border: '1px solid rgba(27,67,50,0.15)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        marginBottom: '1.25rem',
      }} className="animate-fade-in-up">
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.375rem' }}>
          🌾 What is a Cooperative?
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Cooperatives are barangay-level agricultural groups that help farmers register farms, tokenize assets, and onboard to GAPAS. They act as trust layers between farmers and blockchain — earning <strong>1% of total farm profit</strong> when they assist.
        </p>
      </div>

      {/* Profit distribution note */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { title: 'With Cooperative', emoji: '🤝', farmer: '69%', investors: '30%', coop: '1%', highlight: true },
          { title: 'Without Cooperative', emoji: '👤', farmer: '70%', investors: '30%', coop: '0%', highlight: false },
        ].map(({ title, emoji, farmer, investors, coop, highlight }) => (
          <div key={title} style={{
            background: highlight ? 'rgba(249,173,0,0.06)' : 'var(--color-card)',
            border: `1px solid ${highlight ? 'rgba(249,173,0,0.25)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem',
          }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>{emoji} {title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>👨‍🌾 Farmer</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{farmer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>💼 Investors</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{investors}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🤝 Cooperative</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: highlight ? '#a67c00' : 'var(--color-text-muted)' }}>{coop}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coop list */}
      <h2 className="section-title">Registered Cooperatives</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {(cooperatives as typeof MOCK_COOPERATIVES).map((coop, i) => (
          <div
            key={coop.id}
            className="gapas-card animate-fade-in-up"
            style={{ padding: '1.25rem', animationDelay: `${i * 80}ms` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div style={{
                width: 48, height: 48,
                background: 'linear-gradient(135deg, #1B4332, #40916c)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Building2 size={22} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{coop.name}</h3>
                  {coop.verifiedStatus ? (
                    <span className="badge badge-success" style={{ fontSize: '0.5625rem' }}>
                      <CheckCircle size={10} /> VERIFIED
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.5625rem' }}>
                      <XCircle size={10} /> PENDING
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} color="var(--color-text-muted)" />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {coop.barangay}, {coop.municipality}
                  </p>
                </div>
              </div>
            </div>

            {coop.description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.875rem', lineHeight: 1.55 }}>
                {coop.description}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
              {[
                { label: 'Farms Assisted', value: coop._count?.farms ?? 0, color: 'var(--color-primary)' },
                { label: 'Total Earned', value: `${formatUSDC(coop.totalEarnings)} USDC`, color: '#16a34a' },
                { label: 'Wallet', value: shortenAddress(coop.walletAddress), color: 'var(--color-text-muted)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '0.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{label}</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                </div>
              ))}
            </div>

            <Link
              href="/create-farm"
              className="btn btn-outline btn-sm btn-full"
              id={`select-coop-${coop.id}`}
              style={{ justifyContent: 'center' }}
            >
              Select This Cooperative <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoopDashboard({ coop }: { coop: typeof MOCK_COOPERATIVES[0] | undefined }) {
  if (!coop) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
        <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p style={{ fontWeight: 600 }}>You are not part of a cooperative yet</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Join or register a cooperative to manage farmer onboarding.</p>
      </div>
    )
  }

  const assistedFarms = [0, 1, 2].map(i => ({
    id: `farm-${i}`,
    name: ['Verde Rice Terraces', 'Bukidnon Corn', 'Benguet Strawberry'][i],
    status: ['ACTIVE', 'ACTIVE', 'PENDING'][i],
    amount: [5000, 8000, 4000][i],
    funded: [3750, 5600, 1200][i],
  }))

  return (
    <div>
      {/* Coop header */}
      <div className="hero-banner animate-fade-in-up" style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 52, height: 52,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{coop.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem' }}>
                {coop.barangay}, {coop.municipality}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { label: 'Farms Assisted', value: coop._count?.farms ?? 0 },
              { label: 'Total Earned', value: `$${formatUSDC(coop.totalEarnings)}` },
              { label: 'Status', value: coop.verifiedStatus ? '✅ Verified' : '⏳ Pending' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '0.625rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }} className="animate-fade-in-up delay-100">
        {[
          { label: 'Onboard Farmer', emoji: '👤', desc: 'Help a new farmer register', href: '/create-farm', color: 'rgba(27,67,50,0.08)' },
          { label: 'Verify Farm', emoji: '✅', desc: 'Review & approve farm data', href: '/farms', color: 'rgba(34,197,94,0.08)' },
          { label: 'Community Stats', emoji: '📊', desc: 'Barangay overview', href: '/dashboard', color: 'rgba(59,130,246,0.08)' },
          { label: 'Earnings Report', emoji: '💰', desc: 'Your 1% commission history', href: '/transactions', color: 'rgba(249,173,0,0.08)' },
        ].map(({ label, emoji, desc, href, color }) => (
          <Link key={label} href={href} style={{
            display: 'flex', flexDirection: 'column', gap: '0.375rem',
            padding: '1rem', background: color,
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>{label}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{desc}</span>
          </Link>
        ))}
      </div>

      {/* Assisted farms */}
      <h2 className="section-title">Assisted Farms</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {assistedFarms.map((farm) => {
          const progress = getFundingProgress(farm.funded, farm.amount)
          return (
            <div key={farm.id} className="gapas-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Sprout size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{farm.name}</span>
                </div>
                <span className={`badge ${farm.status === 'ACTIVE' ? 'badge-info' : 'badge-warning'}`}>
                  {farm.status}
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{progress}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {formatUSDC(farm.funded)} / {formatUSDC(farm.amount)} USDC
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

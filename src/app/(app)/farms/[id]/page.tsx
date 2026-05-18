'use client'

import { use, useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { MOCK_FARMS } from '@/lib/mockData'
import {
  formatUSDC, getFundingProgress, getRiskBadgeClass,
  getProfitDistribution, shortenAddress
} from '@/lib/types'
import {
  ArrowLeft, MapPin, Calendar, TrendingUp, Users,
  Shield, Sprout, AlertTriangle, ExternalLink, Loader2,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { simulateStellarTransfer, getTxExplorerUrl } from '@/lib/stellar'
import { useRouter } from 'next/navigation'

export default function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { address, isConnected, addInvestment, addTransaction, showToast, farms, setFarms } = useGapasStore()
  const router = useRouter()

  const [amount, setAmount] = useState('')
  const [investing, setInvesting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Load farms if empty
  if (farms.length === 0) setFarms(MOCK_FARMS)

  const farm = farms.find((f) => f.id === id) || MOCK_FARMS.find((f) => f.id === id)

  if (!farm) {
    return (
      <div className="page-with-nav app-container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <span style={{ fontSize: '3rem' }}>🌾</span>
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Farm not found</p>
        <Link href="/farms" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Browse Farms
        </Link>
      </div>
    )
  }

  const progress = getFundingProgress(farm.currentFunding, farm.fundingGoal)
  const riskClass = getRiskBadgeClass(farm.riskLevel)
  const dist = getProfitDistribution(farm.cooperativeEnabled)
  const remaining = farm.fundingGoal - farm.currentFunding

  async function handleInvest() {
    if (!isConnected || !address) {
      showToast('Please connect your wallet first', 'error')
      return
    }

    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum < 10) {
      showToast('Minimum investment is 10 USDC', 'error')
      return
    }
    if (amountNum > remaining) {
      showToast(`Maximum you can invest is ${formatUSDC(remaining)} USDC`, 'error')
      return
    }

    setInvesting(true)
    try {
      const result = await simulateStellarTransfer({
        fromAddress: address,
        toAddress: farm.contractAddress || 'CONTRACT',
        amount: amountNum,
        memo: `Fund: ${farm.name}`,
      })

      if (result.success && result.txHash) {
        setTxHash(result.txHash)
        addInvestment({
          id: `inv-${Date.now()}`,
          farmId: farm.id,
          farm,
          investorWallet: address,
          amount: amountNum,
          txHash: result.txHash,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        })
        addTransaction({
          id: `tx-${Date.now()}`,
          txHash: result.txHash,
          type: 'FUND',
          amount: amountNum,
          fromWallet: address,
          toWallet: farm.contractAddress,
          farmId: farm.id,
          memo: `Investment: ${farm.name}`,
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        })
        showToast(`Successfully invested ${formatUSDC(amountNum)} USDC!`, 'success')
        setAmount('')
      } else {
        showToast(result.error || 'Investment failed', 'error')
      }
    } finally {
      setInvesting(false)
    }
  }

  return (
    <div className="page-with-nav">
      {/* Back header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'var(--color-surface)',
        zIndex: 50,
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <Link href="/farms" style={{ color: 'var(--color-text)', display: 'flex' }} aria-label="Back to farms">
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700 }} className="truncate">{farm.name}</h1>
      </div>

      {/* Hero image */}
      <div style={{
        height: 200,
        background: 'linear-gradient(135deg, #012d1d 0%, #1B4332 50%, #40916c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 72,
          height: 72,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}>
          <Sprout size={36} color="rgba(255,255,255,0.9)" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 600 }}>
          {farm.cropType || farm.livestockType}
        </p>
        {/* Badges */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <span className={`badge ${riskClass}`}>{farm.riskLevel} RISK</span>
          <span className={`badge ${farm.status === 'FUNDED' ? 'badge-success' : 'badge-info'}`}>{farm.status}</span>
        </div>
        {farm.cooperativeEnabled && farm.cooperative && (
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
            <span className="coop-badge">🤝 Cooperative: {farm.cooperative.name}</span>
          </div>
        )}
      </div>

      <div className="app-container" style={{ paddingTop: '1.25rem' }}>
        {/* Farm name & location */}
        <div style={{ marginBottom: '1.25rem' }} className="animate-fade-in-up">
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>{farm.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)' }}>
            <MapPin size={14} />
            <span style={{ fontSize: '0.875rem' }}>{farm.location || 'Philippines'}</span>
          </div>
        </div>

        {/* Funding progress */}
        <div className="gapas-card animate-fade-in-up delay-100" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Raised</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {formatUSDC(farm.currentFunding)} USDC
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Goal</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {formatUSDC(farm.fundingGoal)} USDC
              </p>
            </div>
          </div>
          <div className="progress-bar-container" style={{ height: 12, marginBottom: '0.5rem' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>{progress}% Funded</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{farm._count?.investments ?? 0} investors</span>
          </div>
        </div>

        {/* Key Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }} className="animate-fade-in-up delay-150">
          {[
            { icon: TrendingUp, label: 'Expected Return', value: `+${farm.expectedReturn}%`, color: 'var(--color-primary)' },
            { icon: Calendar, label: 'Duration', value: `${farm.duration} days`, color: 'var(--color-text)' },
            { icon: Sprout, label: 'Expected Yield', value: farm.expectedYield || 'TBD', color: 'var(--color-text)' },
            { icon: Calendar, label: 'Harvest', value: farm.harvestSchedule || 'TBD', color: 'var(--color-text)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <Icon size={14} color="var(--color-primary)" />
                <span className="stat-label">{label}</span>
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="gapas-card animate-fade-in-up delay-200" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem' }}>About This Farm</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            {farm.description}
          </p>
        </div>

        {/* Profit Distribution */}
        <div className="gapas-card animate-fade-in-up delay-250" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Profit Distribution
            {farm.cooperativeEnabled && <span className="coop-badge" style={{ marginLeft: '0.5rem' }}>With Cooperative</span>}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { label: '👨‍🌾 Farmer', pct: dist.farmerPercent, color: '#1B4332' },
              { label: '💼 Investors', pct: dist.investorPercent, color: '#3b82f6' },
              ...(dist.cooperativeEnabled ? [{ label: '🤝 Cooperative', pct: dist.cooperativePercent, color: '#f9ad00' }] : []),
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{pct}%</span>
                </div>
                <div className="progress-bar-container" style={{ height: 8 }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: '999px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
          {farm.cooperativeEnabled && farm.cooperative && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(249,173,0,0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(249,173,0,0.2)',
            }}>
              <p style={{ fontSize: '0.8125rem', color: '#a67c00', fontWeight: 500 }}>
                🤝 <strong>{farm.cooperative.name}</strong> is assisting this farm with tokenization and farmer onboarding. They earn 1% of total profit.
              </p>
            </div>
          )}
        </div>

        {/* Farmer info */}
        <div className="gapas-card animate-fade-in-up delay-300" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Farmer</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, #1B4332, #40916c)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verified Farmer</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                {shortenAddress(farm.farmerWallet)}
              </p>
            </div>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${farm.farmerWallet}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}
              aria-label="View on Stellar Explorer"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Weather Risk */}
        <div className="gapas-card animate-fade-in-up delay-300" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={16} color={farm.weatherRisk === 'LOW' ? '#16a34a' : farm.weatherRisk === 'MODERATE' ? '#d97706' : '#dc2626'} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Weather Risk</h3>
            <span className={`badge ${farm.weatherRisk === 'LOW' ? 'badge-success' : farm.weatherRisk === 'MODERATE' ? 'badge-warning' : 'badge-danger'}`}>
              {farm.weatherRisk}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {farm.weatherRisk === 'LOW'
              ? 'Low weather risk. Favorable conditions for this crop/livestock type.'
              : farm.weatherRisk === 'MODERATE'
              ? 'Moderate weather risk. Seasonal rainfall may affect yield by ±15%.'
              : 'High weather risk. Storm season active. Invest with caution.'}
          </p>
        </div>

        {/* Invest Section */}
        {txHash ? (
          <div className="gapas-card animate-scale-in" style={{ padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Investment Successful!</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Your USDC has been sent to the smart contract escrow.
            </p>
            <a
              href={getTxExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              id="view-tx-explorer"
            >
              <ExternalLink size={14} />
              View on Stellar Explorer
            </a>
          </div>
        ) : (
          <div className="gapas-card animate-fade-in-up delay-300" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              💰 Invest in This Farm
            </h3>
            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Connect your Freighter wallet to invest
                </p>
                <Link href="/" className="btn btn-primary btn-full" id="invest-connect-wallet">
                  <Shield size={18} />
                  Connect Wallet
                </Link>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="invest-amount">Amount (USDC)</label>
                  <input
                    id="invest-amount"
                    type="number"
                    className="form-input"
                    placeholder="Minimum 10 USDC"
                    min={10}
                    max={remaining}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    aria-describedby="invest-amount-hint"
                  />
                  <p id="invest-amount-hint" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Max: {formatUSDC(remaining)} USDC available
                  </p>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem',
                    marginBottom: '1rem',
                    fontSize: '0.8125rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span>Your investment</span>
                      <span style={{ fontWeight: 600 }}>{formatUSDC(parseFloat(amount))} USDC</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span>Expected return ({farm.expectedReturn}%)</span>
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>
                        +{formatUSDC(parseFloat(amount) * farm.expectedReturn / 100)} USDC
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>Total return</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {formatUSDC(parseFloat(amount) * (1 + farm.expectedReturn / 100))} USDC
                      </span>
                    </div>
                  </div>
                )}
                <button
                  id="invest-submit-btn"
                  onClick={handleInvest}
                  disabled={investing || !amount || parseFloat(amount) < 10}
                  className="btn btn-primary btn-full btn-lg"
                >
                  {investing ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      Sending USDC...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Fund via Freighter
                    </>
                  )}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.625rem' }}>
                  Funds are held in a Soroban smart contract escrow
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

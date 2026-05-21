'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { formatUSDC, formatPHP, usdcToPhp, USDC_TO_PHP_RATE } from '@/lib/types'
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type CashOutMethod = 'gcash' | 'maya' | 'bank' | 'remittance'

const METHODS: { id: CashOutMethod; label: string; emoji: string; desc: string }[] = [
  { id: 'gcash', label: 'GCash', emoji: '📱', desc: 'Instant · Up to ₱100,000/day' },
  { id: 'maya', label: 'Maya', emoji: '💜', desc: 'Instant · Up to ₱100,000/day' },
  { id: 'bank', label: 'Bank Transfer', emoji: '🏦', desc: '1–3 banking days · No limit' },
  { id: 'remittance', label: 'Remittance Center', emoji: '🏪', desc: 'Palawan, LBC, M Lhuillier' },
]

export default function CashOutPage() {
  const { showToast } = useGapasStore()
  const [method, setMethod] = useState<CashOutMethod>('gcash')
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const USDC_BALANCE = 2450.75
  const amountNum = parseFloat(amount) || 0
  const phpAmount = usdcToPhp(amountNum)
  const fee = amountNum * 0.005 // 0.5% fee
  const netPHP = usdcToPhp(amountNum - fee)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amountNum || amountNum < 5) { showToast('Minimum cash out is 5 USDC', 'error'); return }
    if (amountNum > USDC_BALANCE) { showToast('Insufficient balance', 'error'); return }
    if (!accountNumber.trim()) { showToast('Please enter account number/details', 'error'); return }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 2500))
    setSubmitting(false)
    setDone(true)
    showToast('Cash out request submitted!', 'success')
  }

  if (done) {
    return (
      <div className="page-with-nav app-container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <div className="animate-scale-in" style={{
          width: 80, height: 80,
          background: 'rgba(34,197,94,0.1)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <CheckCircle size={44} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Request Submitted!</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
          {formatUSDC(amountNum)} USDC → {formatPHP(netPHP)}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Your cash out will be processed within 1–3 business days.
        </p>
        <div style={{
          background: 'rgba(249,173,0,0.08)',
          border: '1px solid rgba(249,173,0,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#a67c00', marginBottom: '0.5rem' }}>⚠️ Simulation Only</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            This cash-out feature is for demonstration purposes only. In production, funds would be converted through licensed remittance partners.
          </p>
        </div>
        <Link href="/wallet" className="btn btn-primary btn-full" id="cashout-back-wallet">
          Back to Wallet
        </Link>
      </div>
    )
  }

  return (
    <div className="page-with-nav">
      {/* Header */}
      <div className="sticky-back-header">
        <Link href="/wallet" style={{ color: 'var(--color-text)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>Cash Out USDC → PHP</h1>
      </div>

      <div className="app-container" style={{ paddingTop: '1.25rem' }}>
        {/* Simulation notice */}
        <div style={{
          background: 'rgba(249,173,0,0.08)',
          border: '1px solid rgba(249,173,0,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem',
          display: 'flex', gap: '0.625rem',
          marginBottom: '1.25rem',
        }} className="animate-fade-in-up">
          <AlertTriangle size={18} color="#a67c00" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.8125rem', color: '#a67c00', lineHeight: 1.55 }}>
            <strong>Simulation Only.</strong> This demonstrates USDC to PHP conversion. No real money moves.
          </p>
        </div>

        {/* Available balance */}
        <div className="gapas-card animate-fade-in-up delay-100" style={{ padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>
            Available USDC Balance
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {formatUSDC(USDC_BALANCE)} <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.7 }}>USDC</span>
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            ≈ {formatPHP(usdcToPhp(USDC_BALANCE))}
          </p>
        </div>

        <form onSubmit={handleSubmit} id="cashout-form">
          {/* Method selection */}
          <div className="animate-fade-in-up delay-150" style={{ marginBottom: '1.25rem' }}>
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>Cash Out Method</p>
            <div className="grid-responsive-2" style={{ gap: '0.625rem' }}>
              {METHODS.map(({ id, label, emoji, desc }) => (
                <button
                  key={id}
                  type="button"
                  id={`cashout-method-${id}`}
                  onClick={() => setMethod(id)}
                  style={{
                    padding: '0.875rem',
                    background: method === id ? 'rgba(27,67,50,0.08)' : 'var(--color-card)',
                    border: `2px solid ${method === id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  aria-pressed={method === id}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{emoji}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: method === id ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="animate-fade-in-up delay-200">
            <div className="form-group">
              <label className="form-label" htmlFor="cashout-amount">Amount to Cash Out (USDC)</label>
              <input
                id="cashout-amount"
                type="number"
                className="form-input"
                placeholder="Min 5 USDC"
                min={5}
                max={USDC_BALANCE}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Rate preview */}
            {amountNum > 0 && (
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>You send</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{formatUSDC(amountNum)} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Rate</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>1 USDC = ₱{USDC_TO_PHP_RATE}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Platform fee (0.5%)</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>-{formatUSDC(fee)} USDC</span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>You receive</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a' }}>{formatPHP(netPHP)}</span>
                </div>
              </div>
            )}

            {/* Account details */}
            <div className="form-group">
              <label className="form-label" htmlFor="account-number">
                {method === 'gcash' || method === 'maya' ? 'Mobile Number' : method === 'bank' ? 'Account Number' : 'Reference Number'}
              </label>
              <input
                id="account-number"
                type="text"
                className="form-input"
                placeholder={method === 'gcash' || method === 'maya' ? '09xxxxxxxxx' : method === 'bank' ? 'Bank account number' : 'Claim reference no.'}
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="account-name">Account Name</label>
              <input
                id="account-name"
                type="text"
                className="form-input"
                placeholder="Full name as registered"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
              />
            </div>
          </div>

          <button
            id="cashout-submit-btn"
            type="submit"
            disabled={submitting}
            className="btn btn-amber btn-full btn-lg animate-fade-in-up delay-300"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="spinner" />
                Processing...
              </>
            ) : (
              <>
                💸 Request Cash Out
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

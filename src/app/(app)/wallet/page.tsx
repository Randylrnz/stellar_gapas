'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import {
  Wallet, Copy, ExternalLink, RefreshCw,
  ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle
} from 'lucide-react'
import {
  formatUSDC, formatPHP, usdcToPhp, shortenAddress, USDC_TO_PHP_RATE
} from '@/lib/types'
import { getAccountExplorerUrl } from '@/lib/stellar'
import { MOCK_TRANSACTIONS } from '@/lib/mockData'

export default function WalletPage() {
  const { address, isConnected, myTransactions, setMyTransactions, showToast } = useGapasStore()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Simulated USDC balance
  const usdcBalance = 2450.75
  const phpBalance = usdcToPhp(usdcBalance)

  useEffect(() => {
    // Redirect removed
    if (myTransactions.length === 0) setMyTransactions(MOCK_TRANSACTIONS)
  }, [isConnected, router, myTransactions.length, setMyTransactions])

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      showToast('Address copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function refreshBalance() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    showToast('Balance updated', 'success')
  }

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">💳 My Wallet</h1>
        <p className="page-subtitle">Stellar Network · USDC</p>
      </div>

      {/* Wallet Card */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}>
          {/* BG decoration */}
          <div style={{
            position: 'absolute', top: -60, right: -40,
            width: 200, height: 200,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -20,
            width: 150, height: 150,
            background: 'rgba(249,173,0,0.08)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Network badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem', fontWeight: 600,
              marginBottom: '1.25rem',
            }}>
              <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
              Stellar Testnet
            </div>

            {/* Balance */}
            <p style={{ fontSize: '0.8125rem', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 500 }}>
              USDC Balance
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>
                {formatUSDC(usdcBalance)}
              </p>
              <span style={{ fontSize: '1rem', opacity: 0.7, fontWeight: 600, alignSelf: 'flex-end', paddingBottom: '0.25rem' }}>USDC</span>
              <button
                id="refresh-balance-btn"
                onClick={refreshBalance}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: '0.25rem', marginLeft: 'auto', alignSelf: 'flex-end' }}
                aria-label="Refresh balance"
              >
                <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              </button>
            </div>
            <p style={{ fontSize: '0.9375rem', opacity: 0.65, marginBottom: '1.5rem' }}>
              ≈ {formatPHP(phpBalance)}
            </p>

            {/* Address */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <Wallet size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                {address || 'Not connected'}
              </span>
              <button
                id="copy-address-btn"
                onClick={copyAddress}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '0.25rem', flexShrink: 0 }}
                aria-label="Copy wallet address"
              >
                {copied ? <CheckCircle size={16} color="#22c55e" /> : <Copy size={16} />}
              </button>
              <a
                id="view-account-explorer"
                href={getAccountExplorerUrl(address || '')}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}
                aria-label="View account on explorer"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }} className="animate-fade-in-up delay-150">
        <a
          href="/cash-out"
          id="wallet-cashout-btn"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            padding: '1.25rem', background: 'var(--color-card)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: 48, height: 48, background: 'rgba(27,67,50,0.08)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowUpRight size={22} color="var(--color-primary)" />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cash Out</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>USDC → PHP</span>
        </a>
        <a
          href="/portfolio"
          id="wallet-portfolio-btn"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            padding: '1.25rem', background: 'var(--color-card)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: 48, height: 48, background: 'rgba(59,130,246,0.08)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowDownLeft size={22} color="#3b82f6" />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Reinvest</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Portfolio</span>
        </a>
      </div>

      {/* Rate info */}
      <div style={{
        background: 'rgba(249,173,0,0.08)',
        border: '1px solid rgba(249,173,0,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }} className="animate-fade-in-up delay-200">
        <span style={{ fontSize: '1.25rem' }}>💱</span>
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a67c00' }}>Exchange Rate (Indicative)</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            1 USDC ≈ ₱{USDC_TO_PHP_RATE} · Rate updated daily
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="animate-fade-in-up delay-250">
        <h2 className="section-title">Transaction History</h2>
        <div className="gapas-card" style={{ padding: '0.5rem 1rem' }}>
          {myTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <p>No transactions yet</p>
            </div>
          ) : (
            myTransactions.map((tx) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{
                  background: tx.type === 'FUND' ? 'rgba(59,130,246,0.1)' : tx.type === 'RETURN' ? 'rgba(34,197,94,0.1)' : 'rgba(249,173,0,0.1)',
                }}>
                  {tx.type === 'FUND' ? (
                    <ArrowUpRight size={18} color="#2563eb" />
                  ) : tx.type === 'RETURN' ? (
                    <ArrowDownLeft size={18} color="#16a34a" />
                  ) : (
                    <RefreshCw size={18} color="#d97706" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.memo || tx.type}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', display: 'flex' }}
                      aria-label="View transaction on explorer"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

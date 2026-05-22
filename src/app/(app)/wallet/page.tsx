'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import {
  Wallet, Copy, ExternalLink, RefreshCw,
  ArrowUpRight, ArrowDownLeft, Loader2, CheckCircle,
  Coins, ArrowRightLeft, PlusCircle, Landmark, Smartphone, Send
} from 'lucide-react'
import {
  formatUSDC, formatPHP, shortenAddress, USDC_TO_PHP_RATE
} from '@/lib/types'
import { getAccountExplorerUrl } from '@/lib/stellar'

export default function WalletPage() {
  const {
    address,
    isConnected,
    balances,
    updateBalances,
    myTransactions,
    addTransaction,
    addReceipt,
    showToast,
    user,
    simulateIncomingBlockchainEvent
  } = useGapasStore()
  
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionTab, setActionTab] = useState<'deposit' | 'withdraw'>('deposit')

  // Deposit State
  const [depositMethod, setDepositMethod] = useState<'GCASH' | 'BANK'>('GCASH')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [depositRefNum, setDepositRefNum] = useState<string>('REF-' + Math.floor(10000000 + Math.random() * 90000000))
  const [depositLoading, setDepositLoading] = useState(false)

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<'GCASH' | 'BANK'>('GCASH')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [withdrawDestination, setWithdrawDestination] = useState<string>('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const did = user?.did || `did:stellar:GAPAS:${address || 'GBTTGUEMWPFC53GBAHJMQIKD6IGDOLPRMSGPYQP34FKV73FJW5K6ZJZD'}`

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
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    showToast('Balances updated from Stellar ledger', 'success')
  }

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter a valid deposit amount', 'error')
      return
    }
    if (!depositRefNum.trim()) {
      showToast('Reference Number is required', 'error')
      return
    }

    setDepositLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setDepositLoading(false)

    // Deposit goes to USDC balance directly
    updateBalances({ usdc: balances.usdc + amt })

    const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    addTransaction({
      id: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'RETURN',
      amount: amt,
      memo: `Deposited via ${depositMethod} (Ref: ${depositRefNum})`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    addReceipt({
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'TRANSFER',
      fromDid: `external:${depositMethod.toLowerCase()}:${depositRefNum}`,
      toDid: did,
      amountUsdc: amt,
      amountPhp: amt * USDC_TO_PHP_RATE,
      exchangeRate: USDC_TO_PHP_RATE,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    showToast(`Deposited ${formatUSDC(amt)} USDC successfully!`, 'success')
    setDepositAmount('')
    // Regenerate dynamic ref number for next transaction
    setDepositRefNum('REF-' + Math.floor(10000000 + Math.random() * 90000000))
  }

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter a valid cash-out amount', 'error')
      return
    }

    if (!withdrawDestination.trim()) {
      showToast('Provide destination e-wallet or bank account number', 'error')
      return
    }

    // Cashout is processed from USDC balance directly
    if (amt > balances.usdc) {
      showToast('Insufficient USDC balance.', 'error')
      return
    }

    setWithdrawLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setWithdrawLoading(false)

    updateBalances({ usdc: balances.usdc - amt })

    const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    addTransaction({
      id: `WTH-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'CASHOUT',
      amount: amt,
      memo: `Cash-out to ${withdrawMethod} (${withdrawDestination})`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    addReceipt({
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'WITHDRAWAL',
      fromDid: did,
      toDid: `external:${withdrawMethod.toLowerCase()}:${withdrawDestination}`,
      amountUsdc: amt,
      amountPhp: amt * USDC_TO_PHP_RATE,
      exchangeRate: USDC_TO_PHP_RATE,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    showToast(`Withdrew ${formatUSDC(amt)} USDC (≈ ${formatPHP(amt * USDC_TO_PHP_RATE)}) to your ${withdrawMethod} wallet!`, 'success')
    setWithdrawAmount('')
    setWithdrawDestination('')
  }

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">Stellar Assets & Swaps</h1>
        <p className="page-subtitle">Interactive On-Chain Settlement Hub</p>
      </div>

      {/* Premium Unified USDC Balance Panel */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}>
          {/* Glass background details */}
          <div style={{
            position: 'absolute', top: -50, right: -30,
            width: 180, height: 180,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                Stellar USDC Token Balance
              </p>
              <button
                onClick={refreshBalance}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '0.25rem' }}
                aria-label="Refresh balances"
              >
                <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-jakarta)', lineHeight: 1 }}>
                {formatUSDC(balances.usdc)}
              </p>
              <span style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 800 }}>
                USDC
              </span>
            </div>

            {/* Sub-indicative Rate */}
            <p style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: 600, marginBottom: '1.5rem' }}>
              ≈ {formatPHP(balances.usdc * USDC_TO_PHP_RATE)} PHP
            </p>

            {/* Address Row */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Wallet size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                {address || 'Stellar ledger disconnected'}
              </span>
              <button
                onClick={copyAddress}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '0.25rem', flexShrink: 0 }}
                aria-label="Copy wallet address"
              >
                {copied ? <CheckCircle size={14} color="#22c55e" /> : <Copy size={14} />}
              </button>
              <a
                href={getAccountExplorerUrl(address || '')}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0, display: 'flex' }}
                aria-label="View account on explorer"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Desk Tabs */}
      <div className="gapas-card animate-fade-in-up delay-150" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
          {[
            { id: 'deposit', label: 'Add Funds', icon: PlusCircle },
            { id: 'withdraw', label: 'Off-Ramp Cash', icon: ArrowUpRight }
          ].map((tab) => {
            const Icon = tab.icon
            const active = actionTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActionTab(tab.id as any)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '0.75rem 0.5rem',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 1. DEPOSIT / ADD FUNDS */}
        {actionTab === 'deposit' && (
          <form onSubmit={handleExecuteDeposit} className="animate-fade-in">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Deposit Method</label>
              <div className="grid-responsive-2" style={{ gap: '0.5rem' }}>
                {[
                  { id: 'GCASH', label: 'GCash', icon: Smartphone },
                  { id: 'BANK', label: 'Bank (BPI)', icon: Landmark }
                ].map((item) => {
                  const Icon = item.icon
                  const active = depositMethod === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDepositMethod(item.id as any)}
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderRadius: 'var(--radius-md)',
                        border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: active ? 'rgba(27,67,50,0.06)' : 'var(--color-card)',
                        color: active ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Reference Number (GCash/Bank Transfer Ref)
              </label>
              <input
                type="text"
                value={depositRefNum}
                onChange={(e) => setDepositRefNum(e.target.value)}
                className="form-input"
                placeholder="e.g. REF-12345678"
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Amount to Deposit (USDC)
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                {depositAmount && `≈ ₱${(parseFloat(depositAmount) * USDC_TO_PHP_RATE).toFixed(2)} PHP cost via ${depositMethod}`}
              </span>
            </div>

            <button type="submit" disabled={depositLoading} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              {depositLoading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Securing Payment Gateway...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Complete Simulated Deposit
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. OFF-RAMP CASH OUT */}
        {actionTab === 'withdraw' && (
          <form onSubmit={handleExecuteWithdrawal} className="animate-fade-in">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Off-Ramp Provider</label>
              <div className="grid-responsive-2" style={{ gap: '0.5rem' }}>
                {[
                  { id: 'GCASH', label: 'GCash / PayMaya', icon: Smartphone },
                  { id: 'BANK', label: 'Local Bank (BDO)', icon: Landmark }
                ].map((item) => {
                  const Icon = item.icon
                  const active = withdrawMethod === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWithdrawMethod(item.id as any)}
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderRadius: 'var(--radius-md)',
                        border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: active ? 'rgba(27,67,50,0.06)' : 'var(--color-card)',
                        color: active ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Amount to Cash Out (USDC)
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                Balance available: <strong>{formatUSDC(balances.usdc)} USDC</strong>
                {withdrawAmount && ` (You will receive ≈ ₱${(parseFloat(withdrawAmount) * USDC_TO_PHP_RATE).toFixed(2)} PHP)`}
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                {withdrawMethod === 'GCASH' ? 'GCash Account Mobile Number' : 'Bank Account Number'}
              </label>
              <input
                type="text"
                placeholder={withdrawMethod === 'GCASH' ? '09xx-xxx-xxxx' : 'Account Name & Number'}
                value={withdrawDestination}
                onChange={(e) => setWithdrawDestination(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" disabled={withdrawLoading} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              {withdrawLoading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Initiating Stellar Off-Ramp...
                </>
              ) : (
                <>
                  <ArrowUpRight size={16} />
                  Authorize Instapay Payout
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Transaction History Logs */}
      <div className="animate-fade-in-up delay-200">
        <h2 className="section-title">Tamper-Proof Transaction History</h2>
        <div className="gapas-card" style={{ padding: '0.5rem 1rem' }}>
          {myTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <p>No transactions yet</p>
            </div>
          ) : (
            myTransactions.map((tx) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{
                  background: 
                    tx.type === 'FUND' ? 'rgba(59,130,246,0.1)' : 
                    tx.type === 'RETURN' ? 'rgba(34,197,94,0.1)' : 
                    tx.type === 'CASHOUT' ? 'rgba(239,68,68,0.1)' : 
                    'rgba(249,173,0,0.1)',
                }}>
                  {tx.type === 'FUND' ? (
                    <ArrowUpRight size={18} color="#2563eb" />
                  ) : tx.type === 'RETURN' ? (
                    <ArrowDownLeft size={18} color="#16a34a" />
                  ) : tx.type === 'CASHOUT' ? (
                    <ArrowUpRight size={18} color="#ef4444" />
                  ) : (
                    <RefreshCw size={18} color="#d97706" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>
                    {tx.memo || tx.type}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                  color: (tx.type === 'FUND' || tx.type === 'CASHOUT') ? '#dc2626' : '#16a34a',
                  flexShrink: 0,
                }}>
                  {(tx.type === 'FUND' || tx.type === 'CASHOUT') ? '-' : '+'}{formatUSDC(tx.amount)} USDC
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

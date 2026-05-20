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
  formatUSDC, formatPHP, shortenAddress, USDC_TO_PHP_RATE, XLM_TO_USDC_RATE
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
    user
  } = useGapasStore()
  
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'usdc' | 'xlm' | 'php'>('usdc')
  const [actionTab, setActionTab] = useState<'swap' | 'deposit' | 'withdraw'>('swap')

  // Swap State
  const [swapFrom, setSwapFrom] = useState<'USDC' | 'XLM' | 'PHP'>('USDC')
  const [swapTo, setSwapTo] = useState<'USDC' | 'XLM' | 'PHP'>('PHP')
  const [swapAmount, setSwapAmount] = useState<string>('')
  
  // Deposit State
  const [depositMethod, setDepositMethod] = useState<'GCASH' | 'BANK' | 'XLM'>('GCASH')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [depositLoading, setDepositLoading] = useState(false)

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<'GCASH' | 'BANK'>('GCASH')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [withdrawDestination, setWithdrawDestination] = useState<string>('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const did = user?.did || `did:stellar:GAPAS:${address || 'GAX_MOCK_USER_7F8E9D2C3B4A5'}`

  // Swap Rate Calculations
  const getSwapRate = () => {
    if (swapFrom === 'USDC' && swapTo === 'PHP') return USDC_TO_PHP_RATE
    if (swapFrom === 'PHP' && swapTo === 'USDC') return 1 / USDC_TO_PHP_RATE
    if (swapFrom === 'XLM' && swapTo === 'USDC') return XLM_TO_USDC_RATE
    if (swapFrom === 'USDC' && swapTo === 'XLM') return 1 / XLM_TO_USDC_RATE
    if (swapFrom === 'XLM' && swapTo === 'PHP') return XLM_TO_USDC_RATE * USDC_TO_PHP_RATE
    if (swapFrom === 'PHP' && swapTo === 'XLM') return 1 / (XLM_TO_USDC_RATE * USDC_TO_PHP_RATE)
    return 1
  }

  const getEstimatedSwapOutput = () => {
    const amt = parseFloat(swapAmount)
    if (isNaN(amt) || amt <= 0) return 0
    return amt * getSwapRate()
  }

  const handleSwapSourceChange = (src: 'USDC' | 'XLM' | 'PHP') => {
    setSwapFrom(src)
    if (src === 'USDC') setSwapTo('PHP')
    else if (src === 'PHP') setSwapTo('USDC')
    else if (src === 'XLM') setSwapTo('USDC')
  }

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

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(swapAmount)
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter a valid swap amount', 'error')
      return
    }

    // Check balance
    const sourceKey = swapFrom.toLowerCase() as 'usdc' | 'xlm' | 'php'
    const targetKey = swapTo.toLowerCase() as 'usdc' | 'xlm' | 'php'
    const currentSourceBalance = balances[sourceKey]

    if (amt > currentSourceBalance) {
      showToast(`Insufficient ${swapFrom} balance`, 'error')
      return
    }

    const outputAmt = getEstimatedSwapOutput()

    // Deduct source, add target
    updateBalances({
      [sourceKey]: currentSourceBalance - amt,
      [targetKey]: balances[targetKey] + outputAmt
    })

    // Generate Transaction Hash & IDs
    const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const txId = `SWAP-${Math.floor(10000 + Math.random() * 90000)}`

    // Log Transaction in local list
    addTransaction({
      id: txId,
      txHash,
      type: 'REINVESTMENT',
      amount: swapFrom === 'USDC' ? amt : (swapFrom === 'PHP' ? amt / USDC_TO_PHP_RATE : amt * XLM_TO_USDC_RATE),
      memo: `Simulated swap: ${amt} ${swapFrom} ⇄ ${outputAmt.toFixed(2)} ${swapTo}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    // Log W3C Receipt
    addReceipt({
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'SWAP',
      fromDid: did,
      toDid: did,
      amountUsdc: swapFrom === 'USDC' ? amt : (swapFrom === 'PHP' ? amt / USDC_TO_PHP_RATE : amt * XLM_TO_USDC_RATE),
      amountPhp: swapFrom === 'PHP' ? amt : (swapFrom === 'USDC' ? amt * USDC_TO_PHP_RATE : amt * XLM_TO_USDC_RATE * USDC_TO_PHP_RATE),
      exchangeRate: getSwapRate(),
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    showToast(`Successfully swapped ${amt} ${swapFrom} to ${outputAmt.toFixed(2)} ${swapTo}!`, 'success')
    setSwapAmount('')
  }

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter a valid deposit amount', 'error')
      return
    }

    setDepositLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setDepositLoading(false)

    // Deposit goes to PHP balance if GCash/Bank, or XLM if XLM
    if (depositMethod === 'XLM') {
      updateBalances({ xlm: balances.xlm + amt })
    } else {
      updateBalances({ php: balances.php + amt })
    }

    const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    addTransaction({
      id: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'RETURN',
      amount: depositMethod === 'XLM' ? amt * XLM_TO_USDC_RATE : amt / USDC_TO_PHP_RATE,
      memo: `Deposited via ${depositMethod}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    addReceipt({
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'TRANSFER',
      fromDid: `external:${depositMethod.toLowerCase()}`,
      toDid: did,
      amountUsdc: depositMethod === 'XLM' ? amt * XLM_TO_USDC_RATE : amt / USDC_TO_PHP_RATE,
      amountPhp: depositMethod === 'XLM' ? amt * XLM_TO_USDC_RATE * USDC_TO_PHP_RATE : amt,
      exchangeRate: depositMethod === 'XLM' ? XLM_TO_USDC_RATE * USDC_TO_PHP_RATE : USDC_TO_PHP_RATE,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    showToast(`Deposited ${amt} ${depositMethod === 'XLM' ? 'XLM' : 'PHP'} successfully!`, 'success')
    setDepositAmount('')
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

    // Cashout is processed from PHP balance primarily (or equivalent USDC converted to PHP)
    // Check if user has enough PHP, or enough USDC if they wish to offramp USDC.
    // Let's check PHP balance first:
    if (amt > balances.php) {
      showToast('Insufficient PHP balance. Please swap your USDC to PHP first.', 'error')
      return
    }

    setWithdrawLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setWithdrawLoading(false)

    updateBalances({ php: balances.php - amt })

    const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    addTransaction({
      id: `WTH-${Math.floor(10000 + Math.random() * 90000)}`,
      txHash,
      type: 'CASHOUT',
      amount: amt / USDC_TO_PHP_RATE,
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
      amountUsdc: amt / USDC_TO_PHP_RATE,
      amountPhp: amt,
      exchangeRate: USDC_TO_PHP_RATE,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    })

    showToast(`Withdrew ${formatPHP(amt)} to your ${withdrawMethod} wallet!`, 'success')
    setWithdrawAmount('')
    setWithdrawDestination('')
  }

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">Stellar Assets & Swaps</h1>
        <p className="page-subtitle">Interactive On-Chain Settlement Hub</p>
      </div>

      {/* Multi-Asset Balances Carousel Panel */}
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

          {/* Tab Selector inside the card */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
            {[
              { id: 'usdc', label: '🟢 USDC Token', balance: balances.usdc, suffix: 'USDC' },
              { id: 'xlm', label: '⭐ XLM Native', balance: balances.xlm, suffix: 'XLM' },
              { id: 'php', label: '₱ PHP Fiat', balance: balances.php, suffix: 'PHP' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                  border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(5px)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeTab === 'usdc' ? 'USDC Liquidity' : activeTab === 'xlm' ? 'Native Gas reserve' : 'Settled Cash PHP'} Balance
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-jakarta)', lineHeight: 1 }}>
                {activeTab === 'usdc' && formatUSDC(balances.usdc)}
                {activeTab === 'xlm' && balances.xlm.toFixed(4)}
                {activeTab === 'php' && formatPHP(balances.php)}
              </p>
              {activeTab !== 'php' && (
                <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 700, alignSelf: 'flex-end', paddingBottom: '0.2rem' }}>
                  {activeTab.toUpperCase()}
                </span>
              )}
              <button
                onClick={refreshBalance}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: '0.25rem', marginLeft: 'auto', alignSelf: 'flex-end' }}
                aria-label="Refresh balances"
              >
                <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              </button>
            </div>

            {/* Sub-indicative Rate */}
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.25rem' }}>
              {activeTab === 'usdc' && `≈ ${formatPHP(balances.usdc * USDC_TO_PHP_RATE)}`}
              {activeTab === 'xlm' && `≈ ${formatUSDC(balances.xlm * XLM_TO_USDC_RATE)} USDC (${formatPHP(balances.xlm * XLM_TO_USDC_RATE * USDC_TO_PHP_RATE)})`}
              {activeTab === 'php' && `≈ ${formatUSDC(balances.php / USDC_TO_PHP_RATE)} USDC`}
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
            { id: 'swap', label: 'Quick Swap', icon: ArrowRightLeft },
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
                  fontSize: '0.8rem',
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

        {/* 1. SWAP ENGINE */}
        {actionTab === 'swap' && (
          <form onSubmit={handleExecuteSwap} className="animate-fade-in">
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>From Asset</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={swapFrom}
                  onChange={(e) => handleSwapSourceChange(e.target.value as any)}
                  className="form-input"
                  style={{ width: '35%', fontWeight: 700, color: 'var(--color-primary-dark)' }}
                >
                  <option value="USDC">USDC</option>
                  <option value="XLM">XLM</option>
                  <option value="PHP">PHP</option>
                </select>
                <input
                  type="number"
                  placeholder="0.00"
                  step="any"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', position: 'absolute', right: '0.5rem', bottom: '-1.15rem' }}>
                Balance: {balances[swapFrom.toLowerCase() as 'usdc' | 'xlm' | 'php'].toFixed(2)} {swapFrom}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(27,67,50,0.1)',
                color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem'
              }}>
                ↓
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>To Asset</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={swapTo}
                  onChange={(e) => setSwapTo(e.target.value as any)}
                  className="form-input"
                  style={{ width: '35%', fontWeight: 700, color: 'var(--color-primary-dark)' }}
                >
                  {swapFrom === 'USDC' && (
                    <>
                      <option value="PHP">PHP</option>
                      <option value="XLM">XLM</option>
                    </>
                  )}
                  {swapFrom === 'PHP' && (
                    <>
                      <option value="USDC">USDC</option>
                      <option value="XLM">XLM</option>
                    </>
                  )}
                  {swapFrom === 'XLM' && (
                    <>
                      <option value="USDC">USDC</option>
                      <option value="PHP">PHP</option>
                    </>
                  )}
                </select>
                <input
                  type="text"
                  readOnly
                  placeholder="0.00"
                  value={getEstimatedSwapOutput() > 0 ? getEstimatedSwapOutput().toFixed(2) : ''}
                  className="form-input"
                  style={{ flex: 1, backgroundColor: 'var(--color-surface)', opacity: 0.9 }}
                />
              </div>
            </div>

            {/* Rate Preview Indicator */}
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              border: '1px dashed var(--color-border)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Conversion Rate:</span>
              <strong style={{ color: 'var(--color-primary-dark)' }}>
                1 {swapFrom} = {getSwapRate().toFixed(4)} {swapTo}
              </strong>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <Coins size={16} />
              Confirm Stellar Swap
            </button>
          </form>
        )}

        {/* 2. DEPOSIT / ADD FUNDS */}
        {actionTab === 'deposit' && (
          <form onSubmit={handleExecuteDeposit} className="animate-fade-in">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Deposit Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'GCASH', label: 'GCash', icon: Smartphone },
                  { id: 'BANK', label: 'Bank (BPI)', icon: Landmark },
                  { id: 'XLM', label: 'XLM Feed', icon: Send }
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

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Amount to Deposit ({depositMethod === 'XLM' ? 'XLM' : 'PHP'})
              </label>
              <input
                type="number"
                placeholder={depositMethod === 'XLM' ? 'e.g. 100' : 'e.g. 5000'}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                {depositAmount && `≈ $${(depositMethod === 'XLM' ? parseFloat(depositAmount) * XLM_TO_USDC_RATE : parseFloat(depositAmount) / USDC_TO_PHP_RATE).toFixed(2)} USDC on Stellar`}
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

        {/* 3. OFF-RAMP CASH OUT */}
        {actionTab === 'withdraw' && (
          <form onSubmit={handleExecuteWithdrawal} className="animate-fade-in">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Off-Ramp Provider</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
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
                Amount to Cash Out (PHP)
              </label>
              <input
                type="number"
                placeholder="PHP amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                Balance available: <strong>{formatPHP(balances.php)}</strong> (Swap your USDC/XLM if needed)
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

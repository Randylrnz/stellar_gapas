'use client'

import { useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { MOCK_TRANSACTIONS } from '@/lib/mockData'
import { formatUSDC } from '@/lib/types'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { getTxExplorerUrl } from '@/lib/stellar'

const TX_TYPE_CONFIG = {
  FUND: { icon: ArrowUpRight, label: 'Investment', color: '#dc2626', bg: 'rgba(59,130,246,0.1)', sign: '-' },
  RETURN: { icon: ArrowDownLeft, label: 'Return', color: '#16a34a', bg: 'rgba(34,197,94,0.1)', sign: '+' },
  PAYOUT: { icon: ArrowDownLeft, label: 'Payout', color: '#16a34a', bg: 'rgba(34,197,94,0.1)', sign: '+' },
  COOPERATIVE_FEE: { icon: RefreshCw, label: 'Coop Fee', color: '#d97706', bg: 'rgba(249,173,0,0.1)', sign: '+' },
  REINVESTMENT: { icon: RefreshCw, label: 'Reinvestment', color: '#2563eb', bg: 'rgba(59,130,246,0.1)', sign: '-' },
  CASHOUT: { icon: ArrowUpRight, label: 'Cash Out', color: '#dc2626', bg: 'rgba(239,68,68,0.1)', sign: '-' },
}

export default function TransactionsPage() {
  const { isConnected, myTransactions, setMyTransactions } = useGapasStore()
  const router = useRouter()

  useEffect(() => {
    // Redirect removed
    if (myTransactions.length === 0) setMyTransactions(MOCK_TRANSACTIONS)
  }, [isConnected, router, myTransactions.length, setMyTransactions])

  return (
    <div className="page-with-nav">
      {/* Header */}
      <div className="sticky-back-header">
        <Link href="/wallet" style={{ color: 'var(--color-text)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>Transaction History</h1>
      </div>

      <div className="app-container" style={{ paddingTop: '1rem' }}>
        {myTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <RefreshCw size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>No transactions yet</p>
          </div>
        ) : (
          <div className="gapas-card" style={{ padding: '0.5rem 1rem' }}>
            {myTransactions.map((tx, i) => {
              const config = TX_TYPE_CONFIG[tx.type] || TX_TYPE_CONFIG.FUND
              const { icon: Icon, label, color, bg, sign } = config
              return (
                <div key={tx.id} className="tx-item animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="tx-icon" style={{ background: bg }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.memo || label}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${tx.status === 'SUCCESS' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.5625rem' }}>
                        {tx.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <a
                        href={getTxExplorerUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', display: 'flex' }}
                        aria-label="View on Stellar Explorer"
                        id={`tx-explorer-${tx.id}`}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color, flexShrink: 0 }}>
                    {sign}{formatUSDC(tx.amount)} USDC
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

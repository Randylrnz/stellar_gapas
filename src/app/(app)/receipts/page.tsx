'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import {
  FileText, ExternalLink, ChevronDown, ChevronUp, CheckCircle, Search, Filter,
  Shield, Landmark, Coins, HeartHandshake, HelpCircle, User
} from 'lucide-react'
import { formatUSDC, formatPHP, shortenAddress } from '@/lib/types'

export default function ReceiptsPage() {
  const { receipts } = useGapasStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'INVESTMENT' | 'PAYOUT' | 'SWAP' | 'INSURANCE' | 'WITHDRAWAL'>('ALL')
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedReceiptId(expandedReceiptId === id ? null : id)
  }

  // Filter & Search Receipts
  const filteredReceipts = receipts.filter((rcpt) => {
    const matchesSearch =
      rcpt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rcpt.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rcpt.fromDid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rcpt.toDid.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = activeFilter === 'ALL' || rcpt.type === activeFilter

    return matchesSearch && matchesType
  })

  const getReceiptIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT':
        return <Landmark size={18} color="var(--color-primary)" />
      case 'PAYOUT':
        return <Coins size={18} color="#10b981" />
      case 'SWAP':
        return <Coins size={18} color="#f59e0b" />
      case 'INSURANCE':
        return <Shield size={18} color="#ef4444" />
      case 'WITHDRAWAL':
      default:
        return <FileText size={18} color="var(--color-text-muted)" />
    }
  }

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">🧾 Receipts Explorer</h1>
        <p className="page-subtitle">Tamper-Proof W3C Digital Receipts & Stellar Transactions</p>
      </div>

      {/* Explorer Search and Filter Toolbar */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem'
        }}>
          {/* Search bar input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by receipt ID, hash, or DID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', height: '38px' }}
            />
          </div>

          {/* Filter dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--color-text-secondary)" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="form-input"
              style={{ width: '150px', height: '38px', color: 'var(--color-text)', fontWeight: 600 }}
            >
              <option value="ALL">All Categories</option>
              <option value="INVESTMENT">Crowd Investments</option>
              <option value="PAYOUT">Harvest Settlements</option>
              <option value="SWAP">Currency Swaps</option>
              <option value="INSURANCE">Weather Insurance</option>
              <option value="WITHDRAWAL">Instapay Off-Ramps</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table receipts list */}
      <div className="animate-fade-in-up delay-150" style={{ marginBottom: '1rem' }}>
        <h2 className="section-title">Verified Receipts Ledger ({filteredReceipts.length})</h2>

        {filteredReceipts.length === 0 ? (
          <div className="gapas-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <FileText size={32} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No cryptographic receipts matched your search filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredReceipts.map((rcpt) => {
              const isExpanded = expandedReceiptId === rcpt.id
              
              return (
                <div
                  key={rcpt.id}
                  className="gapas-card"
                  style={{
                    padding: '0.875rem 1rem',
                    border: isExpanded ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Summary row */}
                  <div
                    onClick={() => toggleRow(rcpt.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getReceiptIcon(rcpt.type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text)' }}>
                          {rcpt.id}
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>
                          {rcpt.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                        Type: <strong style={{ color: 'var(--color-primary)' }}>{rcpt.type}</strong> · Date: {new Date(rcpt.createdAt).toLocaleDateString('en-PH')}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', marginRight: '0.5rem', flexShrink: 0 }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-text)', display: 'block' }}>
                        {formatUSDC(rcpt.amountUsdc)} USDC
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        ≈ {formatPHP(rcpt.amountPhp)}
                      </span>
                    </div>

                    <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Cryptographic breakdown details */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '0.875rem',
                      borderTop: '1px dashed var(--color-border)',
                      paddingTop: '0.875rem',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)'
                    }} className="animate-fade-in">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>From DID</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--color-text-secondary)' }}>
                            {rcpt.fromDid}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>To DID</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--color-text-secondary)' }}>
                            {rcpt.toDid}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Ledger Transaction Hash</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--color-text-secondary)' }}>
                            {rcpt.txHash}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Cryptographic Standard</span>
                          <strong style={{ color: 'var(--color-primary-dark)' }}>
                            W3C JSON-LD Verifiable Receipt (SHA-256)
                          </strong>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Settlement Exchange Rate</span>
                          <span>1 USDC = ₱{rcpt.exchangeRate.toFixed(2)} PHP</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Consensus Protocol</span>
                          <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={12} /> Stellar Consensus Protocol (SCP)
                          </span>
                        </div>
                      </div>

                      {/* Hyperlink row */}
                      <div style={{
                        marginTop: '0.875rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Shield size={12} />
                          Anchor verified on Stellar Testnet block ledger.
                        </span>
                        
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${rcpt.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            color: 'var(--color-primary)', fontWeight: 700,
                            textDecoration: 'none', fontSize: '0.7rem'
                          }}
                        >
                          Verify on Stellar Expert Explorer
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

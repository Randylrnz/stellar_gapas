'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import {
  Gavel, PlusCircle, CheckCircle, XCircle, AlertCircle, Calendar,
  TrendingUp, Users, DollarSign, ArrowRight, Loader2
} from 'lucide-react'
import { formatPHP, formatUSDC } from '@/lib/types'

export default function DaoPage() {
  const {
    address,
    activeRole,
    proposals,
    createProposal,
    voteProposal,
    farms,
    myInvestments,
    showToast
  } = useGapasStore()

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'PASSED' | 'REJECTED'>('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'EQUIPMENT_PURCHASE' | 'DISTRIBUTION_CHANGE' | 'EMERGENCY_FUND' | 'BUDGET_ALLOCATION' | 'CROP_PLANNING' | 'OTHER'>('EQUIPMENT_PURCHASE')
  const [budget, setBudget] = useState('')
  const [detail, setDetail] = useState('')
  const [duration, setDuration] = useState('7')
  const [submitting, setSubmitting] = useState(false)

  // Calculate user's voting weight dynamically
  const getUserVotingWeight = () => {
    if (!address) return 0
    if (activeRole === 'FARMER') {
      // Farmer weight = total estimated value of registered crop/livestock/equipment assets
      const farmerFarms = farms.filter(f => f.farmerWallet === address)
      const assetVal = farmerFarms.reduce((sum, f) => sum + (f.valuePhp || f.fundingGoal * 57.43), 0)
      return assetVal || 10000 // Fallback minimum weight
    } else if (activeRole === 'INVESTOR') {
      // Investor weight = total active USDC investments converted to PHP
      const investmentVal = myInvestments.reduce((sum, i) => sum + i.amount * 57.43, 0)
      return investmentVal || 5000 // Fallback minimum weight
    }
    // Cooperative weight
    return 15000
  }

  const weight = getUserVotingWeight()

  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !detail.trim()) {
      showToast('Please fill out all required fields', 'error')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      createProposal(
        title,
        type,
        budget ? `₱${parseFloat(budget).toLocaleString()}` : undefined,
        detail,
        parseInt(duration)
      )
      setSubmitting(false)
      setShowCreateForm(false)
      setTitle('')
      setDetail('')
      setBudget('')
      showToast('DAO Governance Proposal published on-chain successfully!', 'success')
    }, 1200)
  }

  const handleVote = (propId: string, voteType: 'YES' | 'NO') => {
    const proposal = proposals.find(p => p.id === propId)
    if (proposal?.voters?.includes(address || '')) {
      showToast('You have already cast your on-chain ballot for this proposal!', 'error')
      return
    }
    voteProposal(propId, voteType)
    showToast(`Cast ${voteType} vote using on-chain weight of ${formatPHP(weight)}!`, 'success')
  }

  const filteredProposals = proposals.filter(p => {
    if (activeFilter === 'ALL') return true
    return p.status === activeFilter
  })

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">⚖️ DAO Governance</h1>
        <p className="page-subtitle">Decentralized Voting, Asset Budgets & Policy Proposals</p>
      </div>


      {/* Filter toolbar & Create button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="animate-fade-in-up delay-150">
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {(['ALL', 'ACTIVE', 'PASSED', 'REJECTED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                background: activeFilter === filter ? 'var(--color-primary)' : 'var(--color-card)',
                border: '1px solid var(--color-border)',
                color: activeFilter === filter ? '#fff' : 'var(--color-text-secondary)',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {activeRole === 'FARMER' ? (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          >
            <PlusCircle size={14} />
            Draft Proposal
          </button>
        ) : (
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            🌾 Farmers can draft proposals
          </span>
        )}
      </div>

      {/* 1. DRAFT PROPOSAL FORM */}
      {showCreateForm && activeRole === 'FARMER' && (
        <div className="gapas-card animate-scale-up" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1.5px solid var(--color-primary)' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <PlusCircle size={18} color="var(--color-primary)" />
            Draft On-Chain DAO Proposal
          </h2>

          <form onSubmit={handleCreateProposalSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Proposal Title *</label>
              <input
                type="text"
                placeholder="e.g. Procure Solar Water Pump for Sta. Rosa fields"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid-responsive-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Proposal Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="form-input"
                  style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}
                >
                  <option value="EQUIPMENT_PURCHASE">Equipment Purchase</option>
                  <option value="DISTRIBUTION_CHANGE">Revenue Split Change</option>
                  <option value="EMERGENCY_FUND">Emergency Weather Fund</option>
                  <option value="BUDGET_ALLOCATION">Barangay Budget Allocation</option>
                  <option value="CROP_PLANNING">Crop Planning & Standards</option>
                  <option value="OTHER">Other Custom Proposal</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Requested Budget (PHP)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000 (Optional)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid-responsive-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Voting Duration (Days)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-input"
                >
                  <option value="3">3 Days (Emergency fast-track)</option>
                  <option value="7">7 Days (Standard term)</option>
                  <option value="14">14 Days (Major structural change)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', paddingBottom: '0.5rem', lineHeight: 1.3 }}>
                  * Draft will anchor on-chain. Requires a simple majority of shares cast to pass.
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>Detailed Specification *</label>
              <textarea
                placeholder="Detail the target outcomes, quotes, barangay growers involved, and operational impact..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="form-input"
                style={{ height: '80px', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    Broadcasting Proposal...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Broadcasting Proposal
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline"
                style={{ flex: 0.3 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PROPOSALS LIST FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }} className="animate-fade-in-up delay-200">
        {filteredProposals.length === 0 ? (
          <div className="gapas-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Gavel size={32} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No proposals found matching this filter.</p>
          </div>
        ) : (
          filteredProposals.map((prop) => {
            const totalVotes = prop.yesVotes + prop.noVotes
            const yesPercent = totalVotes > 0 ? (prop.yesVotes / totalVotes) * 100 : 50
            const noPercent = totalVotes > 0 ? (prop.noVotes / totalVotes) * 100 : 50
            const userHasVoted = prop.voters?.includes(address || '')
            const deadlinePassed = new Date(prop.deadline).getTime() < Date.now()
            
            return (
              <div key={prop.id} className="gapas-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(27,67,50,0.06)',
                      color: 'var(--color-primary-dark)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      marginRight: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      {prop.type.replace('_', ' ')}
                    </span>
                    {prop.budget && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(249,173,0,0.1)',
                        color: 'var(--color-amber-dark)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        Budget: {prop.budget}
                      </span>
                    )}
                  </div>
                  
                  <span className={`badge ${
                    prop.status === 'ACTIVE' ? 'badge-info' :
                    prop.status === 'PASSED' ? 'badge-success' : 'badge-danger'
                  }`} style={{ fontSize: '0.6rem' }}>
                    {prop.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                  {prop.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {prop.detail}
                </p>

                {/* Vote Meter Indicators */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <span style={{ color: '#10b981' }}>Yes: {formatPHP(prop.yesVotes)} ({yesPercent.toFixed(1)}%)</span>
                    <span style={{ color: '#ef4444' }}>No: {formatPHP(prop.noVotes)} ({noPercent.toFixed(1)}%)</span>
                  </div>
                  {/* Dynamic stacked progress bar */}
                  <div style={{
                    height: 8,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-border)',
                    overflow: 'hidden',
                    display: 'flex'
                  }}>
                    <div style={{ width: `${yesPercent}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease' }} />
                    <div style={{ width: `${noPercent}%`, backgroundColor: '#ef4444', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Footer specs & interactive ballot */}
                <div style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <Calendar size={12} />
                    <span>Closes: {new Date(prop.deadline).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Voting Ballot controls */}
                  {prop.status === 'ACTIVE' && !deadlinePassed ? (
                    userHasVoted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                        <CheckCircle size={14} />
                        Ballot Counted
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleVote(prop.id, 'YES')}
                          className="btn btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: '#10b981', color: '#fff' }}
                        >
                          ✓ Vote Yes
                        </button>
                        <button
                          onClick={() => handleVote(prop.id, 'NO')}
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          ✗ Vote No
                        </button>
                      </div>
                    )
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      <AlertCircle size={12} />
                      Voting Terminated
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

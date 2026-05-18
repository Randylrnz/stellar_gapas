'use client'

import type { Farm } from '@/lib/types'
import { formatUSDC, getFundingProgress, getRiskBadgeClass } from '@/lib/types'
import Link from 'next/link'
import { Sprout, Users, MapPin, TrendingUp } from 'lucide-react'

interface FarmCardProps {
  farm: Farm
  compact?: boolean
}

export default function FarmCard({ farm, compact = false }: FarmCardProps) {
  const progress = getFundingProgress(farm.currentFunding, farm.fundingGoal)
  const riskClass = getRiskBadgeClass(farm.riskLevel)
  const assetLabel = farm.cropType || farm.livestockType || 'Unknown'

  return (
    <Link href={`/farms/${farm.id}`} className="farm-card animate-fade-in-up" id={`farm-card-${farm.id}`}>
      {/* Header image area */}
      <div className="farm-card-image" style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1B4332 0%, #2d6a4f 60%, #40916c 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sprout size={28} color="rgba(255,255,255,0.9)" />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', fontWeight: 500 }}>
            {assetLabel}
          </span>
        </div>
        {/* Status badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
        }}>
          <span className={`badge ${farm.status === 'FUNDED' ? 'badge-success' : farm.status === 'ACTIVE' ? 'badge-info' : 'badge-warning'}`}>
            {farm.status}
          </span>
        </div>
        {/* Risk badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
        }}>
          <span className={`badge ${riskClass}`}>
            {farm.riskLevel} RISK
          </span>
        </div>
        {/* Coop badge */}
        {farm.cooperativeEnabled && farm.cooperative && (
          <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
          }}>
            <span className="coop-badge">
              🤝 {farm.cooperative.name.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="farm-card-body">
        <h3 className="farm-card-title">{farm.name}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
          <MapPin size={12} color="var(--color-text-muted)" />
          <span className="farm-card-meta" style={{ marginBottom: 0 }}>{farm.location || 'Philippines'}</span>
        </div>

        {!compact && (
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '0.875rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {farm.description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              {progress}% Funded
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Goal: {formatUSDC(farm.fundingGoal)} USDC
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.625rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
              <TrendingUp size={12} color="var(--color-primary)" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Est. Return</span>
            </div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              +{farm.expectedReturn}%
            </span>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.625rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
              <Users size={12} color="var(--color-primary)" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Investors</span>
            </div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {farm._count?.investments ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

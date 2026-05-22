'use client'

import type { Farm } from '@/lib/types'
import { formatUSDC, getFundingProgress } from '@/lib/types'
import Link from 'next/link'
import { Sprout, Users, MapPin, TrendingUp, User } from 'lucide-react'

interface FarmCardProps {
  farm: Farm
  compact?: boolean
}

function shortenWallet(address: string): string {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getAssetImage(farm: Farm): string {
  if (!farm) return '/Crops.png'
  const typeStr = (farm.assetType || '').toUpperCase()
  const cropStr = farm.cropType || ''
  const livestockStr = farm.livestockType || ''
  
  if (typeStr === 'LIVESTOCK' || livestockStr) {
    return '/LiveStock.png'
  }
  if (typeStr === 'EQUIPMENT' || farm.equipmentDetails) {
    return '/Equipment.png'
  }
  return '/Crops.png'
}

export default function FarmCard({ farm, compact = false }: FarmCardProps) {
  const progress = getFundingProgress(farm.currentFunding, farm.fundingGoal)
  const assetLabel = farm.cropType || farm.livestockType || farm.assetType || 'Unknown'
  const ownerName = farm.farmer?.displayName || farm.farmer?.name || shortenWallet(farm.farmerWallet)

  return (
    <Link href={`/farms/${farm.id}`} className="farm-card animate-fade-in-up" id={`farm-card-${farm.id}`}>
      {/* Header image area */}
      <div className="farm-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={getAssetImage(farm)}
          alt={farm.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0.75rem',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {assetLabel}
          </span>
        </div>
        {/* Status badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
            backgroundColor: farm.status === 'FUNDED' || farm.status === 'COMPLETED'
              ? '#16a34a' 
              : farm.status === 'ACTIVE'
                ? '#165c2d' 
                : '#d97706'
          }}>
            {farm.status}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="farm-card-body">
        <h3 className="farm-card-title">{farm.name}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
          <MapPin size={12} color="var(--color-text-muted)" />
          <span className="farm-card-meta" style={{ marginBottom: 0 }}>{farm.location || 'Philippines'}</span>
        </div>

        {/* Owner name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
          <User size={12} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Owner: {ownerName}
          </span>
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
        <div className="grid-responsive-2" style={{ gap: '0.5rem' }}>
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

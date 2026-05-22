'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import FarmCard from '@/components/FarmCard'
import { MOCK_FARMS } from '@/lib/mockData'
import type { Farm } from '@/lib/types'
import { Search, X, Plus, Eye } from 'lucide-react'
import Link from 'next/link'

type FilterCategory = 'MY_ASSETS' | 'ALL' | 'CROP' | 'LIVESTOCK' | 'EQUIPMENT'

// Sample view-only assets for "My Assets" tab
const SAMPLE_MY_ASSETS = [
  {
    id: 'sample-1',
    tokenId: 'CROP-7821',
    name: 'Benguet Strawberry Farm',
    assetType: 'CROP',
    cropType: 'Strawberry',
    location: 'La Trinidad, Benguet',
    fundingGoal: 4000,
    currentFunding: 1200,
    expectedReturn: 25,
    riskLevel: 'MEDIUM' as const,
    status: 'ACTIVE' as const,
    valuePhp: 228600,
    description: 'Mountain strawberry cultivation at 1500m elevation. Premium fresh strawberries supplied to Metro Manila supermarkets.',
    harvestSchedule: 'October 2025',
    duration: 90,
  },
  {
    id: 'sample-2',
    tokenId: 'LIVE-4432',
    name: 'Atok Native Hog Farm',
    assetType: 'LIVESTOCK',
    livestockType: 'Hogs (Native)',
    location: 'Atok, Benguet',
    fundingGoal: 6000,
    currentFunding: 0,
    expectedReturn: 20,
    riskLevel: 'MEDIUM' as const,
    status: 'PENDING' as const,
    valuePhp: 344580,
    description: 'Free-range native hog breeding with biosecurity protocols. Market-ready hogs in 6 months.',
    harvestSchedule: 'November 2025',
    duration: 180,
  },
]

export default function FarmsPage() {
  const { setFarms, farms, address, activeRole, simulateIncomingBlockchainEvent, showToast } = useGapasStore()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')

  useEffect(() => {
    setFarms(MOCK_FARMS)
  }, [setFarms])

  const filtered = farms.filter((farm) => {
    const matchSearch =
      farm.name.toLowerCase().includes(search.toLowerCase()) ||
      (farm.cropType ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (farm.location ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (farm.livestockType ?? '').toLowerCase().includes(search.toLowerCase())

    const matchCategory = (() => {
      if (filterCategory === 'ALL') return farm.assetType !== 'CARBON'
      if (filterCategory === 'MY_ASSETS') return farm.farmerWallet === address
      if (filterCategory === 'CROP') return !!farm.cropType && farm.assetType !== 'EQUIPMENT' && farm.assetType !== 'CARBON'
      if (filterCategory === 'LIVESTOCK') return !!farm.livestockType || farm.assetType === 'LIVESTOCK'
      if (filterCategory === 'EQUIPMENT') return farm.assetType === 'EQUIPMENT'
      return true
    })()

    return matchSearch && matchCategory
  })

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: 'MY_ASSETS', label: 'My Assets' },
    { id: 'ALL', label: 'All Items' },
    { id: 'CROP', label: 'Crops' },
    { id: 'LIVESTOCK', label: 'Livestock' },
    { id: 'EQUIPMENT', label: 'Equipment' },
  ]

  const isMyAssetsTab = filterCategory === 'MY_ASSETS'

  return (
    <div className="page-with-nav app-container">
      {/* Header */}
      <div className="page-header animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-subtitle">Browse verified Philippine farm assets</p>
        </div>
        <Link
          href="/create-farm"
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none', flexShrink: 0 }}
          id="marketplace-register-assets-btn"
        >
          <Plus size={15} />
          Register My Asset
        </Link>
      </div>


      {/* Search bar */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--color-text-muted)"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            id="farms-search"
            type="text"
            className="form-input"
            placeholder="Search assets, crops, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
            aria-label="Search farms"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: 'var(--color-text-muted)',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="animate-fade-in-up delay-150" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              id={`filter-${tab.id.toLowerCase()}`}
              onClick={() => setFilterCategory(tab.id)}
              className={`btn btn-sm ${filterCategory === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', flexShrink: 0, boxShadow: 'none', border: filterCategory === tab.id ? 'none' : '1px solid var(--color-border)' }}
              aria-pressed={filterCategory === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MY ASSETS — view-only sample cards */}
      {isMyAssetsTab ? (
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            {SAMPLE_MY_ASSETS.length} asset{SAMPLE_MY_ASSETS.length !== 1 ? 's' : ''} found (your registered assets)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {SAMPLE_MY_ASSETS.map((asset) => {
              const progress = Math.round((asset.currentFunding / asset.fundingGoal) * 100)
              return (
                <div key={asset.id} className="gapas-card animate-fade-in-up" style={{ padding: '1.125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--color-primary-light)',
                        color: '#fff',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginRight: '0.5rem'
                      }}>
                        {asset.tokenId}
                      </span>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', display: 'inline-block' }}>
                        {asset.name}
                      </h3>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      backgroundColor: asset.status === 'FUNDED' || asset.status === 'COMPLETED'
                        ? '#16a34a' 
                        : asset.status === 'ACTIVE'
                          ? '#165c2d' 
                          : '#d97706'
                    }}>
                      {asset.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {asset.description}
                  </p>

                  <div className="grid-responsive-2" style={{ gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                    <div>
                      <strong>Location:</strong> {asset.location}
                    </div>
                    <div>
                      <strong>Est. Value:</strong> ₱{asset.valuePhp.toLocaleString()}
                    </div>
                    <div>
                      <strong>Asset Type:</strong> {asset.assetType === 'CROP' ? (asset.cropType) : (asset.livestockType)}
                    </div>
                    <div>
                      <strong>Expected Return:</strong> {asset.expectedReturn}%
                    </div>
                  </div>

                  <div className="progress-bar-container" style={{ marginBottom: '0.375rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{progress}% Crowdfunded</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {asset.currentFunding.toLocaleString()} / {asset.fundingGoal.toLocaleString()} USDC
                    </span>
                  </div>

                  {/* View-only badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.72rem',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                  }}>
                    <Eye size={13} color="var(--color-text-muted)" />
                    View Only — This is your registered asset
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            {filtered.length} asset{filtered.length !== 1 ? 's' : ''} found
          </p>

          {/* Farm grid */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--color-text-muted)',
            }}>
              <span style={{ fontSize: '3rem' }}>🌾</span>
              <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No assets found</p>
              <p style={{ fontSize: '0.875rem' }}>Try a different search or filter</p>
            </div>
          ) : (
            <div className="responsive-grid-4">
              {filtered.map((farm, i) => (
                <div key={farm.id} style={{ animationDelay: `${i * 80}ms`, display: 'flex' }}>
                  <div style={{ width: '100%' }}>
                    <FarmCard farm={farm} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

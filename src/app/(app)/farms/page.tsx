'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import FarmCard from '@/components/FarmCard'
import { MOCK_FARMS } from '@/lib/mockData'
import type { Farm, RiskLevel } from '@/lib/types'
import { Search, SlidersHorizontal, X } from 'lucide-react'

type FilterType = 'ALL' | 'CROP' | 'LIVESTOCK'

export default function FarmsPage() {
  const { setFarms, farms } = useGapasStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setFarms(MOCK_FARMS)
  }, [setFarms])

  const filtered = farms.filter((farm) => {
    const matchSearch =
      farm.name.toLowerCase().includes(search.toLowerCase()) ||
      (farm.cropType ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (farm.location ?? '').toLowerCase().includes(search.toLowerCase())

    const matchType =
      filterType === 'ALL'
        ? true
        : filterType === 'CROP'
        ? !!farm.cropType
        : !!farm.livestockType

    const matchRisk = filterRisk === 'ALL' ? true : farm.riskLevel === filterRisk

    return matchSearch && matchType && matchRisk
  })

  return (
    <div className="page-with-nav app-container">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">🌾 Farm Marketplace</h1>
        <p className="page-subtitle">Invest in verified Philippine farms</p>
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
            placeholder="Search farms, crops, location..."
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
          {(['ALL', 'CROP', 'LIVESTOCK'] as FilterType[]).map((t) => (
            <button
              key={t}
              id={`filter-type-${t.toLowerCase()}`}
              onClick={() => setFilterType(t)}
              className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
              aria-pressed={filterType === t}
            >
              {t === 'ALL' ? '🌾 All' : t === 'CROP' ? '🌱 Crops' : '🐄 Livestock'}
            </button>
          ))}
          <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', flexShrink: 0 }} />
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((r) => (
            <button
              key={r}
              id={`filter-risk-${r.toLowerCase()}`}
              onClick={() => setFilterRisk(r)}
              className={`btn btn-sm ${filterRisk === r ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
              aria-pressed={filterRisk === r}
            >
              {r === 'ALL' ? 'All Risk' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        {filtered.length} farm{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Farm grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--color-text-muted)',
        }}>
          <span style={{ fontSize: '3rem' }}>🌾</span>
          <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No farms found</p>
          <p style={{ fontSize: '0.875rem' }}>Try a different search or filter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {filtered.map((farm, i) => (
            <div key={farm.id} style={{ animationDelay: `${i * 80}ms`, display: 'flex' }}>
              <div style={{ width: '100%' }}>
                <FarmCard farm={farm} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

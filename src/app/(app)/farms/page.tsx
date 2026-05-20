'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import FarmCard from '@/components/FarmCard'
import { MOCK_FARMS } from '@/lib/mockData'
import type { Farm } from '@/lib/types'
import { Search, X, Plus } from 'lucide-react'
import Link from 'next/link'

type FilterCategory = 'MY_ASSETS' | 'ALL' | 'CROP' | 'LIVESTOCK' | 'EQUIPMENT' | 'CARBON'

export default function FarmsPage() {
  const { setFarms, farms, address, activeRole } = useGapasStore()
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
      if (filterCategory === 'ALL') return true
      if (filterCategory === 'MY_ASSETS') return farm.farmerWallet === address
      if (filterCategory === 'CROP') return !!farm.cropType && farm.assetType !== 'EQUIPMENT' && farm.assetType !== 'CARBON'
      if (filterCategory === 'LIVESTOCK') return !!farm.livestockType || farm.assetType === 'LIVESTOCK'
      if (filterCategory === 'EQUIPMENT') return farm.assetType === 'EQUIPMENT'
      if (filterCategory === 'CARBON') return farm.assetType === 'CARBON'
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
    { id: 'CARBON', label: 'Carbon Credits' },
  ]

  return (
    <div className="page-with-nav app-container">
      {/* Header */}
      <div className="page-header animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Palengke</h1>
          <p className="page-subtitle">Mag-invest sa verified Philippine farm assets</p>
        </div>
        <Link
          href="/cooperative"
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none', flexShrink: 0 }}
          id="palengke-register-assets-btn"
        >
          <Plus size={15} />
          Register My Assets
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

      {/* Filter row — category tabs only (no Risk) */}
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

      {/* Results count */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        {filtered.length} asset{filtered.length !== 1 ? 's' : ''} found
        {filterCategory === 'MY_ASSETS' && ' (your registered assets)'}
      </p>

      {/* Farm grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--color-text-muted)',
        }}>
          <span style={{ fontSize: '3rem' }}>🌾</span>
          <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>
            {filterCategory === 'MY_ASSETS' ? 'Wala pang naka-register na assets.' : 'No assets found'}
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            {filterCategory === 'MY_ASSETS'
              ? 'I-register ang iyong assets para makita dito.'
              : 'Try a different search or filter'}
          </p>
          {filterCategory === 'MY_ASSETS' && (
            <Link href="/cooperative" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', textDecoration: 'none' }}>
              Register My Assets
            </Link>
          )}
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

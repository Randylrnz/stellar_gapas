'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { MOCK_COOPERATIVES } from '@/lib/mockData'
import type { RiskLevel } from '@/lib/types'
import { Sprout, Loader2, CheckCircle, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

const CROP_TYPES = [
  'Rice (Palay)', 'White Corn', 'Yellow Corn', 'Carabao Mango', 'Banana (Lakatan)',
  'Banana (Cavendish)', 'Coconut', 'Sugarcane', 'Garlic', 'Sibuyas Tagalog',
  'Tomato', 'Eggplant', 'Ampalaya', 'Sitaw', 'Patola', 'Camote', 'Cassava',
  'Strawberry', 'Pineapple', 'Papaya', 'Watermelon',
]

const LIVESTOCK_TYPES = [
  'Hogs (Native)', 'Hogs (Commercial)', 'Dairy Cattle', 'Beef Cattle',
  'Carabao', 'Goats', 'Sheep', 'Chickens (Broiler)', 'Chickens (Layers)',
  'Ducks', 'Tilapia (Aquaculture)', 'Bangus (Milkfish)', 'Shrimp (Aquaculture)',
]

type AssetType = 'crop' | 'livestock'

export default function CreateFarmPage() {
  const { address, isConnected, addFarm, showToast, cooperatives, setCooperatives } = useGapasStore()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [assetType, setAssetType] = useState<AssetType>('crop')

  const [form, setForm] = useState({
    name: '',
    cropType: '',
    livestockType: '',
    description: '',
    location: '',
    fundingGoal: '',
    expectedYield: '',
    expectedReturn: '',
    riskLevel: 'MEDIUM' as RiskLevel,
    duration: '90',
    harvestSchedule: '',
    cooperativeId: '',
    cooperativeEnabled: false,
  })

  useEffect(() => {
    // Redirect removed
    setCooperatives(MOCK_COOPERATIVES)
  }, [isConnected, router, setCooperatives])

  function handleChange(key: keyof typeof form, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address) return

    if (!form.name.trim()) { showToast('Farm name is required', 'error'); return }
    if (!form.fundingGoal || parseFloat(form.fundingGoal) < 100) {
      showToast('Minimum funding goal is 100 USDC', 'error'); return
    }
    if (assetType === 'crop' && !form.cropType) { showToast('Please select a crop type', 'error'); return }
    if (assetType === 'livestock' && !form.livestockType) { showToast('Please select a livestock type', 'error'); return }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 2000))

    const selectedCoop = cooperatives.find(c => c.id === form.cooperativeId)
    const newFarm = {
      id: `farm-${Date.now()}`,
      name: form.name,
      cropType: assetType === 'crop' ? form.cropType : undefined,
      livestockType: assetType === 'livestock' ? form.livestockType : undefined,
      description: form.description,
      location: form.location,
      fundingGoal: parseFloat(form.fundingGoal),
      currentFunding: 0,
      expectedYield: form.expectedYield,
      expectedReturn: parseFloat(form.expectedReturn) || 15,
      riskLevel: form.riskLevel,
      duration: parseInt(form.duration),
      harvestSchedule: form.harvestSchedule,
      status: 'PENDING' as const,
      farmerWallet: address,
      cooperativeId: form.cooperativeEnabled ? form.cooperativeId : undefined,
      cooperative: form.cooperativeEnabled ? selectedCoop : undefined,
      cooperativeEnabled: form.cooperativeEnabled && !!form.cooperativeId,
      weatherRisk: 'MODERATE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { investments: 0 },
    }

    addFarm(newFarm)
    setSubmitting(false)
    setSubmitted(true)
    showToast('Farm created and submitted for review!', 'success')
  }

  if (submitted) {
    return (
      <div className="page-with-nav app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div className="animate-scale-in" style={{
          width: 80, height: 80,
          background: 'rgba(34,197,94,0.1)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <CheckCircle size={44} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Farm Submitted! 🌾</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', maxWidth: 280 }}>
          Your farm has been submitted for review. Once approved, it will be live on the marketplace.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 280 }}>
          <Link href="/farms" className="btn btn-primary btn-full" id="create-farm-view-marketplace">
            <Sprout size={18} /> View Marketplace
          </Link>
          <Link href="/dashboard" className="btn btn-ghost btn-full" id="create-farm-go-dashboard">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-with-nav">
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: 'var(--color-surface)',
        zIndex: 50, padding: '0.875rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <Link href="/farms" style={{ color: 'var(--color-text)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>Create Farm Listing</h1>
      </div>

      <div className="app-container" style={{ paddingTop: '1.25rem' }}>
        <form onSubmit={handleSubmit} id="create-farm-form">
          {/* Asset type selector */}
          <div style={{ marginBottom: '1.5rem' }} className="animate-fade-in-up">
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>What are you farming?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(['crop', 'livestock'] as AssetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  id={`asset-type-${type}`}
                  onClick={() => setAssetType(type)}
                  style={{
                    padding: '1.25rem',
                    background: assetType === type ? 'rgba(27,67,50,0.08)' : 'var(--color-card)',
                    border: `2px solid ${assetType === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  aria-pressed={assetType === type}
                >
                  <span style={{ fontSize: '2rem' }}>{type === 'crop' ? '🌱' : '🐄'}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: assetType === type ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {type === 'crop' ? 'Crop Farming' : 'Livestock'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="animate-fade-in-up delay-100">
            <div className="form-group">
              <label className="form-label" htmlFor="farm-name">Farm Name *</label>
              <input
                id="farm-name"
                type="text"
                className="form-input"
                placeholder="e.g., Verde Rice Farm"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={assetType === 'crop' ? 'crop-type' : 'livestock-type'}>
                {assetType === 'crop' ? 'Crop Type *' : 'Livestock Type *'}
              </label>
              <select
                id={assetType === 'crop' ? 'crop-type' : 'livestock-type'}
                className="form-select"
                value={assetType === 'crop' ? form.cropType : form.livestockType}
                onChange={e => handleChange(assetType === 'crop' ? 'cropType' : 'livestockType', e.target.value)}
                required
              >
                <option value="">Select {assetType === 'crop' ? 'crop' : 'livestock'} type...</option>
                {(assetType === 'crop' ? CROP_TYPES : LIVESTOCK_TYPES).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="farm-location">Location (Barangay, Municipality)</label>
              <input
                id="farm-location"
                type="text"
                className="form-input"
                placeholder="e.g., Sta. Rosa, Laguna"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="farm-description">Description</label>
              <textarea
                id="farm-description"
                className="form-textarea"
                placeholder="Describe your farm, farming methods, and what makes it special..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Financial Info */}
          <div className="animate-fade-in-up delay-150" style={{ marginBottom: '0.5rem' }}>
            <h3 className="section-title">💰 Financial Details</h3>
          </div>

          <div className="animate-fade-in-up delay-150">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="funding-goal">Funding Goal (USDC) *</label>
                <input
                  id="funding-goal"
                  type="number"
                  className="form-input"
                  placeholder="Min 100"
                  min={100}
                  value={form.fundingGoal}
                  onChange={e => handleChange('fundingGoal', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="expected-return">Expected Return (%)</label>
                <input
                  id="expected-return"
                  type="number"
                  className="form-input"
                  placeholder="e.g., 20"
                  min={1}
                  max={100}
                  value={form.expectedReturn}
                  onChange={e => handleChange('expectedReturn', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="farm-duration">Duration (Days)</label>
                <select
                  id="farm-duration"
                  className="form-select"
                  value={form.duration}
                  onChange={e => handleChange('duration', e.target.value)}
                >
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="120">120 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="risk-level">Risk Level</label>
                <select
                  id="risk-level"
                  className="form-select"
                  value={form.riskLevel}
                  onChange={e => handleChange('riskLevel', e.target.value as RiskLevel)}
                >
                  <option value="LOW">🟢 Low Risk</option>
                  <option value="MEDIUM">🟡 Medium Risk</option>
                  <option value="HIGH">🔴 High Risk</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expected-yield">Expected Yield</label>
              <input
                id="expected-yield"
                type="text"
                className="form-input"
                placeholder="e.g., 5 metric tons"
                value={form.expectedYield}
                onChange={e => handleChange('expectedYield', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="harvest-schedule">Harvest Schedule</label>
              <input
                id="harvest-schedule"
                type="text"
                className="form-input"
                placeholder="e.g., August–September 2025"
                value={form.harvestSchedule}
                onChange={e => handleChange('harvestSchedule', e.target.value)}
              />
            </div>
          </div>

          {/* Cooperative Selection */}
          <div className="animate-fade-in-up delay-200">
            <h3 className="section-title" style={{ marginTop: '0.5rem' }}>🤝 Cooperative Support</h3>
            <div className="gapas-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{
                background: 'rgba(249,173,0,0.08)',
                border: '1px solid rgba(249,173,0,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.625rem',
              }}>
                <Info size={16} color="#a67c00" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ fontSize: '0.8125rem', color: '#a67c00', lineHeight: 1.55 }}>
                  Selecting a cooperative gives you onboarding support and farm verification. The cooperative earns 1% of your farm profit. <strong>You keep 69%</strong> (vs. 70% without coop).
                </p>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input
                  id="coop-enabled-toggle"
                  type="checkbox"
                  checked={form.cooperativeEnabled}
                  onChange={e => handleChange('cooperativeEnabled', e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                  I want cooperative assistance
                </span>
              </label>

              {form.cooperativeEnabled && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="cooperative-select">Select Cooperative</label>
                  <select
                    id="cooperative-select"
                    className="form-select"
                    value={form.cooperativeId}
                    onChange={e => handleChange('cooperativeId', e.target.value)}
                  >
                    <option value="">Choose a cooperative...</option>
                    {MOCK_COOPERATIVES.filter(c => c.verifiedStatus).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.barangay}, {c.municipality}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="animate-fade-in-up delay-300" style={{ marginBottom: '1rem' }}>
            <button
              id="submit-farm-btn"
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-full btn-lg"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Submitting to Blockchain...
                </>
              ) : (
                <>
                  <Sprout size={20} />
                  Submit Farm for Funding
                </>
              )}
            </button>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.625rem' }}>
              Farm will be reviewed before appearing on marketplace
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

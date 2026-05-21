'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { MOCK_COOPERATIVES } from '@/lib/mockData'
import type { RiskLevel } from '@/lib/types'
import { Sprout, Loader2, CheckCircle, ArrowLeft, Info, Activity, Wrench, Trees, AlertTriangle, Users, MapPin, ClipboardList, Compass, Check } from 'lucide-react'
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

const BENGUET_BARANGAYS = [
  { name: 'Atok', lat: 16.5779, lng: 120.7013, x: 250, y: 110, alt: 'Highland Vegetable Farming' },
  { name: 'Kibungan', lat: 16.6974, lng: 120.6728, x: 210, y: 80, alt: 'Terraced Rice and Root Crops' },
  { name: 'Bakun', lat: 16.7909, lng: 120.6775, x: 190, y: 45, alt: 'High-Altitude Agroforestry' },
  { name: 'Kabayan', lat: 16.6186, lng: 120.8354, x: 340, y: 120, alt: 'Traditional Rice Terraces' },
  { name: 'Tublay', lat: 16.4855, lng: 120.6272, x: 180, y: 160, alt: 'Organic Farming Valley' },
  { name: 'Itogon', lat: 16.3683, lng: 120.6775, x: 240, y: 220, alt: 'Mountain Coffee Highlands' },
  { name: 'Buguias', lat: 16.8286, lng: 120.8294, x: 330, y: 60, alt: 'Highland Crops and Cutflowers' },
  { name: 'Mankayan', lat: 16.8578, lng: 120.7850, x: 280, y: 35, alt: 'Agroforestry and Mining Slopes' },
  { name: 'Sablan', lat: 16.4384, lng: 120.5186, x: 120, y: 180, alt: 'Tropical Fruits and Banana Farms' }
]

type AssetType = 'CROP' | 'LIVESTOCK' | 'EQUIPMENT' | 'CARBON'

export default function CreateFarmPage() {
  const { 
    address, 
    isConnected, 
    addFarm, 
    showToast, 
    cooperatives, 
    setCooperatives, 
    farmBarangay,
    setFarmBarangay,
    farmCoordinates,
    setFarmCoordinates,
    generateTicket
  } = useGapasStore()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [assetType, setAssetType] = useState<AssetType>('CROP')
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    cropType: '',
    livestockType: '',
    description: '',
    location: farmBarangay ? `Barangay ${farmBarangay}, Benguet Province` : 'Barangay Atok, Benguet Province',
    fundingGoal: '',
    expectedYield: '',
    expectedReturn: '',
    riskLevel: 'MEDIUM' as RiskLevel,
    duration: '90',
    harvestSchedule: '',
    cooperativeId: '',
    cooperativeEnabled: false,
    eqModel: '',
    eqPurchased: '2025-01-01',
    eqNextMaint: '2026-06-01',
    eqCondition: 'GOOD' as 'NEW' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR',
    carbonUnits: '',
  })

  useEffect(() => {
    setCooperatives(MOCK_COOPERATIVES)
    if (farmBarangay) {
      setForm(prev => ({ ...prev, location: prev.location || `Barangay ${farmBarangay}` }))
    }
  }, [isConnected, router, setCooperatives, farmBarangay])

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
    if (assetType === 'CROP' && !form.cropType) { showToast('Please select a crop type', 'error'); return }
    if (assetType === 'LIVESTOCK' && !form.livestockType) { showToast('Please select a livestock type', 'error'); return }
    if (assetType === 'EQUIPMENT' && !form.eqModel) { showToast('Please enter an equipment model', 'error'); return }
    if (assetType === 'CARBON' && !form.carbonUnits) { showToast('Please enter carbon offset units', 'error'); return }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 2000))

    const cooperativeEnabled = false
    const cooperativeId = undefined
    const selectedCoop = undefined

    const typeLabel = assetType.substring(0, 4)
    const tokenId = `${typeLabel}-${Math.floor(1000 + Math.random() * 9000)}`
    const valPhp = Math.round(parseFloat(form.fundingGoal) * 57.43)
    const newFarm = {
      id: `farm-${Date.now()}`,
      tokenId,
      assetType,
      name: form.name,
      cropType: assetType === 'CROP' ? form.cropType : undefined,
      livestockType: assetType === 'LIVESTOCK' ? form.livestockType : undefined,
      description: form.description,
      location: form.location,
      fundingGoal: parseFloat(form.fundingGoal),
      currentFunding: 0,
      expectedYield: assetType === 'CARBON' ? `${form.carbonUnits} tCO2 Offset` : form.expectedYield,
      expectedReturn: parseFloat(form.expectedReturn) || 15,
      riskLevel: assetType === 'CARBON' ? 'LOW' as const : assetType === 'EQUIPMENT' ? 'LOW' as const : form.riskLevel,
      duration: assetType === 'EQUIPMENT' ? 365 : parseInt(form.duration),
      harvestSchedule: assetType === 'EQUIPMENT' ? 'Continuous Operation' : form.harvestSchedule,
      status: 'PENDING' as const,
      farmerWallet: address,
      cooperativeId: cooperativeEnabled ? cooperativeId : undefined,
      cooperative: cooperativeEnabled ? selectedCoop : undefined,
      cooperativeEnabled: cooperativeEnabled,
      weatherRisk: 'LOW' as const,
      quantity: assetType === 'LIVESTOCK' ? 10 : assetType === 'CARBON' ? parseFloat(form.carbonUnits) : undefined,
      unit: assetType === 'LIVESTOCK' ? 'heads' : assetType === 'CARBON' ? 'tCO2' : 'tons',
      valuePhp: valPhp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { investments: 0 },
      equipmentDetails: assetType === 'EQUIPMENT' ? {
        model: form.eqModel,
        purchased: form.eqPurchased,
        nextMaint: form.eqNextMaint,
        condition: form.eqCondition,
      } : null
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
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Farm Submitted!</h2>
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
      <div className="sticky-back-header">
        <Link href="/farms" style={{ color: 'var(--color-text)', display: 'flex' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 700 }}>Create Farm Listing</h1>
      </div>

      <div className="app-container" style={{ paddingTop: '1.25rem' }}>
        <form onSubmit={handleSubmit} id="create-farm-form">
          {/* Asset type selector */}
          <div style={{ marginBottom: '1.5rem' }} className="animate-fade-in-up">
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>Select Asset Type to Tokenize *</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
              {(['CROP', 'LIVESTOCK', 'EQUIPMENT', 'CARBON'] as AssetType[]).map((type) => {
                const getIcon = (t: AssetType) => {
                  switch (t) {
                    case 'CROP': return <Sprout size={24} style={{ color: 'var(--color-primary)' }} />
                    case 'LIVESTOCK': return <Activity size={24} style={{ color: 'var(--color-primary)' }} />
                    case 'EQUIPMENT': return <Wrench size={24} style={{ color: 'var(--color-primary)' }} />
                    case 'CARBON': return <Trees size={24} style={{ color: 'var(--color-primary)' }} />
                  }
                }
                const getLabel = (t: AssetType) => {
                  switch (t) {
                    case 'CROP': return 'Crop'
                    case 'LIVESTOCK': return 'Livestock'
                    case 'EQUIPMENT': return 'Equipment'
                    case 'CARBON': return 'Carbon'
                  }
                }
                return (
                  <button
                    key={type}
                    type="button"
                    id={`asset-type-${type.toLowerCase()}`}
                    onClick={() => setAssetType(type)}
                    style={{
                      padding: '1rem 0.5rem',
                      background: assetType === type ? 'rgba(27,67,50,0.08)' : 'var(--color-card)',
                      border: `2px solid ${assetType === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                    aria-pressed={assetType === type}
                  >
                    <span style={{ display: 'inline-flex' }}>{getIcon(type)}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: assetType === type ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {getLabel(type)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="animate-fade-in-up delay-100">
            <div className="form-group">
              <label className="form-label" htmlFor="farm-name">Asset Listing Name *</label>
              <input
                id="farm-name"
                type="text"
                className="form-input"
                placeholder={
                  assetType === 'CROP' ? 'e.g., Verde Rice Farm' :
                  assetType === 'LIVESTOCK' ? 'e.g., Sta. Rosa Native Hog Farm' :
                  assetType === 'EQUIPMENT' ? 'e.g., Kubota Harvester Leasing' :
                  'e.g., Laguna Agroforestry Carbon Offset'
                }
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            {(assetType === 'CROP' || assetType === 'LIVESTOCK') && (
              <div className="form-group">
                <label className="form-label" htmlFor={assetType === 'CROP' ? 'crop-type' : 'livestock-type'}>
                  {assetType === 'CROP' ? 'Crop Type *' : 'Livestock Type *'}
                </label>
                <input
                  id={assetType === 'CROP' ? 'crop-type' : 'livestock-type'}
                  list={assetType === 'CROP' ? 'crop-options' : 'livestock-options'}
                  className="form-input"
                  placeholder={assetType === 'CROP' ? 'Type or select crop type...' : 'Type or select livestock type...'}
                  value={assetType === 'CROP' ? form.cropType : form.livestockType}
                  onChange={e => handleChange(assetType === 'CROP' ? 'cropType' : 'livestockType', e.target.value)}
                  required
                />
                <datalist id="crop-options">
                  {CROP_TYPES.map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <datalist id="livestock-options">
                  {LIVESTOCK_TYPES.map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            )}

            {assetType === 'EQUIPMENT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-2)', marginBottom: '1rem' }} className="animate-fade-in-up">
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                  Heavy Machinery Specification
                </h4>
                <div className="form-group">
                  <label className="form-label" htmlFor="eq-model">Model / Make *</label>
                  <input
                    id="eq-model"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Kubota L5018 Tractor"
                    value={form.eqModel}
                    onChange={e => handleChange('eqModel', e.target.value)}
                    required
                  />
                </div>
                <div className="grid-responsive-2" style={{ gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="eq-purchased">Purchased Date</label>
                    <input
                      id="eq-purchased"
                      type="date"
                      className="form-input"
                      value={form.eqPurchased}
                      onChange={e => handleChange('eqPurchased', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="eq-next-maint">Next Maintenance Date</label>
                    <input
                      id="eq-next-maint"
                      type="date"
                      className="form-input"
                      value={form.eqNextMaint}
                      onChange={e => handleChange('eqNextMaint', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="eq-condition">Physical Condition</label>
                  <select
                    id="eq-condition"
                    className="form-select"
                    value={form.eqCondition}
                    onChange={e => handleChange('eqCondition', e.target.value)}
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good Condition</option>
                    <option value="FAIR">Fair Condition</option>
                    <option value="NEEDS_REPAIR">Needs Repair</option>
                  </select>
                </div>
              </div>
            )}

            {assetType === 'CARBON' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-2)', marginBottom: '1rem' }} className="animate-fade-in-up">
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                  Carbon Credit Certification
                </h4>
                <div className="form-group">
                  <label className="form-label" htmlFor="carbon-units">Carbon Credit Offset Units (tons metric tCO2) *</label>
                  <input
                    id="carbon-units"
                    type="number"
                    className="form-input"
                    placeholder="e.g., 250"
                    min={1}
                    value={form.carbonUnits}
                    onChange={e => handleChange('carbonUnits', e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    1 tCO2 offset represents a verified reduction of 1 metric ton of carbon dioxide emissions.
                  </span>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={18} color="var(--color-primary)" />
                Interactive Asset Geolocation (Internal Geocoding Map) *
              </label>
              <div className="gapas-card animate-fade-in-up" style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                  Click a farming barangay on the Benguet Province highland map below to drop your coordinates pin internally.
                </p>

                {/* SVG Topographic Interactive Map */}
                <div style={{ position: 'relative', width: '100%', height: '240px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <svg viewBox="0 0 400 240" width="100%" height="100%" style={{ cursor: 'pointer' }}>
                    {/* Topographic grid background lines */}
                    <path d="M 0,40 Q 200,20 400,40 M 0,80 Q 150,110 400,80 M 0,120 Q 250,90 400,120 M 0,160 Q 200,180 400,160 M 0,200 Q 150,190 400,200" fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeOpacity="0.5" />
                    <line x1="50" y1="0" x2="50" y2="240" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.3" />
                    <line x1="150" y1="0" x2="150" y2="240" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.3" />
                    <line x1="250" y1="0" x2="250" y2="240" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.3" />
                    <line x1="350" y1="0" x2="350" y2="240" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.3" />

                    {/* Mountain range stylized contour boundaries */}
                    <path d="M 50,240 L 100,170 L 150,210 L 220,130 L 280,180 L 330,120 L 400,190 L 400,240 Z" fill="rgba(27,67,50,0.03)" stroke="var(--color-border)" strokeWidth="1" strokeOpacity="0.4" />
                    <path d="M 120,45 A 35,35 0 0,0 160,80 A 45,45 0 0,0 210,120" fill="none" stroke="var(--color-primary-xlight)" strokeWidth="0.75" strokeOpacity="0.3" />

                    {/* Compass Rose */}
                    <g transform="translate(40, 40)" opacity="0.3">
                      <circle cx="0" cy="0" r="14" fill="none" stroke="var(--color-text-muted)" strokeWidth="1" />
                      <line x1="0" y1="-18" x2="0" y2="18" stroke="var(--color-text-muted)" strokeWidth="1" />
                      <line x1="-18" y1="0" x2="18" y2="0" stroke="var(--color-text-muted)" strokeWidth="1" />
                      <polygon points="0,-18 -3,-3 0,0" fill="var(--color-primary)" />
                      <polygon points="0,18 3,3 0,0" fill="var(--color-text-muted)" />
                      <text x="-3" y="-21" fill="var(--color-text-muted)" fontSize="7" fontWeight="bold">N</text>
                    </g>

                    {/* Barangay Dots */}
                    {BENGUET_BARANGAYS.map((b) => {
                      const isSelected = farmBarangay === b.name
                      return (
                        <g 
                          key={b.name} 
                          transform={`translate(${b.x}, ${b.y})`} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            handleChange('location', `Barangay ${b.name}, Benguet Province`)
                            setFarmBarangay(b.name)
                            setFarmCoordinates({ lat: b.lat, lng: b.lng })
                            showToast(`Coordinate locked: Barangay ${b.name} (${b.lat.toFixed(4)} N, ${b.lng.toFixed(4)} E)`, 'success')
                          }}
                        >
                          {/* Pulsing ring if selected */}
                          {isSelected && (
                            <circle cx="0" cy="0" r="10" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" style={{ transformOrigin: 'center' }}>
                              <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="stroke-opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          {/* Inner dot */}
                          <circle cx="0" cy="0" r={isSelected ? 5 : 3.5} fill={isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)'} stroke="var(--color-card)" strokeWidth="1" />
                          {/* Label text */}
                          <text x="7" y="3" fill={isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)'} fontSize={isSelected ? 8.5 : 7.5} fontWeight={isSelected ? 'bold' : 'normal'}>
                            {b.name}
                          </text>
                        </g>
                      )
                    })}

                    {/* Active Pin drop graphic overlay */}
                    {(() => {
                      const activeNode = BENGUET_BARANGAYS.find(b => b.name === farmBarangay) || BENGUET_BARANGAYS[0]
                      return (
                        <g transform={`translate(${activeNode.x}, ${activeNode.y - 12})`} style={{ pointerEvents: 'none' }}>
                          <path d="M 0,0 C -4,-12 -8,-12 -8,-18 A 8,8 0 0,1 8,-18 C 8,-12 4,-12 0,0 Z" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                          <circle cx="0" cy="-18" r="3" fill="#fff" />
                        </g>
                      )
                    })()}
                  </svg>
                </div>

                {/* Coordinates & Location feedback box */}
                <div className="grid-responsive-1-5-1-1" style={{ gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Resolved Location</label>
                    <input type="text" className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--color-surface-2)' }} value={form.location} readOnly />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Latitude (N)</label>
                    <input type="text" className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--color-surface-2)', fontFamily: 'monospace' }} value={farmCoordinates?.lat?.toFixed(4) || '16.5779'} readOnly />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Longitude (E)</label>
                    <input type="text" className="form-input" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--color-surface-2)', fontFamily: 'monospace' }} value={farmCoordinates?.lng?.toFixed(4) || '120.7013'} readOnly />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.625rem', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 600 }}>
                  <Compass size={12} className="spinner" style={{ animationDuration: '6s' }} />
                  Coordinates securely synchronized to parametric disaster oracle registry.
                </div>
              </div>
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
            <h3 className="section-title">Financial Details</h3>
          </div>

          <div className="animate-fade-in-up delay-150">
            <div className="grid-responsive-2" style={{ gap: '0.75rem' }}>
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

            <div className="grid-responsive-2" style={{ gap: '0.75rem' }}>
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
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
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

          {/* Cooperative Vetting Support */}
          <div className="animate-fade-in-up delay-200">
            <h3 className="section-title" style={{ marginTop: '0.5rem' }}>Cooperative Vetting Support</h3>
            <div className="gapas-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{
                background: 'rgba(27,67,50,0.04)',
                border: '1px solid rgba(27,67,50,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.625rem',
              }}>
                <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  To list your farm and tokenize assets on Stellar Mainnet, a physical or telemetry verification is required by a partner cooperative. If you need assistance, submit a vetting ticket below.
                </p>
              </div>

              {createdTicketId ? (
                <div style={{
                  background: 'rgba(34,197,94,0.05)',
                  border: '1px solid #22c55e',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} color="#22c55e" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Active Support Ticket: {createdTicketId}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Verification Help Ticket {createdTicketId} is active! A Cooperative inspector will be assigned to assist you with the onboarding process.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Request cooperative alignment for fast-tracked telemetry or physical inspection.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const tId = generateTicket()
                      setCreatedTicketId(tId)
                      showToast(`Help ticket ${tId} generated successfully!`, 'success')
                    }}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}
                  >
                    <Users size={16} />
                    Ask for Help (Submit Vetting Ticket)
                  </button>
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

'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import {
  CloudSun, CloudRain, Wind, AlertTriangle, ShieldAlert, CheckCircle,
  RefreshCw, Radio, ExternalLink, Activity, Info
} from 'lucide-react'
import { formatUSDC, formatPHP, USDC_TO_PHP_RATE } from '@/lib/types'

interface RegionState {
  name: string
  province: string
  coords: string
  temp: string
  windSpeed: string
  condition: string
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH'
}

export default function AnalyticsPage() {
  const {
    address,
    activeRole,
    farms,
    balances,
    updateBalances,
    addTransaction,
    addReceipt,
    showToast
  } = useGapasStore()

  const [loading, setLoading] = useState(false)

  // Weather States for Luzon, Visayas, Mindanao
  const [regions, setRegions] = useState<RegionState[]>([
    {
      name: 'Luzon',
      province: 'Sta. Rosa, Laguna',
      coords: '14.3122° N, 121.1114° E',
      temp: '29°C',
      windSpeed: '12 km/h',
      condition: 'Partly Cloudy',
      riskLevel: 'LOW'
    },
    {
      name: 'Visayas',
      province: 'Valencia, Bohol',
      coords: '9.7022° N, 124.1681° E',
      temp: '31°C',
      windSpeed: '18 km/h',
      condition: 'Scattered Showers',
      riskLevel: 'MODERATE'
    },
    {
      name: 'Mindanao',
      province: 'Davao City, Davao',
      coords: '7.0731° N, 125.6110° E',
      temp: '27°C',
      windSpeed: '45 km/h',
      condition: 'Heavy Typhoon Rain',
      riskLevel: 'HIGH'
    }
  ])

  // Trigger simulated regional weather risk change
  const handleTriggerRisk = async (regionIndex: number, newRisk: 'LOW' | 'MODERATE' | 'HIGH') => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)

    const updatedRegions = [...regions]
    const targetRegion = updatedRegions[regionIndex]
    const oldRisk = targetRegion.riskLevel
    targetRegion.riskLevel = newRisk

    // Set custom text parameters depending on risk level
    if (newRisk === 'HIGH') {
      targetRegion.temp = '24°C'
      targetRegion.windSpeed = '145 km/h'
      targetRegion.condition = 'Typhoon Category 3'
    } else if (newRisk === 'LOW') {
      targetRegion.temp = '32°C'
      targetRegion.windSpeed = '8 km/h'
      targetRegion.condition = 'Sunny Weather'
    } else {
      targetRegion.temp = '30°C'
      targetRegion.windSpeed = '22 km/h'
      targetRegion.condition = 'Cloudy / Intermittent Rain'
    }

    setRegions(updatedRegions)

    // Soroban Insurance Payout conditions:
    // If transition is to HIGH RISK, trigger automated crop insurance clauses on-chain!
    if (newRisk === 'HIGH' && oldRisk !== 'HIGH') {
      showToast(`⚠️ Automated Soroban Weather Oracle Alert: ${targetRegion.name} under Typhoon Emergency!`, 'error')
      
      // Calculate eligible farms in this region
      // Let's match by location matching the province name
      const regionProvinceBase = targetRegion.province.split(',').pop()?.trim() || ''
      const matchingFarms = farms.filter(f => f.location?.toLowerCase().includes(regionProvinceBase.toLowerCase()) || f.location?.toLowerCase().includes(targetRegion.name.toLowerCase()))

      if (matchingFarms.length > 0) {
        // Trigger claim payouts!
        // Simulated: 200 USDC auto-payout per registered farm in that region
        const payoutPerFarm = 200
        const totalPayout = matchingFarms.length * payoutPerFarm

        // Credit USDC to farmer/user's wallet balance
        updateBalances({ usdc: balances.usdc + totalPayout })

        // Generate Transaction Hash & Receipts
        const txHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

        // Log transaction in history
        addTransaction({
          id: `INS-${Math.floor(10000 + Math.random() * 90000)}`,
          txHash,
          type: 'RETURN',
          amount: totalPayout,
          memo: `Soroban Smart Contract Auto-Payout: Typhoon Insurance (${targetRegion.name})`,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString()
        })

        // Log W3C Receipt
        addReceipt({
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          txHash,
          type: 'INSURANCE',
          fromDid: 'did:stellar:GAPAS:SorobanWeatherInsuranceContract',
          toDid: `did:stellar:GAPAS:${address || 'GAX_MOCK_USER_7F8E9D2C3B4A5'}`,
          amountUsdc: totalPayout,
          amountPhp: totalPayout * USDC_TO_PHP_RATE,
          exchangeRate: USDC_TO_PHP_RATE,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString()
        })

        showToast(`💰 Soroban Smart Contract distributed ${formatUSDC(totalPayout)} USDC auto-payout to your wallet!`, 'success')
      } else {
        showToast(`No registered farms found in ${targetRegion.name} region to trigger payouts.`, 'info')
      }
    } else {
      showToast(`Weather updated for ${targetRegion.name}. Status is stable.`, 'success')
    }
  }

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">📡 Weather Risk Oracle</h1>
        <p className="page-subtitle">PAGASA Meteorological Feeds & Soroban Smart Insurance</p>
      </div>

      {/* Satellite Connectivity Panel */}
      <div className="gapas-card animate-fade-in-up delay-100" style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        background: 'rgba(27,67,50,0.03)',
        border: '1.5px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex' }}>
            <span style={{
              width: 12, height: 12,
              background: '#10b981',
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            <span style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 12, height: 12,
              background: '#10b981',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'ping 1.5s infinite'
            }} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Radio size={14} color="var(--color-primary)" />
              Oracles Status: ACTIVE
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              Stellar Soroban weather-feed consensus anchored via PAGASA public gateways.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
          <Activity size={14} />
          Sync Interval: 12s
        </div>
      </div>

      {/* Region risk monitor blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }} className="animate-fade-in-up delay-150">
        {regions.map((region, index) => {
          const isHigh = region.riskLevel === 'HIGH'
          const isMod = region.riskLevel === 'MODERATE'
          
          return (
            <div
              key={region.name}
              className="gapas-card"
              style={{
                padding: '1.25rem',
                border: isHigh ? '1.5px solid #ef4444' : isMod ? '1.5px solid #f59e0b' : '1.5px solid #10b981',
                background: isHigh ? 'rgba(239,68,68,0.02)' : isMod ? 'rgba(245,158,11,0.02)' : 'rgba(16,185,129,0.02)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.15rem' }}>
                    {region.name} Region
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                    Core Province: <strong>{region.province}</strong> · <span style={{ fontFamily: 'monospace' }}>{region.coords}</span>
                  </p>

                  {/* Weather Stats grid */}
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Temp</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{region.temp}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Wind Force</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{region.windSpeed}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Condition</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {region.riskLevel === 'HIGH' ? <CloudRain size={14} color="#ef4444" /> : <CloudSun size={14} color="var(--color-primary)" />}
                        {region.condition}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${
                    isHigh ? 'badge-danger' : isMod ? 'badge-warning' : 'badge-success'
                  }`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                    {region.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Automatic Soroban Insurance Warning banner */}
              {isHigh && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.8rem',
                  marginTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  border: '1px dashed rgba(239,68,68,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <ShieldAlert size={16} />
                  <span>
                    <strong>Soroban Smart Payout clause triggered:</strong> Typhoon sustained alerts will automatically distribute crop losses settlement to matching registered farms.
                  </span>
                </div>
              )}

              {/* Oracle risk overrides simulator controller */}
              <div style={{
                marginTop: '1rem',
                borderTop: '1px dashed var(--color-border)',
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
                zIndex: 1
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Simulate Oracle override:</span>
                <div style={{ display: 'flex', gap: '0.3rem', marginLeft: 'auto' }}>
                  {(['LOW', 'MODERATE', 'HIGH'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleTriggerRisk(index, lvl)}
                      disabled={loading}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: region.riskLevel === lvl ? 'var(--color-primary-dark)' : 'var(--color-card)',
                        color: region.riskLevel === lvl ? '#fff' : 'var(--color-text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Insurance info summary card */}
      <div className="gapas-card animate-fade-in-up delay-200" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Info size={16} color="var(--color-primary)" />
          Soroban Weather Insurance Specs
        </h3>
        <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.6 }}>
          <li>Consensus feeds are queried every hour from PAGASA satellite databases.</li>
          <li>A sustained windspeed anomaly exceeding <strong>120 km/h</strong> triggers absolute storm conditions.</li>
          <li>Participating crops registered via verification cooperatives receive an absolute <strong>200 USDC</strong> partial payout automatically.</li>
          <li>All claims settlement contracts are fully transparent and accessible via the explorer links.</li>
        </ul>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import { formatUSDC, getFundingProgress, getProfitDistribution, formatPHP, USDC_TO_PHP_RATE } from '@/lib/types'
import { MOCK_INVESTMENTS, MOCK_FARMS } from '@/lib/mockData'
import { TrendingUp, Sprout, RefreshCw, BarChart3, FileText, Eye, Receipt, X } from 'lucide-react'
import Link from 'next/link'

export default function ActivitiesPage() {
  const { isConnected, myInvestments, setMyInvestments, farms, setFarms, address, myTransactions } = useGapasStore()
  const router = useRouter()
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null)
  const [showContractModal, setShowContractModal] = useState<string | null>(null)
  const [showAssetModal, setShowAssetModal] = useState<string | null>(null)

  useEffect(() => {
    if (myInvestments.length === 0) setMyInvestments(MOCK_INVESTMENTS)
    if (farms.length === 0) setFarms(MOCK_FARMS)
  }, [isConnected, myInvestments.length, setMyInvestments, farms.length, setFarms])

  // My registered assets (farms where farmerWallet === address)
  const myAssets = farms.filter(f => f.farmerWallet === address)
  // All other farms from mock for demo purposes
  const displayAssets = myAssets.length > 0 ? myAssets : farms.slice(0, 4)

  const selectedReceiptInv = myInvestments.find(i => i.id === showReceiptModal)
  const selectedContractInv = myInvestments.find(i => i.id === showContractModal)
  const selectedAssetFarm = farms.find(f => f.id === showAssetModal)

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title">My Activities</h1>
        <p className="page-subtitle">Your assets and investment tracker</p>
      </div>

      {/* My Assets Section */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>My Assets ({displayAssets.length})</h2>
          <Link href="/farms?filter=MY_ASSETS" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        {displayAssets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
            <span style={{ fontSize: '3rem' }}>🌱</span>
            <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No registered assets yet</p>
            <Link href="/cooperative" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', textDecoration: 'none' }}>
              Register My Assets
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {displayAssets.map((farm, i) => {
              const progress = getFundingProgress(farm.currentFunding, farm.fundingGoal)
              return (
                <div
                  key={farm.id}
                  className="gapas-card animate-fade-in-up"
                  style={{ padding: '1rem', animationDelay: `${i * 60}ms`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{
                      height: 60,
                      background: 'linear-gradient(135deg, #1B4332, #40916c)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <Sprout size={24} color="rgba(255,255,255,0.9)" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      {farm.tokenId && (
                        <span style={{
                          fontSize: '0.6rem',
                          backgroundColor: 'var(--color-primary-light)',
                          color: '#fff',
                          padding: '0.1rem 0.3rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          {farm.tokenId}
                        </span>
                      )}
                      <span className={`badge ${farm.status === 'ACTIVE' ? 'badge-info' : farm.status === 'FUNDED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.55rem' }}>
                        {farm.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                      {farm.name}
                    </h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      {farm.cropType || farm.livestockType || farm.assetType} · {farm.location}
                    </p>
                    <div className="progress-bar-container" style={{ height: 4, marginBottom: '0.25rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600 }}>{progress}% Funded</p>
                  </div>
                  <button
                    onClick={() => setShowAssetModal(farm.id)}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={12} /> View Asset
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* My Investments Section */}
      <div className="animate-fade-in-up delay-150">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>My Investments ({myInvestments.length})</h2>
          <Link href="/farms" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Browse Palengke →
          </Link>
        </div>
        {myInvestments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <span style={{ fontSize: '3rem' }}>🌱</span>
            <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>No investments yet</p>
            <Link href="/farms" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', textDecoration: 'none' }}>
              Browse Farms
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {myInvestments.map((inv, i) => {
              const farm = inv.farm
              const roi = farm?.expectedReturn || 0
              const expectedReturn = inv.amount * (1 + roi / 100)
              const progress = farm ? getFundingProgress(farm.currentFunding, farm.fundingGoal) : 0
              // Investor's ownership percentage of the fund
              const ownershipPct = farm ? ((inv.amount / farm.fundingGoal) * 100).toFixed(1) : '0'

              return (
                <div
                  key={inv.id}
                  className="gapas-card animate-fade-in-up"
                  style={{ padding: '1rem', animationDelay: `${i * 60}ms`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{
                      height: 60,
                      background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <TrendingUp size={24} color="rgba(255,255,255,0.9)" />
                    </div>
                    <span className={`badge ${inv.returnAmount ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.55rem', marginBottom: '0.35rem', display: 'inline-block' }}>
                      {inv.returnAmount ? 'COMPLETED' : 'ACTIVE'}
                    </span>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                      {farm?.name || 'Unknown Farm'}
                    </h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      {farm?.cropType || farm?.livestockType || 'Farm'} · {farm?.location}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Invested</span>
                        <strong style={{ color: 'var(--color-text)' }}>{formatUSDC(inv.amount)} USDC</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Ownership</span>
                        <strong style={{ color: 'var(--color-primary)' }}>{ownershipPct}% of fund</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Est. Return</span>
                        <strong style={{ color: '#16a34a' }}>+{roi}%</strong>
                      </div>
                    </div>

                    {farm && (
                      <>
                        <div className="progress-bar-container" style={{ height: 4, marginBottom: '0.25rem' }}>
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600 }}>{progress}% Farm Funded</p>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => setShowAssetModal(farm?.id || '')}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                    >
                      <Eye size={11} /> View Asset
                    </button>
                    <button
                      onClick={() => setShowReceiptModal(inv.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', border: '1px solid var(--color-border)' }}
                    >
                      <Receipt size={11} /> Receipts
                    </button>
                  </div>
                  <button
                    onClick={() => setShowContractModal(inv.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '0.35rem', width: '100%', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    <FileText size={11} /> View Contract
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ASSET DETAIL MODAL */}
      {showAssetModal && selectedAssetFarm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gapas-card animate-scale-up" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowAssetModal(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
            <div style={{
              height: 80,
              background: 'linear-gradient(135deg, #1B4332, #40916c)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Sprout size={32} color="rgba(255,255,255,0.9)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{selectedAssetFarm.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              {selectedAssetFarm.cropType || selectedAssetFarm.livestockType || selectedAssetFarm.assetType} · {selectedAssetFarm.location}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              {[
                { label: 'Token ID', value: selectedAssetFarm.tokenId || 'PENDING' },
                { label: 'Status', value: selectedAssetFarm.status },
                { label: 'Funding Goal', value: `${formatUSDC(selectedAssetFarm.fundingGoal)} USDC` },
                { label: 'Current Funding', value: `${formatUSDC(selectedAssetFarm.currentFunding)} USDC` },
                { label: 'Expected Return', value: `+${selectedAssetFarm.expectedReturn}%` },
                { label: 'Duration', value: `${selectedAssetFarm.duration} days` },
                { label: 'Weather Risk', value: selectedAssetFarm.weatherRisk },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <strong style={{ color: 'var(--color-text)' }}>{value}</strong>
                </div>
              ))}
            </div>
            <Link
              href={`/farms/${selectedAssetFarm.id}`}
              className="btn btn-primary"
              style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
            >
              View Full Asset Details
            </Link>
          </div>
        </div>
      )}

      {/* RECEIPTS MODAL */}
      {showReceiptModal && selectedReceiptInv && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gapas-card animate-scale-up" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setShowReceiptModal(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Receipt size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>Investment Receipt</h3>
            </div>
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>GAPAS Investment Receipt</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'var(--font-jakarta)' }}>
                  {formatUSDC(selectedReceiptInv.amount)} USDC
                </p>
              </div>
              {[
                { label: 'Receipt ID', value: `INV-${selectedReceiptInv.id.slice(-6).toUpperCase()}` },
                { label: 'Farm', value: selectedReceiptInv.farm?.name || 'Unknown' },
                { label: 'Tx Hash', value: selectedReceiptInv.txHash ? `${selectedReceiptInv.txHash.slice(0, 16)}...` : 'N/A' },
                { label: 'Date', value: new Date(selectedReceiptInv.createdAt).toLocaleDateString('en-PH') },
                { label: 'Status', value: selectedReceiptInv.status },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <strong style={{ color: 'var(--color-text)', fontFamily: label === 'Tx Hash' ? 'monospace' : 'inherit' }}>{value}</strong>
                </div>
              ))}
            </div>
            <Link href="/wallet" className="btn btn-outline btn-full" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', fontSize: '0.8rem' }} onClick={() => setShowReceiptModal(null)}>
              View All Transactions in Wallet
            </Link>
          </div>
        </div>
      )}

      {/* CONTRACT MODAL */}
      {showContractModal && selectedContractInv && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gapas-card animate-scale-up" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowContractModal(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FileText size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>Investment Contract</h3>
            </div>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap'
            }}>
{`GAPAS SOROBAN SMART CONTRACT
=============================
CONTRACT TYPE: Agricultural Investment Agreement
NETWORK: Stellar Testnet (Simulated)
LEDGER: Soroban v2.1 GapasDIDRegistry

PARTIES:
  Investor DID: did:stellar:GAPAS:${selectedContractInv.investorWallet?.slice(0, 12) || 'INVESTOR'}...
  Farm Contract: ${selectedContractInv.farm?.contractAddress?.slice(0, 16) || 'CONTRACT'}...
  Farmer Wallet: ${selectedContractInv.farm?.farmerWallet?.slice(0, 12) || 'FARMER'}...

INVESTMENT TERMS:
  Asset: ${selectedContractInv.farm?.name || 'Farm Asset'}
  Amount: ${formatUSDC(selectedContractInv.amount)} USDC
  Ownership %: ${selectedContractInv.farm ? ((selectedContractInv.amount / selectedContractInv.farm.fundingGoal) * 100).toFixed(2) : '0'}% of total fund
  Expected ROI: +${selectedContractInv.farm?.expectedReturn || 0}%
  Duration: ${selectedContractInv.farm?.duration || 'N/A'} days

PROFIT DISTRIBUTION:
  Farmer: 40% of net income
  Investor Pool: 60% of net income
  Platform Fee: 1%
  Coop Fee: 0.5% (if applicable)

ESCROW:
  Tx Hash: ${selectedContractInv.txHash || 'PENDING'}
  Status: ${selectedContractInv.status}
  Created: ${new Date(selectedContractInv.createdAt).toLocaleDateString('en-PH')}

This contract is anchored on the Stellar blockchain.
Immutable and tamper-proof once confirmed.
`}
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
              This is a simulated contract for demonstration purposes. In production, this would be a real Soroban smart contract.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

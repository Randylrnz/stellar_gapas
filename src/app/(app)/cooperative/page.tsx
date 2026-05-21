'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import {
  Users, MapPin, CheckCircle, XCircle, TrendingUp,
  Building2, Sprout, ArrowRight, ClipboardList, Wallet, FileText,
  AlertCircle, ShieldCheck, Landmark, Tractor, Trees
} from 'lucide-react'
import {
  formatUSDC, formatPHP, shortenAddress, getFundingProgress,
  USDC_TO_PHP_RATE, usdcToPhp, phpToUsdc
} from '@/lib/types'
import Link from 'next/link'
import type { Ticket, Farm, Receipt, Transaction } from '@/lib/types'

export default function CooperativePortalPage() {
  const { 
    address,
    isConnected, 
    activeRole, 
    tickets, 
    cooperatives, 
    farms, 
    balances,
    setCooperatives,
    generateTicket,
    completeTicket,
    addFarm,
    addTransaction,
    addReceipt,
    updateBalances,
    showToast,
    farmBarangay
  } = useGapasStore()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue')
  const [farmerTab, setFarmerTab] = useState<'create' | 'coops'>('coops')

  const assignedCoop = cooperatives.find(
    coop => coop.barangay.toLowerCase().trim() === farmBarangay.toLowerCase().trim()
  )
  
  // Selected ticket to process
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // Tokenize asset form states
  const [assetType, setAssetType] = useState<'CROP' | 'LIVESTOCK' | 'EQUIPMENT' | 'CARBON'>('CROP')
  const [assetName, setAssetName] = useState('')
  const [fundingGoal, setFundingGoal] = useState(5000)
  const [expectedReturn, setExpectedReturn] = useState(15)
  const [valuePhp, setValuePhp] = useState(287150) // 5000 * 57.43
  
  // Specific details
  const [cropType, setCropType] = useState('')
  const [weatherRegion, setWeatherRegion] = useState<'Luzon' | 'Visayas' | 'Mindanao'>('Luzon')
  const [livestockType, setLivestockType] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [unit, setUnit] = useState('tons')
  
  // Equipment details
  const [eqModel, setEqModel] = useState('')
  const [eqPurchased, setEqPurchased] = useState('2025-01-01')
  const [eqNextMaint, setEqNextMaint] = useState('2026-06-01')
  const [eqCondition, setEqCondition] = useState<'NEW' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR'>('GOOD')
  
  // Carbon details
  const [carbonUnits, setCarbonUnits] = useState(100)

  // Simulation feedback state
  const [tokenizedAsset, setTokenizedAsset] = useState<Farm | null>(null)
  const [ledgerReceipt, setLedgerReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    // Sync coordinates / cooperates
  }, [isConnected])

  // Estimated value calculation synchronizer
  useEffect(() => {
    setValuePhp(Math.round(fundingGoal * USDC_TO_PHP_RATE))
  }, [fundingGoal])

  const handleFarmerCreateTicket = () => {
    const id = generateTicket()
    showToast(`Cooperative Help Ticket ${id} created successfully!`, 'success')
  }

  const handleProcessTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setAssetName('')
    setFundingGoal(5000)
    setExpectedReturn(18)
    setCropType('')
    setLivestockType('')
    setQuantity(10)
    setEqModel('')
    setTokenizedAsset(null)
    setLedgerReceipt(null)
  }

  const handleTokenizeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return

    const farmId = `farm-${Date.now()}`
    const timestamp = new Date().toISOString()
    const typeLabel = assetType.substring(0, 4)
    const tokenId = `${typeLabel}-${Math.floor(1000 + Math.random() * 9000)}`
    
    // Fee calculations (0.5% only applies to crops registered via cooperatives)
    const hasCoopFee = assetType === 'CROP'
    const coopFeePhp = hasCoopFee ? valuePhp * 0.005 : 0
    const coopFeeUsdc = hasCoopFee ? fundingGoal * 0.005 : 0

    // Construct Farm Asset
    const newFarm: Farm = {
      id: farmId,
      tokenId,
      assetType,
      name: assetName,
      cropType: assetType === 'CROP' ? cropType || 'Palay Rice' : undefined,
      livestockType: assetType === 'LIVESTOCK' ? livestockType || 'Native Pigs' : undefined,
      description: `Verified in-person asset tokenized by Sta. Rosa Cooperative. Registered under farmer account ${shortenAddress(selectedTicket.farmerId)}.`,
      location: assetType === 'CROP' 
        ? `${weatherRegion === 'Luzon' ? 'Sta. Rosa, Laguna' : weatherRegion === 'Visayas' ? 'Valencia, Bukidnon' : 'Davao City'}`
        : 'Sta. Rosa, Laguna',
      fundingGoal,
      currentFunding: 0,
      expectedReturn,
      riskLevel: assetType === 'CARBON' ? 'LOW' : assetType === 'EQUIPMENT' ? 'LOW' : 'MEDIUM',
      duration: assetType === 'EQUIPMENT' ? 365 : 120,
      status: 'ACTIVE',
      farmerWallet: selectedTicket.farmerId,
      cooperativeId: 'coop-1',
      cooperativeEnabled: true,
      weatherRisk: 'LOW',
      registeredBy: 'cooperative',
      quantity: assetType === 'LIVESTOCK' ? quantity : assetType === 'CARBON' ? carbonUnits : undefined,
      unit: assetType === 'LIVESTOCK' ? 'heads' : assetType === 'CARBON' ? 'tCO2' : unit,
      valuePhp,
      createdAt: timestamp,
      updatedAt: timestamp,
      equipmentDetails: assetType === 'EQUIPMENT' ? {
        model: eqModel || 'Generic Harvester',
        purchased: eqPurchased,
        nextMaint: eqNextMaint,
        condition: eqCondition
      } : null
    }

    // Register on-chain
    addFarm(newFarm)
    completeTicket(selectedTicket.id, farmId)

    // Apply fee transfer on simulated Stellar ledger
    if (hasCoopFee) {
      updateBalances({ usdc: balances.usdc + coopFeeUsdc })
      
      const feeTx: Transaction = {
        id: `tx-${Date.now()}`,
        txHash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        type: 'COOPERATIVE_FEE',
        amount: coopFeeUsdc,
        fromWallet: selectedTicket.farmerId,
        toWallet: 'GCOOPSTAROSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        farmId: farmId,
        memo: `Crop tokenization 0.5% fee on ${tokenId}`,
        status: 'SUCCESS',
        createdAt: timestamp
      }
      addTransaction(feeTx)

      // W3C Receipt
      const receiptId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`
      const newReceipt: Receipt = {
        id: receiptId,
        txHash: feeTx.txHash,
        type: 'FEE',
        fromDid: `did:stellar:GAPAS:${selectedTicket.farmerId}`,
        toDid: `did:stellar:GAPAS:GCOOPSTAROSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
        amountUsdc: coopFeeUsdc,
        amountPhp: coopFeePhp,
        exchangeRate: USDC_TO_PHP_RATE,
        assetId: tokenId,
        status: 'CONFIRMED',
        createdAt: timestamp
      }
      addReceipt(newReceipt)
      setLedgerReceipt(newReceipt)
    }

    setTokenizedAsset(newFarm)
    showToast(`Asset tokenized successfully as ${tokenId}!`, 'success')
  }

  // --- RENDER FARMER VIEW ---
  const renderFarmerView = () => {
    const farmerTickets = tickets.filter(t => t.farmerId === address)
    return (
      <div className="animate-fade-in-up">
        {/* HOW IT WORKS */}
        <div className="gapas-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(27,67,50,0.04), rgba(249,173,0,0.04))', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Paano Ito Gumagana</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { step: 1, text: "I-tap ang 'Generate Ticket Number' — walang ibang input na kailangan." },
              { step: 2, text: 'Isang natatanging ticket number ang lilikha at ipapakita sa screen.' },
              { step: 3, text: 'Pumunta sa iyong barangay hall at ipakita ang ticket sa cooperative officer.' },
              { step: 4, text: 'Irerehistro ng officer ang iyong asset details at ito ay ito-tokenize gamit ang ticket bilang sanggunian.' },
              { step: 5, text: 'Lalabas ang asset sa iyong My Assets sa loob ng 24–48 na oras, nakakonekta sa iyong account.' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.9rem',
                  flexShrink: 0
                }}>{step}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingTop: '0.375rem', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Desk Tickets */}
        <div className="gapas-card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <ClipboardList size={40} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Kailangan ng Tulong sa Pag-tokenize ng Assets?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '460px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
            Kung mayroon kang land titles, crops, commercial livestock, o heavy equipment na gusto mong ma-verify at ma-tokenize nang personal, gumawa ng support ticket. Isang G.A.P.A.S partner cooperative ang magpo-proseso nito.
          </p>
          <button onClick={handleFarmerCreateTicket} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
            <Users size={16} />
            Generate Ticket Number
          </button>
        </div>

        {/* My Tickets List */}
        <h3 className="section-title">My Tickets Tracker</h3>
        {farmerTickets.length === 0 ? (
          <div className="gapas-card text-center" style={{ padding: '1.5rem', color: 'var(--color-text-muted)' }}>
            Wala pang active na help tickets. I-generate ang isang ticket para magsimula.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {farmerTickets.map((t) => (
              <div key={t.id} className="gapas-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-surface-2)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)'
                  }}>{t.id}</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    Assigned to: General Network Queue (Any Partner Cooperative)
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Created: {new Date(t.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className={`badge ${t.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // --- RENDER COOPERATIVE TICKETING DESK ---
  const renderCooperativeDesk = () => {
    const pendingTickets = tickets.filter(t => t.status === 'PENDING')
    const completedTickets = tickets.filter(t => t.status === 'COMPLETED')
    const activeTickets = activeTab === 'queue' ? pendingTickets : completedTickets

    return (
      <div className="animate-fade-in-up">
        {/* Interactive Stats Ribbon */}
        <div className="responsive-grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="gapas-card text-center" style={{ padding: '0.875rem' }}>
            <ClipboardList size={18} color="var(--color-warning)" style={{ margin: '0 auto 0.25rem' }} />
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>In Queue</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{pendingTickets.length}</p>
          </div>
          <div className="gapas-card text-center" style={{ padding: '0.875rem' }}>
            <CheckCircle size={18} color="var(--color-success)" style={{ margin: '0 auto 0.25rem' }} />
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completed</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{completedTickets.length}</p>
          </div>
          <div className="gapas-card text-center" style={{ padding: '0.875rem' }}>
            <Wallet size={18} color="var(--color-amber)" style={{ margin: '0 auto 0.25rem' }} />
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Coop Wallet Balance</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatUSDC(balances.usdc)} <span style={{ fontSize: '0.6rem' }}>USDC</span></p>
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-full)',
          padding: '4px',
          marginBottom: '1.5rem',
          gap: '4px',
        }}>
          {[
            { id: 'queue', label: `Pending Tickets Queue (${pendingTickets.length})` },
            { id: 'history', label: `Verification History (${completedTickets.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSelectedTicket(null); }}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'var(--color-card)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`coop-ticketing-layout${selectedTicket ? ' has-selected' : ''}`}>
          {/* LEFT: Tickets List */}
          <div>
            <h3 className="section-title">
              {activeTab === 'queue' ? 'Incoming Farmer Verification Queue' : 'Historical Tokenizations Ledger'}
            </h3>
            {activeTickets.length === 0 ? (
              <div className="gapas-card text-center" style={{ padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                <ClipboardList size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <p style={{ fontWeight: 600 }}>No tickets found in this segment</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id
                  return (
                    <div
                      key={ticket.id}
                      className="gapas-card"
                      style={{
                        padding: '1rem',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: isSelected ? 'rgba(27,67,50,0.02)' : 'var(--color-card)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(249,173,0,0.12)',
                          color: 'var(--color-amber-dark)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-block',
                          marginBottom: '0.25rem'
                        }}>
                          {ticket.id}
                        </span>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          Farmer: {ticket.farmerName}
                        </h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                          Farmer Wallet: {shortenAddress(ticket.farmerId)}
                        </p>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          Created: {new Date(ticket.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        {ticket.status === 'PENDING' ? (
                          <button
                            onClick={() => handleProcessTicket(ticket)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            Process <ArrowRight size={12} />
                          </button>
                        ) : (
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-success" style={{ fontSize: '0.6rem', display: 'inline-block', marginBottom: '0.25rem' }}>VERIFIED</span>
                            {ticket.assetId && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block' }}>
                                Linked: {ticket.assetId.substring(0, 10)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Verification & Tokenization Panel */}
          {selectedTicket && (
            <div className="gapas-card animate-fade-in-up" style={{ padding: '1.25rem', border: '1px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  In-Person Verification Form
                </h3>
                <button onClick={() => setSelectedTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>✕</button>
              </div>

              {!tokenizedAsset ? (
                <form onSubmit={handleTokenizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(27,67,50,0.04)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', borderLeft: '3px solid var(--color-primary)' }}>
                    📝 Verify items presented in-person by <strong>{selectedTicket.farmerName}</strong> to mint authentic tokens on Stellar.
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Asset Type</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value as any)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.8rem', background: '#fff', outline: 'none' }}
                    >
                      <option value="CROP">Crop Asset (CROP-XXXX)</option>
                      <option value="LIVESTOCK">Livestock Asset (LIVE-XXXX)</option>
                      <option value="EQUIPMENT">Heavy Equipment (EQP-XXXX)</option>
                      <option value="CARBON">Carbon Credit offset (CARB-XXXX)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Asset Label / Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Cavendish Bananas - Batch A"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none' }}
                    />
                  </div>

                  <div className="grid-responsive-2" style={{ gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Funding Goal (USDC)</label>
                      <input
                        type="number"
                        value={fundingGoal}
                        onChange={(e) => setFundingGoal(Number(e.target.value))}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Expected Yield Return (%)</label>
                      <input
                        type="number"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Asset Estimated Value (PHP)</label>
                    <input
                      type="number"
                      value={valuePhp}
                      onChange={(e) => setValuePhp(Number(e.target.value))}
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Estimated conversion: {formatPHP(valuePhp)}</span>
                  </div>

                  {/* 1. Crop fields */}
                  {assetType === 'CROP' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', background: 'rgba(27,67,50,0.03)', borderRadius: 'var(--radius-md)' }}>
                      <div className="grid-responsive-2" style={{ gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Crop Type</label>
                          <input
                            type="text"
                            placeholder="Palay, Banana, Mango..."
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Weather Oracle Region</label>
                          <select
                            value={weatherRegion}
                            onChange={(e: any) => setWeatherRegion(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none', background: '#fff' }}
                          >
                            <option value="Luzon">Luzon (Laguna)</option>
                            <option value="Visayas">Visayas (Valencia)</option>
                            <option value="Mindanao">Mindanao (Davao)</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                        <strong>v2.0 Revenue Settlement Clause Notice:</strong> Crop tokenization will trigger a **0.5% Cooperative Tokenization Fee** ({formatPHP(valuePhp * 0.005)} / {formatUSDC(fundingGoal * 0.005)} USDC) credited instantly to your coop account upon issuance.
                      </div>
                    </div>
                  )}

                  {/* 2. Livestock fields */}
                  {assetType === 'LIVESTOCK' && (
                    <div className="grid-responsive-1-2-1" style={{ gap: '0.5rem', padding: '0.75rem', background: 'rgba(27,67,50,0.03)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Livestock Breed</label>
                        <input
                          type="text"
                          placeholder="Pig, Goat, Poultry..."
                          value={livestockType}
                          onChange={(e) => setLivestockType(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Quantity</label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          required
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Unit</label>
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Equipment fields */}
                  {assetType === 'EQUIPMENT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'rgba(27,67,50,0.03)', borderRadius: 'var(--radius-md)' }}>
                      <div className="grid-responsive-1-2" style={{ gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'block' }}>Model/Make</label>
                          <input
                            type="text"
                            placeholder="Kubota L5018 Tractor..."
                            value={eqModel}
                            onChange={(e) => setEqModel(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'block' }}>Condition</label>
                          <select
                            value={eqCondition}
                            onChange={(e: any) => setEqCondition(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none', background: '#fff' }}
                          >
                            <option value="NEW">New</option>
                            <option value="GOOD">Good Condition</option>
                            <option value="FAIR">Fair Condition</option>
                            <option value="NEEDS_REPAIR">Needs Repair</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid-responsive-2" style={{ gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'block' }}>Purchased Date</label>
                          <input
                            type="date"
                            value={eqPurchased}
                            onChange={(e) => setEqPurchased(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'block' }}>Next Maintenance</label>
                          <input
                            type="date"
                            value={eqNextMaint}
                            onChange={(e) => setEqNextMaint(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Carbon fields */}
                  {assetType === 'CARBON' && (
                    <div className="grid-responsive-1-2" style={{ gap: '0.5rem', padding: '0.75rem', background: 'rgba(27,67,50,0.03)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Carbon Offsetting Credits</label>
                        <input
                          type="number"
                          value={carbonUnits}
                          onChange={(e) => setCarbonUnits(Number(e.target.value))}
                          required
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Unit Metric</label>
                        <input
                          type="text"
                          value="tCO2 Offset"
                          disabled
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.75rem', outline: 'none', background: 'var(--color-surface-2)' }}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-full" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                    Issue Asset Tokens on Stellar Ledger
                  </button>
                </form>
              ) : (
                // SUCCESS feedback details dialog (State-of-the-Art aesthetics)
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in-up">
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      color: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      margin: '0 auto 0.75rem',
                      boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)'
                    }}>
                      ✔
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>Asset Tokenized Successfully</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Anchored on Stellar Mainnet Ledger</p>
                  </div>

                  <div style={{ background: 'var(--color-surface-2)', padding: '0.875rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Token ID</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{tokenizedAsset.tokenId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Asset Name</span>
                      <strong>{tokenizedAsset.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Farmer Wallet</span>
                      <span>{shortenAddress(tokenizedAsset.farmerWallet)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Funding Goal</span>
                      <strong>{formatUSDC(tokenizedAsset.fundingGoal)} USDC</strong>
                    </div>
                    {assetType === 'CROP' && ledgerReceipt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>0.5% Coop Fee Earned</span>
                        <strong style={{ color: 'var(--color-success)' }}>+{formatPHP(ledgerReceipt.amountPhp)}</strong>
                      </div>
                    )}
                  </div>

                  {ledgerReceipt && (
                    <div style={{ border: '1px dashed var(--color-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-card)', fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>STellar smart CONTRACT XDR</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ledgerReceipt.txHash}
                      </span>
                      <Link href="/receipts" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
                        <FileText size={10} /> View Ledger Receipt →
                      </Link>
                    </div>
                  )}

                  <button onClick={() => { setSelectedTicket(null); setTokenizedAsset(null); }} className="btn btn-outline btn-full" style={{ justifyContent: 'center' }}>
                    Clear Desk
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- GENERAL CONTROLLER ---
  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} style={{ color: 'var(--color-primary)' }} /> Cooperative Operations
          </h1>
          <p className="page-subtitle">
            {activeRole === 'FARMER' ? 'Get assisted in-person onboarding & verification' : 'Verify assets & tokenize farmer crops on-chain'}
          </p>
        </div>
        <span style={{
          backgroundColor: activeRole === 'FARMER' ? 'rgba(27,67,50,0.1)' : 'rgba(59,130,246,0.1)',
          color: activeRole === 'FARMER' ? 'var(--color-primary)' : 'var(--color-info)',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase'
        }}>
          {activeRole} Active View
        </span>
      </div>

      {activeRole === 'FARMER' ? renderFarmerView() : renderCooperativeDesk()}
    </div>
  )
}

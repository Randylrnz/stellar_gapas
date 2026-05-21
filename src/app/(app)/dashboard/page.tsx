'use client'

import { useEffect, useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, Sprout, Wallet, ArrowUpRight,
  CloudRain, Wind, RefreshCw, ChevronRight,
  ClipboardList, Gavel, ShieldCheck, Award, ArrowDownLeft,
  Droplet, Leaf, Activity, Zap, Brain, ShieldAlert, AlertTriangle,
  Sliders, Thermometer, User, Building2, Briefcase, FileText, Plus
} from 'lucide-react'
import { formatUSDC, formatPHP, getFundingProgress, shortenAddress, USDC_TO_PHP_RATE } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const { 
    address, 
    isConnected, 
    activeRole, 
    balances,
    farms, 
    myInvestments, 
    myTransactions, 
    tickets, 
    generateTicket,
    showToast,
    farmBarangay,
    farmCoordinates,
    ingestContractEvents,
    simulateIncomingBlockchainEvent,
    isSyncing,
    processedEventIds,
    deploySmartContract,
    setWalletConnected,
    setUser
  } = useGapasStore()
  const router = useRouter()
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const [showCoopHelpConfirm, setShowCoopHelpConfirm] = useState(false)
  const [selectedChartFarm, setSelectedChartFarm] = useState<string>('all')

  const [showNetworkHub, setShowNetworkHub] = useState(true)
  const [autoSync, setAutoSync] = useState(false)
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; type: string; details: string; time: string; txHash?: string }>>([
    { id: 'initial-1', type: 'SYSTEM', details: 'GAPAS Event Listener initialized on Stellar Testnet', time: new Date().toLocaleTimeString() }
  ])

  // Smart Contract Deployment states
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStep, setDeployStep] = useState<string>('')
  const [activeContractAddress, setActiveContractAddress] = useState<string>(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
  )
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)

  const handleConnectFreighter = async () => {
    setIsWalletConnecting(true)
    try {
      const { connectFreighter, isFreighterInstalled } = await import('@/lib/stellar')
      const installed = await isFreighterInstalled()
      if (!installed) {
        showToast('Freighter wallet extension not detected. Please install it first.', 'error')
        setIsWalletConnecting(false)
        return
      }
      
      const res = await connectFreighter()
      if (res.success && res.address) {
        setWalletConnected(res.address, res.network || 'testnet')
        setUser({
          id: res.address,
          walletAddress: res.address,
          role: 'INVESTOR',
          displayName: 'Juan dela Cruz (Freighter)',
          createdAt: new Date().toISOString(),
        })
        showToast(`Freighter connected: ${res.address.slice(0, 6)}...${res.address.slice(-4)}`, 'success')
      } else {
        showToast(`Freighter connection failed: ${(res as any).error || 'Access denied'}`, 'error')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Freighter connection failed', 'error')
    } finally {
      setIsWalletConnecting(false)
    }
  }

  const handleDeploy = async () => {
    if (!address) {
      showToast('Please connect your Freighter wallet first!', 'error')
      return
    }
    
    setIsDeploying(true)
    setDeployStep('Querying Ledger sequence from Testnet...')
    
    // Simulate query delay
    await new Promise(r => setTimeout(r, 1200))
    
    setDeployStep('Awaiting Freighter signature for deployment...')
    
    // Minor delay before actual trigger
    await new Promise(r => setTimeout(r, 800))
    
    try {
      const res = await deploySmartContract(address)
      if (res.success && res.contractId) {
        setDeployStep('Publishing contract code on-chain...')
        await new Promise(r => setTimeout(r, 1500))
        
        setActiveContractAddress(res.contractId)
        showToast('GAPAS Contract deployed successfully!', 'success')
        
        // Add log entry
        setEventLogs(prev => [
          {
            id: `deploy-${Date.now()}`,
            type: 'SYSTEM',
            details: `🚀 Smart Contract deployed successfully! ID: ${res.contractId}`,
            time: new Date().toLocaleTimeString(),
            txHash: res.txHash || `0x${Math.random().toString(16).slice(2, 10)}`
          },
          ...prev
        ])
      } else {
        showToast((res as any).error || 'Deployment failed', 'error')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Deployment failed', 'error')
    } finally {
      setIsDeploying(false)
      setDeployStep('')
    }
  }

  // Auto-Sync Polling Interval
  useEffect(() => {
    if (!autoSync) return
    const interval = setInterval(() => {
      const contractAddr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
      ingestContractEvents(contractAddr)
      
      if (Math.random() > 0.8) {
        const types: Array<'investment' | 'vote' | 'payout'> = ['investment', 'vote', 'payout']
        const randomType = types[Math.floor(Math.random() * types.length)]
        handleEmitDemo(randomType)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [autoSync])

  const handleManualSync = async () => {
    const contractAddr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
    await ingestContractEvents(contractAddr)
    
    setEventLogs(prev => [
      {
        id: `log-${Date.now()}`,
        type: 'SYNC',
        details: `Manual sync completed. Checked ledgers for contract ${shortenAddress(contractAddr)}.`,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ])
  }

  const handleEmitDemo = (type: 'investment' | 'vote' | 'payout') => {
    simulateIncomingBlockchainEvent(type)
    
    const detailsMap = {
      investment: 'Simulated SAC Token Transfer: +250 USDC Investment received from wallet',
      vote: 'Simulated DAO Vote Cast event detected for Active Proposal',
      payout: 'Simulated SAC Profit Payout event: Harvest yield payout distributed to investors'
    }

    setEventLogs(prev => [
      {
        id: `log-${Date.now()}`,
        type: type.toUpperCase(),
        details: detailsMap[type],
        time: new Date().toLocaleTimeString(),
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
      },
      ...prev
    ])
  }

  // Calculate stats dynamically
  const investorTotalInvested = myInvestments.reduce((s, i) => s + i.amount, 0)
  const investorTotalReturns = myInvestments.reduce((s, i) => s + (i.returnAmount || 0), 0)
  const investorActiveFarmsCount = farms.filter(f => f.status === 'ACTIVE').length
  const investorAverageApy = myInvestments.length > 0 
    ? (myInvestments.reduce((s, i) => s + (i.farm?.expectedReturn || 0), 0) / myInvestments.length).toFixed(1)
    : '18.4'

  // Farmer metrics
  const farmerFarms = farms.filter(f => f.farmerWallet === address)
  const farmerTotalAssetValuePhp = farmerFarms.reduce((s, f) => s + (f.valuePhp || f.fundingGoal * USDC_TO_PHP_RATE), 0)
  const farmerPendingPayoutsUsdc = farmerFarms.filter(f => f.status === 'FUNDED' || f.status === 'HARVESTING').reduce((s, f) => s + f.fundingGoal, 0)
  const farmerActiveTickets = tickets.filter(t => t.farmerId === address && t.status === 'PENDING')

  // Cooperative metrics
  const coopPendingTickets = tickets.filter(t => t.status === 'PENDING')
  const coopCompletedTickets = tickets.filter(t => t.status === 'COMPLETED')
  const coopAssistedFarms = farms.filter(f => f.cooperativeId === 'coop-1')
  
  const coopCommissionPhp = coopAssistedFarms
    .filter(f => f.assetType === 'CROP' || f.cropType)
    .reduce((s, f) => s + ((f.valuePhp || f.fundingGoal * USDC_TO_PHP_RATE) * 0.005), 0)

  const handleCoopHelpDeskClick = () => {
    setShowCoopHelpConfirm(true)
  }

  const handleConfirmCoopHelp = () => {
    const id = generateTicket()
    setCreatedTicketId(id)
    showToast(`Help Ticket ${id} generated!`, 'success')
    setShowCoopHelpConfirm(false)
  }

  const handleCreateTicket = () => {
    const id = generateTicket()
    setCreatedTicketId(id)
    showToast(`Help Ticket ${id} generated!`, 'success')
  }

  // Dual-Line Chart Data for SVG Rendering
  const chartData = [
    { month: 'Jun', actual: 85, predicted: 87, variance: -2.3 },
    { month: 'Jul', actual: 90, predicted: 89, variance: 1.1 },
    { month: 'Aug', actual: 88, predicted: 90, variance: -2.2 },
    { month: 'Sep', actual: 92, predicted: 91, variance: 1.1 },
    { month: 'Oct', actual: 95, predicted: 93, variance: 2.1 },
    { month: 'Nov', actual: 94, predicted: 96, variance: -2.08 },
    { month: 'Dec', actual: 91, predicted: 92, variance: -1.08 },
    { month: 'Jan', actual: 89, predicted: 90, variance: -1.1 },
    { month: 'Feb', actual: 93, predicted: 94, variance: -1.06 },
    { month: 'Mar', actual: 96, predicted: 95, variance: 1.05 },
    { month: 'Apr', actual: 98, predicted: 99, variance: -1.01 },
    { month: 'May', actual: 100, predicted: 101, variance: -0.99 }
  ]

  // Math Helper to map data coordinates to SVG space
  const mapCoordinates = () => {
    const w = 560
    const h = 180
    const pad = 35
    const graphWidth = w - pad * 2
    const graphHeight = h - pad * 2

    const maxVal = 110
    const minVal = 70
    const valRange = maxVal - minVal

    const pointsActual = chartData.map((d, i) => {
      const x = pad + (i / (chartData.length - 1)) * graphWidth
      const y = h - pad - ((d.actual - minVal) / valRange) * graphHeight
      return { x, y }
    })

    const pointsPred = chartData.map((d, i) => {
      const x = pad + (i / (chartData.length - 1)) * graphWidth
      const y = h - pad - ((d.predicted - minVal) / valRange) * graphHeight
      return { x, y }
    })

    return { pointsActual, pointsPred, w, h, pad, graphWidth, graphHeight }
  }

  const { pointsActual, pointsPred, w, h, pad, graphWidth, graphHeight } = mapCoordinates()

  const actualPath = pointsActual.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const predPath = pointsPred.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const shadedPolygonPoints = [
    ...pointsActual,
    ...[...pointsPred].reverse()
  ].map(p => `${p.x},${p.y}`).join(' ')

  // --- TAGALOG CONFIRMATION MODAL ---
  const renderCoopHelpModal = () => {
    if (!showCoopHelpConfirm) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem'
      }}>
        <div className="gapas-card animate-scale-up" style={{ width: '100%', maxWidth: '360px', padding: '1.75rem', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(27,67,50,0.1)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <ClipboardList size={26} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Humingi ng Tulong?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Sigurado ka bang gusto mong humingi ng tulong mula sa Coop Help Desk? Ang isang ticket ay lilikha at ipapadala sa aming kooperatiba para sa pagtulong.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowCoopHelpConfirm(false)}
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.6rem' }}
            >
              Hindi, Bumalik
            </button>
            <button
              onClick={handleConfirmCoopHelp}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.6rem' }}
            >
              Oo, Humingi ng Tulong
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderStellarNetworkHub = () => {
    return (
      <div className="gapas-card animate-fade-in-up" style={{
        marginBottom: '1.5rem',
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(27,67,50,0.06) 0%, rgba(249,173,0,0.04) 100%)',
        border: '1px solid rgba(27,67,50,0.15)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: 'radial-gradient(var(--color-primary-light) 0.5px, transparent 0.5px)',
          backgroundSize: '12px 12px',
          opacity: 0.1,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'rgba(27,67,50,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(27,67,50,0.15)'
            }}>
              <Activity size={18} className={isSyncing || autoSync || isDeploying ? 'animate-spin' : ''} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>
                Stellar Network Hub
              </h3>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                <span style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: autoSync || isDeploying ? '#10b981' : '#f59e0b',
                  display: 'inline-block',
                  boxShadow: autoSync || isDeploying ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                  animation: 'pulse 1.8s infinite'
                }} />
                {isDeploying ? 'Deploying Soroban Contract...' : autoSync ? 'Live Polling Active (getEvents RPC)' : 'Sync Standby'} · Testnet
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowNetworkHub(!showNetworkHub)}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 'unset', cursor: 'pointer' }}
            >
              {showNetworkHub ? 'Hide Panel' : 'Show Panel'}
            </button>
          </div>
        </div>

        {showNetworkHub && (
          <div className="animate-scale-in" style={{ position: 'relative', zIndex: 1 }}>
            {/* Smart Contract Deployment Section */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid rgba(27,67,50,0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                    🚀 Soroban Smart Contract Deployment
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                    Compile and register the GAPAS agricultural escrow logic on Stellar Testnet (Soroban).
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{
                    fontSize: '0.6875rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(27,67,50,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(27,67,50,0.15)',
                    fontWeight: 700,
                    color: 'var(--color-primary)'
                  }}>
                    Target: Testnet
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(59,130,246,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    fontWeight: 700,
                    color: '#2563eb'
                  }}>
                    Soroban v21
                  </div>
                </div>
              </div>

              <div className="grid-responsive-2" style={{ gap: '0.75rem', marginBottom: '1rem', alignItems: 'stretch' }}>
                {/* Deployment details */}
                <div style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Active Deployer Account:</span>
                    <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>
                      {address ? shortenAddress(address) : 'Not Connected'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Contract Status:</span>
                    <strong style={{ color: activeContractAddress.startsWith('C') ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeContractAddress.startsWith('C') ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
                      {activeContractAddress.startsWith('C') ? 'Active (Soroban)' : 'Uninitialized'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '0.4rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Contract Address:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {activeContractAddress ? `${activeContractAddress.slice(0, 10)}...${activeContractAddress.slice(-10)}` : 'N/A'}
                      </strong>
                      {activeContractAddress && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeContractAddress);
                            showToast('Contract Address copied!', 'success');
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Copy Contract Address"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deployment actions */}
                <div style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isDeploying ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="animate-spin" style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid rgba(27,67,50,0.1)',
                          borderTopColor: 'var(--color-primary)',
                          borderRadius: '50%'
                        }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          Deploying Escrow Logic...
                        </span>
                      </div>
                      <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)', animation: 'pulse 1.5s infinite' }}>
                        {deployStep}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                      <button
                        onClick={handleDeploy}
                        disabled={!address}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '0.625rem',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          background: address ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' : 'var(--color-border)',
                          borderColor: 'transparent',
                          color: address ? '#fff' : 'var(--color-text-muted)',
                          boxShadow: address ? '0 4px 14px rgba(27,67,50,0.25)' : 'none',
                          cursor: address ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        🚀 Deploy GAPAS Contract to Testnet
                      </button>

                      <button
                        onClick={handleConnectFreighter}
                        disabled={isWalletConnecting}
                        className="btn btn-outline"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          border: '1px solid var(--color-primary)',
                          color: 'var(--color-primary)',
                          background: 'rgba(27,67,50,0.03)',
                          transition: 'all 0.2s ease',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {isWalletConnecting ? (
                          <>
                            <div className="animate-spin" style={{
                              width: '12px',
                              height: '12px',
                              border: '2px solid rgba(27,67,50,0.1)',
                              borderTopColor: 'var(--color-primary)',
                              borderRadius: '50%'
                            }} />
                            Connecting Freighter Wallet...
                          </>
                        ) : (
                          <>🔌 Connect Freighter Wallet (Localhost)</>
                        )}
                      </button>

                      {!address && (
                        <p style={{ fontSize: '0.65rem', color: '#ef4444', textAlign: 'center', margin: 0, fontWeight: 600 }}>
                          ⚠️ Please connect Freighter Wallet first to deploy.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid-responsive-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.75rem 1rem',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0 }}>Live getEvents Monitor</h4>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>Poll ledger RPC for contract events</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 'unset', cursor: 'pointer' }}
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    Sync Ledger
                  </button>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Auto
                  </label>
                </div>
              </div>

              <div style={{
                display: 'flex',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.75rem 1rem',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0 }}>Capstone Interactive Demo</h4>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '0.1rem 0 0' }}>Simulate SAC & Soroban events live</p>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleEmitDemo('investment')}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.65rem', minWidth: 'unset', background: '#10b981', color: '#fff', cursor: 'pointer' }}
                  >
                    + Invest
                  </button>
                  <button
                    onClick={() => handleEmitDemo('vote')}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.65rem', minWidth: 'unset', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
                  >
                    + Vote
                  </button>
                  <button
                    onClick={() => handleEmitDemo('payout')}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.65rem', minWidth: 'unset', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}
                  >
                    + Payout
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--color-primary-dark)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.875rem',
              fontFamily: 'monospace',
              fontSize: '0.725rem',
              color: '#a7f3d0',
              maxHeight: '160px',
              overflowY: 'auto',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
            }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.375rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', color: '#34d399', fontWeight: 'bold' }}>
                <span>[SOROBAN LEDGER EVENTS LOG]</span>
                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Deduplicated: {processedEventIds.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {eventLogs.map((log) => {
                  let badgeColor = '#9ca3af'
                  let typeText = `[${log.type}]`
                  if (log.type === 'INVESTMENT') { badgeColor = '#10b981' }
                  else if (log.type === 'VOTE') { badgeColor = '#60a5fa' }
                  else if (log.type === 'PAYOUT') { badgeColor = '#fbbf24' }
                  else if (log.type === 'SYNC') { badgeColor = '#a78bfa'; typeText = '[SYS_SYNC]' }
                  else if (log.type === 'SYSTEM') { badgeColor = '#34d399'; typeText = '[STARTUP]' }

                  return (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#9ca3af', flexShrink: 0 }}>{log.time}</span>
                      <span style={{ color: badgeColor, fontWeight: 'bold', flexShrink: 0 }}>{typeText}</span>
                      <span style={{ color: '#f3f4f6', flex: 1 }}>
                        {log.details}
                        {log.txHash && (
                          <a 
                            href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#60a5fa', marginLeft: '0.4rem', textDecoration: 'underline', fontSize: '0.65rem' }}
                          >
                            tx:{log.txHash.slice(0, 10)}...
                          </a>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- 1. INVESTOR VIEW ---
  const renderInvestorDashboard = () => {
    return (
      <>
        {/* Investor Hero */}
        <div className="hero-banner animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Briefcase size={16} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Investor Mode
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.375rem', fontFamily: 'var(--font-jakarta)' }}>
              Kamusta Ka-Agri!
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
              Stellar Address: {address ? shortenAddress(address) : 'Connecting...'}
            </p>

            <div className="grid-responsive-2" style={{ gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Total Invested
                </p>
                <p style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                  {formatUSDC(investorTotalInvested)} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>USDC</span>
                </p>
              </div>
              <div style={{
                background: 'rgba(249,173,0,0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(249,173,0,0.25)',
              }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(249,173,0,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Total Returns
                </p>
                <p style={{ fontSize: '1.25rem', color: '#f9ad00', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                  {formatUSDC(investorTotalReturns)} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>USDC</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Quick Actions</h2>
          <div className="responsive-grid-actions">
            {[
              { href: '/farms', icon: Sprout, label: 'Marketplace', color: '#1B4332', bg: 'rgba(27,67,50,0.1)' },
              { href: '/portfolio', icon: TrendingUp, label: 'My Activities', color: '#2d6a4f', bg: 'rgba(45,106,79,0.1)' },
              { href: '/wallet', icon: Wallet, label: 'My Wallet', color: '#f9ad00', bg: 'rgba(249,173,0,0.12)' },
              { href: '/wallet', icon: FileText, label: 'Transactions', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            ].map(({ href, icon: Icon, label, color, bg }) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 0.5rem',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={20} color={color} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="animate-fade-in-up delay-250" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Activity</h2>
          </div>
          <div className="gapas-card" style={{ padding: '0.5rem 1rem' }}>
            {myTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: tx.type === 'FUND' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)' }}>
                  {tx.type === 'FUND' ? <ArrowUpRight size={18} color="#2563eb" /> : <TrendingUp size={18} color="#16a34a" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.memo || tx.type}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: tx.type === 'FUND' ? '#dc2626' : '#16a34a', flexShrink: 0 }}>
                  {tx.type === 'FUND' ? '-' : '+'}{formatUSDC(tx.amount)} USDC
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  // --- 2. FARMER VIEW ---
  const renderFarmerDashboard = () => {
    const isLocationConfigured = !!(farmBarangay && farmCoordinates)
    const chartFarmLabel = selectedChartFarm === 'all' 
      ? 'All Registered Farms' 
      : farmerFarms.find(f => f.id === selectedChartFarm)?.name || 'Selected Farm'

    return (
      <>
        {/* Farmer Hero */}
        <div className="hero-banner animate-fade-in-up" style={{ marginBottom: '1.5rem', background: 'var(--gradient-primary)' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <User size={16} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Farmer Mode
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.375rem', fontFamily: 'var(--font-jakarta)' }}>
              Kamusta Ka-Agri!
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
              DID: did:stellar:GAPAS:GC3DRQQ...AB74MX
            </p>

            <div className="grid-responsive-2" style={{ gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Total Invested
                </p>
                <p style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                  {formatUSDC(investorTotalInvested)} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>USDC</span>
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.2rem' }}>
                  ≈ {formatPHP(investorTotalInvested * USDC_TO_PHP_RATE)}
                </p>
              </div>
              <div style={{
                background: 'rgba(249,173,0,0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(249,173,0,0.25)',
              }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(249,173,0,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Total Returns
                </p>
                <p style={{ fontSize: '1.15rem', color: '#f9ad00', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                  {formatUSDC(investorTotalReturns)} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>USDC</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Quick Actions */}
        <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Farmer Quick Actions</h2>
          <div className="responsive-grid-actions">
            <button
              onClick={handleCoopHelpDeskClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(27,67,50,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ClipboardList size={20} color="var(--color-primary)" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Coop Help Desk
              </span>
            </button>

            <Link
              href="/create-farm"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(45,106,79,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sprout size={20} color="#2d6a4f" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Register My Asset
              </span>
            </Link>

            <Link
              href="/wallet"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(249,173,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Wallet size={20} color="#f9ad00" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                My Wallet
              </span>
            </Link>

            <Link
              href="/dao"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59,130,246,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Gavel size={20} color="#3b82f6" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Proposals
              </span>
            </Link>
          </div>
        </div>

        {/* Barangay Weather Oracle Widget — placed right after quick actions */}
        <div className="gapas-card animate-fade-in-up delay-150" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
              <CloudRain size={16} color="var(--color-primary)" />
              Weather Update
            </h3>
          </div>

          {!isLocationConfigured ? (
            <div style={{
              background: 'rgba(239,68,68,0.04)',
              border: '1px dashed rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <AlertTriangle size={24} color="#ef4444" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                I-set ang iyong farm location para sa weather tracking.
              </p>
              <Link href="/profile" className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.65rem', display: 'inline-block', textDecoration: 'none', marginTop: '0.4rem' }}>
                Configure Profile Location
              </Link>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Displaying localized weather for <strong>Barangay {farmBarangay}</strong> — coordinates <strong>{farmCoordinates?.lat?.toFixed(4)} N, {farmCoordinates?.lng?.toFixed(4)} E</strong>.
              </p>
              <div className="grid-responsive-3" style={{ gap: '0.5rem' }}>
                <div style={{ padding: '0.6rem 0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'rgba(34,197,94,0.05)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block' }}>Brgy. {farmBarangay}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>LOW RISK</span>
                </div>
                <div style={{ padding: '0.6rem 0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>Temperature</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)', display: 'block', marginTop: '0.2rem' }}>28°C</strong>
                </div>
                <div style={{ padding: '0.6rem 0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>Forecast (7-Day)</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)', display: 'block', marginTop: '0.2rem' }}>Sunny Intervals</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Yield Prediction Chart */}
        <div className="gapas-card animate-fade-in-up delay-200" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <TrendingUp size={16} color="var(--color-primary)" />
              Advanced Yield Prediction
            </h3>
            <select
              value={selectedChartFarm}
              onChange={(e) => setSelectedChartFarm(e.target.value)}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.7rem',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                outline: 'none',
                fontWeight: 600
              }}
            >
              <option value="all">All Farms</option>
              {farmerFarms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
              {farmerFarms.length === 0 && (
                <option value="sample">Sample Farm (Demo)</option>
              )}
            </select>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            All registered farm yield records stored in the GAPAS database (12-month rolling harvest history per farm).
          </p>

          <div style={{ position: 'relative', width: '100%', height: h, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
              <defs>
                <linearGradient id="varianceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[70, 80, 90, 100, 110].map((val) => {
                const y = h - pad - ((val - 70) / 40) * (h - pad * 2)
                return (
                  <g key={val}>
                    <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="var(--color-border)" strokeWidth="0.75" strokeDasharray="3,3" />
                    <text x={pad - 8} y={y + 3} fill="var(--color-text-muted)" fontSize="8" textAnchor="end">{val}</text>
                  </g>
                )
              })}
              <polygon points={shadedPolygonPoints} fill="url(#varianceGrad)" />
              <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={predPath} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />
              {pointsActual.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="var(--color-card)" strokeWidth="1.5" />
                  <circle cx={pointsPred[i].x} cy={pointsPred[i].y} r="3" fill="#2563eb" stroke="var(--color-card)" strokeWidth="1" />
                </g>
              ))}
              {chartData.map((d, i) => {
                const x = pad + (i / (chartData.length - 1)) * graphWidth
                return (
                  <text key={i} x={x} y={h - 12} fill="var(--color-text-secondary)" fontSize="8" fontWeight="600" textAnchor="middle">
                    {d.month}
                  </text>
                )
              })}
            </svg>
            <div style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', display: 'flex', gap: '0.75rem', fontSize: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }} />
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Actual Yield</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, background: '#2563eb', borderRadius: '50%' }} />
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>AI Predicted</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: 8, height: 8, background: 'rgba(37,99,235,0.1)', borderRadius: '2px' }} />
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Variance</span>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Month</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Actual Yield (cav/ha)</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Predicted Yield (cav/ha)</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Variance (%)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, i) => (
                  <tr key={i} style={{ borderBottom: i === chartData.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.4rem 0.75rem', color: 'var(--color-text)' }}>{d.month}</td>
                    <td style={{ padding: '0.4rem 0.75rem', color: 'var(--color-text)', fontWeight: 600 }}>{d.actual}</td>
                    <td style={{ padding: '0.4rem 0.75rem', color: 'var(--color-text-secondary)' }}>{d.predicted}</td>
                    <td style={{ padding: '0.4rem 0.75rem', color: d.variance >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {d.variance >= 0 ? `+${d.variance}` : d.variance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Farmer Assets */}
        <div className="animate-fade-in-up delay-200" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">My Registered Tokenized Assets ({farmerFarms.length})</h2>
          {farmerFarms.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Example tokenized asset 1 */}
              <div className="gapas-card" style={{ padding: '1rem', border: '1px dashed var(--color-border)', opacity: 0.85 }}>
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
                      CROP-7821
                    </span>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', display: 'inline-block' }}>
                      Benguet Strawberry Farm (Demo)
                    </h3>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>ACTIVE</span>
                </div>
                <div className="grid-responsive-2" style={{ gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  <div><strong>Asset Type:</strong> Crop</div>
                  <div><strong>Estimated Val:</strong> ₱228,600</div>
                </div>
                <div className="progress-bar-container" style={{ marginBottom: '0.375rem' }}>
                  <div className="progress-bar-fill" style={{ width: '30%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>30% Crowdfunded</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>1,200 / 4,000 USDC</span>
                </div>
              </div>
              {/* Example tokenized asset 2 */}
              <div className="gapas-card" style={{ padding: '1rem', border: '1px dashed var(--color-border)', opacity: 0.85 }}>
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
                      LIVE-4432
                    </span>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', display: 'inline-block' }}>
                      Atok Native Hog Farm (Demo)
                    </h3>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>PENDING</span>
                </div>
                <div className="grid-responsive-2" style={{ gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  <div><strong>Asset Type:</strong> Livestock</div>
                  <div><strong>Estimated Val:</strong> ₱344,580</div>
                </div>
                <div className="progress-bar-container" style={{ marginBottom: '0.375rem' }}>
                  <div className="progress-bar-fill" style={{ width: '0%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Awaiting Verification</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>0 / 6,000 USDC</span>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                These are sample assets. Register your own to see them here.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button onClick={handleCreateTicket} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Create Coop Ticket</button>
                <Link href="/create-farm" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', textDecoration: 'none', background: 'var(--color-primary)', color: '#fff' }}>Register My Asset</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {farmerFarms.map((farm) => {
                const progress = getFundingProgress(farm.currentFunding, farm.fundingGoal)
                return (
                  <div key={farm.id} className="gapas-card" style={{ padding: '1rem' }}>
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
                          {farm.tokenId || `${farm.assetType || 'ASSET'}-TKN`}
                        </span>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', display: 'inline-block' }}>
                          {farm.name}
                        </h3>
                      </div>
                      <span className={`badge ${
                        farm.status === 'ACTIVE' ? 'badge-info' : 
                        farm.status === 'FUNDED' ? 'badge-success' : 
                        farm.status === 'HARVESTING' ? 'badge-warning' : 'badge-primary'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {farm.status}
                      </span>
                    </div>

                    <div className="grid-responsive-2" style={{ gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      <div>
                        <strong>Asset Type:</strong> {farm.assetType || 'Crop'}
                      </div>
                      <div>
                        <strong>Estimated Val:</strong> {formatPHP(farm.valuePhp || farm.fundingGoal * USDC_TO_PHP_RATE)}
                      </div>
                    </div>

                    <div className="progress-bar-container" style={{ marginBottom: '0.375rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{progress}% Crowdfunded</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {formatUSDC(farm.currentFunding)} / {formatUSDC(farm.fundingGoal)} USDC
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Transactions */}
        <div className="animate-fade-in-up delay-250" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>My Transactions</h2>
            <Link href="/wallet" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <div className="gapas-card" style={{ padding: '0.5rem 1rem' }}>
            {myTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Wala pang transaksyon. Mag-invest o mag-register ng asset para magsimula.
              </div>
            ) : (
              myTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="tx-item">
                  <div className="tx-icon" style={{
                    background: 
                      tx.type === 'FUND' ? 'rgba(59,130,246,0.1)' : 
                      tx.type === 'RETURN' ? 'rgba(34,197,94,0.1)' :
                      tx.type === 'CASHOUT' ? 'rgba(239,68,68,0.1)' : 'rgba(249,173,0,0.1)',
                  }}>
                    {tx.type === 'FUND' ? <ArrowUpRight size={18} color="#2563eb" /> : 
                     tx.type === 'RETURN' ? <ArrowDownLeft size={18} color="#16a34a" /> :
                     tx.type === 'CASHOUT' ? <ArrowUpRight size={18} color="#ef4444" /> :
                     <RefreshCw size={18} color="#d97706" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.memo || tx.type}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: (tx.type === 'FUND' || tx.type === 'CASHOUT') ? '#dc2626' : '#16a34a', flexShrink: 0 }}>
                    {(tx.type === 'FUND' || tx.type === 'CASHOUT') ? '-' : '+'}{formatUSDC(tx.amount)} USDC
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    )
  }

  // --- 3. COOPERATIVE VIEW ---
  const renderCooperativeDashboard = () => {
    const pendingTicketsList = coopPendingTickets.slice(0, 3)
    return (
      <>
        {/* Cooperative Hero */}
        <div className="hero-banner animate-fade-in-up" style={{ marginBottom: '1.5rem', background: 'var(--gradient-hero)' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Building2 size={16} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Cooperative Mode
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.375rem', fontFamily: 'var(--font-jakarta)' }}>
              Sta. Rosa Cooperative Desk
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
              Assisting 200+ barangay growers on Stellar Mainnet.
            </p>

            <div className="grid-responsive-2" style={{ gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Commission Earnings (0.5%)
                </p>
                <p style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                  {formatPHP(coopCommissionPhp)}
                </p>
              </div>
              <div style={{
                background: 'rgba(249,173,0,0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(249,173,0,0.25)',
              }}>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(249,173,0,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Tickets Pending Queue
                </p>
                <p style={{ fontSize: '1.25rem', color: '#f9ad00', fontWeight: 800, fontFamily: 'var(--font-jakarta)' }}>
                  {coopPendingTickets.length} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Active</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cooperative Quick Actions */}
        <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Cooperative Quick Actions</h2>
          <div className="responsive-grid-actions" style={{ gap: '0.75rem' }}>
            {[
              { href: '/cooperative', icon: ClipboardList, label: 'Tickets Desk', color: '#1B4332', bg: 'rgba(27,67,50,0.1)' },
              { href: '/wallet', icon: Wallet, label: 'Coop Wallet', color: '#f9ad00', bg: 'rgba(249,173,0,0.12)' },
              { href: '/dao', icon: Gavel, label: 'Coop DAO', color: '#2d6a4f', bg: 'rgba(45,106,79,0.1)' },
              { href: '/profile', icon: User, label: 'Coop Profile', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            ].map(({ href, icon: Icon, label, color, bg }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 0.5rem',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={20} color={color} />
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Cooperative Desk Overview Stats */}
        <div className="gapas-card animate-fade-in-up delay-150" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <h2 className="section-title">Assisted Registry Performance</h2>
          <div className="grid-responsive-3" style={{ gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ padding: '0.5rem', borderRight: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assisted Assets</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>{coopAssistedFarms.length}</p>
            </div>
            <div style={{ padding: '0.5rem', borderRight: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tickets Cleared</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>{coopCompletedTickets.length}</p>
            </div>
            <div style={{ padding: '0.5rem' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Earnings Balance</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-amber)' }}>{formatUSDC(coopCommissionPhp / USDC_TO_PHP_RATE)} <span style={{ fontSize: '0.6rem' }}>USDC</span></p>
            </div>
          </div>
        </div>

        {/* Farmer Pending Tickets Desk */}
        <div className="animate-fade-in-up delay-200" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Recent Incoming Tickets Queue
              <span style={{
                marginLeft: '0.5rem',
                background: 'rgba(249,173,0,0.15)',
                color: 'var(--color-amber-dark)',
                borderRadius: 'var(--radius-full)',
                padding: '0.1rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>{coopPendingTickets.length}</span>
            </h2>
            <Link href="/cooperative" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Manage Queue <ChevronRight size={14} />
            </Link>
          </div>

          {pendingTicketsList.length === 0 ? (
            <div className="gapas-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <ClipboardList size={32} color="var(--color-text-muted)" style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>All tickets cleared!</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No barangay growers are currently in the verification queue.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingTicketsList.map((ticket) => (
                <div key={ticket.id} className="gapas-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: 'var(--color-amber-dark)',
                      backgroundColor: 'rgba(249,173,0,0.1)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-block',
                      marginBottom: '0.25rem'
                    }}>
                      {ticket.id}
                    </span>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Farmer: {ticket.farmerName}
                    </h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Incoming: {new Date(ticket.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <Link href="/cooperative" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}>
                    Process →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cooperative Assisted Assets */}
        <div className="animate-fade-in-up delay-250" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Assisted On-Chain Assets ({coopAssistedFarms.length})</h2>
          {coopAssistedFarms.length === 0 ? (
            <div className="gapas-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              No crops or assets registered through this cooperative yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {coopAssistedFarms.map((farm) => (
                <div key={farm.id} className="gapas-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>{farm.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {farm.cropType || farm.livestockType || farm.assetType} · {farm.location}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>
                      {formatPHP(farm.valuePhp || farm.fundingGoal * USDC_TO_PHP_RATE)}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>
                      Commission: {formatPHP((farm.valuePhp || farm.fundingGoal * USDC_TO_PHP_RATE) * 0.005)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  // --- GENERAL RENDER WRAPPER ---
  return (
    <div className="page-with-nav app-container">
      {renderCoopHelpModal()}
      {renderStellarNetworkHub()}
      {activeRole === 'INVESTOR' && renderInvestorDashboard()}
      {activeRole === 'FARMER' && renderFarmerDashboard()}
      {activeRole === 'COOPERATIVE' && renderCooperativeDashboard()}
    </div>
  )
}

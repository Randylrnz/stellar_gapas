'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { shortenAddress } from '@/lib/types'
import {
  Wallet, LogOut, ExternalLink, ShieldCheck, Award, FileText, CheckCircle,
  AlertTriangle, UploadCloud, Copy, X, Loader2, Sparkles, MapPin, Key,
  Activity, RefreshCw, Plus
} from 'lucide-react'
import { getAccountExplorerUrl } from '@/lib/stellar'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const {
    address,
    isConnected,
    user,
    activeRole,
    setWalletDisconnected,
    showToast,
    uploadCredential,
    simulateCredentialApproval,
    farmBarangay,
    setFarmBarangay,
    farmCoordinates,
    setFarmCoordinates,
    ingestContractEvents,
    simulateIncomingBlockchainEvent,
    isSyncing,
    processedEventIds,
    deploySmartContract,
    setWalletConnected,
    setUser
  } = useGapasStore()

  const [copied, setCopied] = useState(false)
  const [selectedCred, setSelectedCred] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<string>('')
  const [auditingCred, setAuditingCred] = useState<string | null>(null)

  // Local settings states
  const [barangayInput, setBarangayInput] = useState(farmBarangay || 'Atok')
  const [latInput, setLatInput] = useState(farmCoordinates?.lat?.toString() || '16.5779')
  const [lngInput, setLngInput] = useState(farmCoordinates?.lng?.toString() || '120.7013')

  // Stellar Network Hub states
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
  const [activeRegistryAddress, setActiveRegistryAddress] = useState<string>(
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS || ''
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
          role: 'COOPERATIVE',
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
            details: `Smart Contract deployed successfully! ID: ${res.contractId}`,
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

  function handleDisconnect() {
    setWalletDisconnected()
    setActiveContractAddress('')
    setEventLogs([])
    showToast('Wallet disconnected', 'info')
    router.push('/')
  }

  function copyDid() {
    if (!user?.did) return
    navigator.clipboard.writeText(user.did).then(() => {
      setCopied(true)
      showToast('W3C DID Copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleOpenUpload = (credName: string) => {
    setSelectedCred(credName)
    setUploadFile('')
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCred) return

    setIsUploading(true)
    setTimeout(() => {
      uploadCredential(selectedCred)
      setIsUploading(false)
      setSelectedCred(null)
      showToast(`Document uploaded for ${selectedCred}! Compliance officer will review soon.`, 'info')
    }, 1200)
  }

  const handleAuditAction = (credName: string, approve: boolean) => {
    simulateCredentialApproval(credName, approve)
    if (approve) {
      showToast(`Compliance Oracle issued W3C VC for ${credName}! Credit score improved.`, 'success')
    } else {
      showToast(`Oracle rejected ${credName} due to verification anomaly.`, 'error')
    }
    setAuditingCred(null)
  }

  const handleSaveSettings = () => {
    setFarmBarangay(barangayInput)
    const latVal = parseFloat(latInput)
    const lngVal = parseFloat(lngInput)
    if (!isNaN(latVal) && !isNaN(lngVal)) {
      setFarmCoordinates({ lat: latVal, lng: lngVal })
    }
    showToast('Farm location successfully updated!', 'success')
  }

  const handleSimulatePinDrop = () => {
    // Generate slight variations around Benguet coordinates
    const randomLat = 16.5 + Math.random() * 0.2
    const randomLng = 120.6 + Math.random() * 0.2
    setLatInput(randomLat.toFixed(4))
    setLngInput(randomLng.toFixed(4))
    showToast('Simulated dropping pin on Barangay map successfully!', 'success')
  }



  const credentials = user?.credentials || []
  const creditScore = user?.creditScore || 782

  // Calculate credit score health & radial parameters
  const scorePercent = (creditScore / 1000) * 100
  const strokeDashoffset = 251.2 - (251.2 * scorePercent) / 100

  const getScoreColor = () => {
    if (creditScore >= 800) return '#10b981'
    if (creditScore >= 700) return '#059669' // Good compliance Green/Teal
    if (creditScore >= 600) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = () => {
    if (creditScore >= 800) return 'Excellent Compliance'
    if (creditScore >= 700) return 'Verified Integrity'
    if (creditScore >= 600) return 'Good Standing'
    return 'Risk Warning'
  }

  const roleLabel = activeRole === 'COOPERATIVE' ? 'Cooperative' : activeRole === 'INVESTOR' ? 'Investor' : 'Farmer'

  return (
    <div className="page-with-nav app-container">
      <div className="page-header animate-fade-in-up">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={28} color="var(--color-primary)" />
          Profile
        </h1>
        <p className="page-subtitle">W3C Compliance Credentials, KYC, and Identity Management</p>
      </div>

      {/* Credit Score Dial & DID info */}
      <div className="grid-responsive-split animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        {/* Credit Score Radial Dial */}
        <div className="gapas-card" style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Compliance Score
          </h3>
          <div style={{ position: 'relative', width: 100, height: 100, marginBottom: '0.5rem' }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="var(--color-border)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={getScoreColor()}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', display: 'block', lineHeight: 1 }}>{creditScore}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Limit 1000</span>
            </div>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: getScoreColor(),
            backgroundColor: `${getScoreColor()}12`,
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '0.5rem'
          }}>
            {getScoreLabel()}
          </span>

          {/* Verifiable Credentials list directly below the compliance dial */}
          <div style={{
            width: '100%',
            marginTop: '0.75rem',
            borderTop: '1px dashed var(--color-border)',
            paddingTop: '0.75rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              Verifiable Credentials
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>1. Land Ownership Certificate</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                <CheckCircle size={10} /> Verified
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>2. Farming History</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                <CheckCircle size={10} /> Verified
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>3. Sustainable Practices Cert.</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                <CheckCircle size={10} /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* W3C DID details card */}
        <div className="gapas-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'rgba(27,67,50,0.1)',
                color: 'var(--color-primary-dark)',
                borderRadius: 'var(--radius-full)',
                padding: '0.15rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}>
                {roleLabel}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {address ? (
                  <button
                    onClick={handleDisconnect}
                    className="btn"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 2px 6px rgba(220,38,38,0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                    }}
                  >
                    <LogOut size={12} /> Disconnect Wallet
                  </button>
                ) : (
                  <button
                    onClick={handleConnectFreighter}
                    disabled={isWalletConnecting}
                    className="btn"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 2px 6px rgba(22,92,45,0.2)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isWalletConnecting ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet size={12} /> Connect to Wallet
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              Juan dela Cruz
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
              {roleLabel} · <strong>Benguet Province</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginBottom: '0.75rem' }}>
              <ShieldCheck size={12} />
              Identity Verified
            </div>

            {/* W3C DID URI Box */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <FileText size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                did:stellar:GAPAS:GC3DRQQ3S7LNDDEX5AB74MX26P
              </span>
              <button
                onClick={copyDid}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.15rem' }}
                aria-label="Copy DID URI"
              >
                {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Stats row */}
            <div className="grid-responsive-3" style={{ gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Assets</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>3 Registered</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>KYC Status</span>
                <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>Approved</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>AML Screening</span>
                <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>Cleared</strong>
              </div>
            </div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
              Last Review: May 10, 2024
            </div>

            {/* Embedded Active Deployer & Smart Contract Credentials */}
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.7rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Active Deployer Account:</span>
                <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>
                  {address ? shortenAddress(address) : 'GBTTGUEMWPFC53GBAHJMQIKD6IGDOLPRMSGPYQP34FKV73FJW5K6ZJZD'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Contract Status:</span>
                <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Active (Soroban)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Farm Escrow Address:</span>
                <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>
                  {activeContractAddress || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>KYC Registry Address:</span>
                <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>
                  {activeRegistryAddress || 'Not deployed (Registry Contract)'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Soroban Ledger Events Log (Standalone Monospace Card) */}
      <div className="gapas-card animate-fade-in-up" style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--color-primary-dark)',
        border: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'monospace',
        fontSize: '0.725rem',
        color: '#a7f3d0',
        maxHeight: '220px',
        overflowY: 'auto',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
      }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34d399', fontWeight: 'bold', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>[SOROBAN LEDGER EVENTS LOG]</span>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Deduplicated: {processedEventIds.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid #34d399',
                borderRadius: '4px',
                color: '#34d399',
                padding: '0.2rem 0.5rem',
                fontSize: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(52, 211, 153, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(52, 211, 153, 0.1)';
              }}
            >
              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
              SYNC_LEDGER
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#34d399', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                style={{ cursor: 'pointer', width: 12, height: 12, accentColor: '#34d399' }}
              />
              AUTO
            </label>
          </div>
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



      {/* DOCUMENT UPLOAD MODAL */}
      {selectedCred && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="gapas-card animate-scale-up" style={{ width: '100%', maxWidth: '380px', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedCred(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              aria-label="Close upload modal"
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <UploadCloud size={18} color="var(--color-primary)" />
              Upload Credentials
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Anchor a certificate file or metadata on the Stellar ledger for <strong>{selectedCred}</strong>.
            </p>

            <form onSubmit={handleUploadSubmit}>
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}>
                <UploadCloud size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                  Drag & drop certificate image or PDF
                </p>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  Max file size: 5MB
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Simulated Certificate URL/Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. barangay_clearance_atok_benguet.pdf"
                  value={uploadFile}
                  onChange={(e) => setUploadFile(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    Calculating File SHA-256 ...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Publish to DID Registry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

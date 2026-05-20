'use client'

import { useState } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { shortenAddress } from '@/lib/types'
import {
  Wallet, LogOut, ExternalLink, ShieldCheck, Award, FileText, CheckCircle,
  AlertTriangle, UploadCloud, Copy, X, Loader2, Sparkles, MapPin, Key
} from 'lucide-react'
import { getAccountExplorerUrl } from '@/lib/stellar'

export default function ProfilePage() {
  const {
    address,
    isConnected,
    user,
    setWalletDisconnected,
    showToast,
    uploadCredential,
    simulateCredentialApproval,
    farmBarangay,
    setFarmBarangay,
    farmCoordinates,
    setFarmCoordinates
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

  function handleDisconnect() {
    setWalletDisconnected()
    showToast('Wallet disconnected', 'info')
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

  const roleLabel = user?.role === 'FARMER' ? 'Farmer' : user?.role === 'INVESTOR' ? 'Investor' : user?.role === 'COOPERATIVE' ? 'Cooperative' : 'User'

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem', marginBottom: '1.5rem' }} className="animate-fade-in-up delay-100">
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
            borderRadius: 'var(--radius-full)'
          }}>
            {getScoreLabel()}
          </span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                <ShieldCheck size={12} />
                Identity Verified
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              Juan dela Cruz
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Farmer · <strong>Benguet Province</strong>
            </p>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
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
          </div>
        </div>
      </div>

      {/* Compliance Verifiable Credentials Grid */}
      <div className="animate-fade-in-up delay-200" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">W3C Verifiable Credentials Desk</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {credentials.map((cred) => {
            const isVerified = cred.status === 'VERIFIED'
            const isReview = cred.status === 'UNDER_REVIEW'
            const isRejected = cred.status === 'REJECTED'
            
            // Adjust label for barangay clearance
            const displayIssuer = cred.name === 'Barangay Clearance' 
              ? `Barangay ${barangayInput} Clearance Officer`
              : cred.issuer;

            return (
              <div
                key={cred.name}
                className="gapas-card"
                style={{
                  padding: '1rem',
                  border: isVerified ? '1.5px solid #10b981' : isReview ? '1.5px solid #f59e0b' : isRejected ? '1.5px solid #ef4444' : '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isVerified ? 'rgba(16,185,129,0.02)' : isReview ? 'rgba(245,158,11,0.02)' : 'var(--color-card)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Issuer: {displayIssuer}
                    </span>
                    <span className={`badge ${
                      isVerified ? 'badge-success' : isReview ? 'badge-warning' : isRejected ? 'badge-danger' : 'badge-primary'
                    }`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>
                      {cred.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem', lineHeight: 1.25 }}>
                    {cred.name}
                  </h4>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    Reviewer: {cred.reviewer}
                  </p>
                  
                  {isVerified && cred.issuedVc && (
                    <div style={{
                      fontSize: '0.6rem',
                      fontFamily: 'monospace',
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem',
                      marginTop: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      Hash: {cred.issuedVc.split(':').pop()}
                    </div>
                  )}

                  {isReview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d97706', fontSize: '0.65rem', marginTop: '0.5rem' }}>
                      <Loader2 size={12} className="spinner" />
                      Oracle vetting certificate validity...
                    </div>
                  )}

                  {isRejected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontSize: '0.65rem', marginTop: '0.5rem' }}>
                      <AlertTriangle size={12} />
                      Document upload failed checksum.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  {/* Action buttons based on state */}
                  {cred.status === 'PENDING' && (
                    <button
                      onClick={() => handleOpenUpload(cred.name)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', gap: '0.25rem', alignItems: 'center' }}
                    >
                      <UploadCloud size={12} />
                      Upload Document
                    </button>
                  )}

                  {isReview && (
                    <button
                      onClick={() => setAuditingCred(auditingCred === cred.name ? null : cred.name)}
                      className="btn btn-outline"
                      style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', gap: '0.25rem', alignItems: 'center', border: '1px dashed #d97706', color: '#d97706' }}
                    >
                      <Sparkles size={12} />
                      Oracle Audit Options
                    </button>
                  )}

                  {isRejected && (
                    <button
                      onClick={() => handleOpenUpload(cred.name)}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      Retry Re-upload
                    </button>
                  )}

                  {isVerified && (
                    <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Award size={14} />
                      Cryptographically Validated
                    </div>
                  )}
                </div>

                {/* Audit Controls Panel dropdown */}
                {auditingCred === cred.name && (
                  <div style={{
                    marginTop: '0.75rem',
                    borderTop: '1px dashed var(--color-border)',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    gap: '0.35rem'
                  }}>
                    <button
                      onClick={() => handleAuditAction(cred.name, true)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.25rem', fontSize: '0.65rem', background: '#10b981', color: '#fff' }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleAuditAction(cred.name, false)}
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '0.25rem', fontSize: '0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Verification Flow Descriptions - Emoji Purged */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verification Flow Protocol
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>
              Government credentials (DENR, DA, ATI) are automatically cross-checked against their public registries via API — no manual step needed if your details match.
            </li>
            <li>
              Platform credentials (KYC, AML) are reviewed by the G.A.P.A.S compliance team within 1-2 business days after document upload.
            </li>
            <li>
              Barangay Clearance is reviewed manually by your assigned barangay officer after you upload the document.
            </li>
          </ul>
        </div>
      </div>

      {/* Profile settings info */}
      <div className="animate-fade-in-up delay-250" style={{ marginBottom: '1.5rem' }}>
        <div className="gapas-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Compliance Standard</span>
            <strong style={{ color: 'var(--color-text)' }}>W3C Verifiable Credentials</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Ledger Identity Standard</span>
            <strong style={{ color: 'var(--color-text)' }}>SEP-10 Secure Authentication</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Soroban Smart Contract</span>
            <strong style={{ color: 'var(--color-text)' }}>v2.1 GapasDIDRegistry</strong>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="animate-fade-in-up delay-250" style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleDisconnect}
            className="btn btn-outline btn-full"
            style={{ color: '#dc2626', borderColor: '#dc2626' }}
          >
            <LogOut size={18} />
            Disconnect Wallet
          </button>
        </div>
      )}

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

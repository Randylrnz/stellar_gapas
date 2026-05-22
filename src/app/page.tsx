'use client'
import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, TrendingUp, Users, Sprout, ChevronDown, CheckCircle, HelpCircle, ArrowRight, Loader2, Sparkles, BookOpen, AlertTriangle, Cpu } from 'lucide-react'

export default function LandingPage() {
  const { isConnected, setWalletConnected, setUser, switchRole, showToast } = useGapasStore()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'COOPERATIVE'>('FARMER')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleWalletAuth = async () => {
    setIsConnecting(true)
    try {
      const { connectFreighter, isFreighterInstalled } = await import('@/lib/stellar')
      const installed = await isFreighterInstalled()

      if (installed) {
        const res = await connectFreighter()
        if (res.success && res.address) {
          setWalletConnected(res.address, res.network || 'testnet')
          switchRole(selectedRole)
          setUser({
            id: res.address,
            walletAddress: res.address,
            role: selectedRole,
            displayName: selectedRole === 'FARMER' ? 'Juan dela Cruz (Farmer)' : 'Benguet Cooperative Officer',
            createdAt: new Date().toISOString(),
          })
          showToast(`Access granted! Signed in as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`, 'success')
          setIsConnecting(false)
          router.push(selectedRole === 'COOPERATIVE' ? '/cooperative' : '/dashboard')
          return
        } else {
          showToast(`Wallet failed: ${(res as any).error || 'Failed to authenticate'}. Launching Demo account...`, 'info')
        }
      } else {
        showToast('Freighter extension not detected. Launching Demo account...', 'info')
      }
    } catch (err) {
      console.warn('Stellar wallet connection failed, entering Demo workspace:', err)
    }

    // High fidelity Mock wallet credentials for Capstone demo representation
    setTimeout(() => {
      const mockAddress = selectedRole === 'FARMER'
        ? 'GBTTGUEMWPFC53GBAHJMQIKD6IGDOLPRMSGPYQP34FKV73FJW5K6ZJZD'
        : 'GC3DRQQ3S7LNDDEX5AB74MX26P4H3LRYIQL2LGBW6NVSY3RHYR7RSHGA'

      setWalletConnected(mockAddress, 'testnet')
      switchRole(selectedRole)
      setUser({
        id: mockAddress,
        walletAddress: mockAddress,
        role: selectedRole,
        displayName: selectedRole === 'FARMER' ? 'Juan dela Cruz (Farmer)' : 'Benguet Cooperative Officer',
        createdAt: new Date().toISOString(),
      })
      showToast(`Demo Session initialized: ${selectedRole} Account`, 'success')
      setIsConnecting(false)
      router.push(selectedRole === 'COOPERATIVE' ? '/cooperative' : '/dashboard')
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      overflowX: 'hidden',
    }}>
      {/* Hero Section - Balanced Two-Column Layout */}
      <section style={{
        background: 'var(--gradient-hero)',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        padding: '3rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-15%',
          width: '50vw', height: '50vw', maxWidth: 450,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', left: '-10%',
          width: '45vw', height: '45vw', maxWidth: 350,
          background: 'rgba(249,173,0,0.04)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div className="landing-hero-grid" style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center',
        }}>
          {/* Left Column: Platform Branding Pitch */}
          <div style={{ color: '#ffffff' }} className="animate-fade-in-up">
            {/* Plain premium logo badge without "testnet" text */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 1rem',
              marginBottom: '1.75rem',
            }}>
              <Sprout size={16} color="var(--color-primary-light)" />
              <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}> G.A.P.A.S.
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}>
              Fund Farms.<br />
              Earn Returns.<br />
              <span style={{ color: 'var(--color-primary-light)' }}>On Blockchain.</span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '520px',
            }}>
              G.A.P.A.S connects agricultural workers with global financing through Stellar asset tokenization and Soroban smart contract escrows. Fully decentralized, audited, and parameterically protected.
            </p>

            {/* High-visibility statistics overview */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem', maxWidth: '460px',
            }}>
              {[
                { header: 'Can Support', value: '1,500+', label: 'Farmers' },
                { header: 'Can Tokenize', value: '300+', label: 'Farm Assets' },
                { header: 'Will Ensure', value: '100%', label: 'Transparent Transactions' },
              ].map(({ header, value, label }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 0.5rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(6px)',
                }}>
                  <p style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.55)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem 0' }}>{header}</p>
                  <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace', margin: 0 }}>{value}</p>
                  <p style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.55)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem', marginBottom: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Signup/Login Interactive Portal */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem 2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--color-border)',
            position: 'relative',
          }} className="animate-scale-in">
            {/* Header branding info inside portal card */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <img src="/Logo.png" alt="GAPAS Logo" style={{ width: '130px', height: '36px', objectFit: 'contain', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Highland Asset Tokenization & Settlement Desk
              </p>
            </div>

            {/* Premium selection toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-lg)',
              padding: '4px',
              marginBottom: '1.75rem',
              border: '1px solid var(--color-border)',
            }}>
              <button
                type="button"
                onClick={() => setSelectedRole('FARMER')}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedRole === 'FARMER' ? 'var(--color-primary)' : 'transparent',
                  color: selectedRole === 'FARMER' ? '#ffffff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                Farmer Mode
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('COOPERATIVE')}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedRole === 'COOPERATIVE' ? 'var(--color-primary)' : 'transparent',
                  color: selectedRole === 'COOPERATIVE' ? '#ffffff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                Coop Officer
              </button>
            </div>

            {/* Custom Interactive Two-Column KYC / Signup Card Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: '1.25rem',
              alignItems: 'center',
              background: 'rgba(22,92,45,0.03)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(22,92,45,0.1)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  color: 'var(--color-primary)',
                  backgroundColor: 'rgba(27,67,50,0.08)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  KNOW YOUR CUSTOMER FEATURE
                </span>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.2rem', color: 'var(--color-text)' }}>
                  Sign-up now and connect to the Blockchain
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  Verify your farmer or cooperative status to access tokenized agricultural credit.
                </p>
              </div>
              <div style={{
                height: '75px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <img
                  src="/farmer pic 1.jpg"
                  alt="Highland Farmer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Main Action Connection trigger */}
            <button
              onClick={handleWalletAuth}
              disabled={isConnecting}
              className="btn btn-primary btn-full btn-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(22, 92, 45, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                fontSize: '0.85rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '1rem',
              }}
            >
              {isConnecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Connecting to Blockchain...</span>
                </>
              ) : (
                <>
                  <Cpu size={18} />
                  <span>Sign-up & Connect for KYC Feature</span>
                </>
              )}
            </button>

            <p style={{
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              lineHeight: 1.45,
              marginTop: '1.25rem',
              marginBottom: 0,
            }}>
              Requires Freighter Wallet browser extension. Connected session anchors parametric DID and smart contract compliance logic.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scroll</span>
          <ChevronDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* Problem Statement Section - Highlighting the Filipino Agricultural Financing Gaps */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 900,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#dc2626',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Problem Statement
            </span>
            <h2 style={{
              fontSize: '2rem', fontWeight: 900,
              marginTop: '0.75rem', marginBottom: '0.75rem',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
            }}>
              The Agricultural Credit & Financial Inclusion Gap
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Traditional banking barriers exclude Philippine smallholder growers, causing extreme asset liquidity locking.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                metric: '₱366.6B',
                title: 'Agricultural Credit Gap',
                desc: 'The country faces an estimated ₱366.6 billion agricultural credit gap, severely restricting capital flow and leaving rural development heavily underfunded.',
                icon: AlertTriangle,
                color: '#dc2626',
              },
              {
                metric: '73%',
                title: 'Growers Unbanked',
                desc: '73% of agricultural workers remain completely unbanked, excluded from traditional institutional interest rates, and lacking proper financial identities.',
                icon: Users,
                color: '#ef4444',
              },
              {
                metric: 'Informal',
                title: 'Reliance on Informal Lenders',
                desc: 'Smallholder farmers rely heavily on high-interest informal lenders because banks demand collateral, land deeds, and historical cash flows that rural farmers cannot produce.',
                icon: HelpCircle,
                color: '#f59e0b',
              },
            ].map(({ metric, title, desc, icon: Icon, color }) => (
              <div key={title} style={{
                background: 'var(--color-card)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.25s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 38, height: 38,
                    background: `${color}10`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 900, color, fontFamily: 'monospace' }}>{metric}</strong>
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Effectiveness of Blockchain in Agriculture Section - Dual Column Split with Picture */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'var(--color-surface-2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 900,
              backgroundColor: 'rgba(22, 92, 45, 0.08)',
              color: 'var(--color-primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Academic Evidence
            </span>
            <h2 style={{
              fontSize: '2rem', fontWeight: 900,
              marginTop: '0.75rem', marginBottom: '0.75rem',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
            }}>
              Effectiveness of Blockchain in Agriculture
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Proven empirical metrics supporting smart contract automation and decentralized telemetry tracking.
            </p>
          </div>

          {/* Square split container */}
          <div className="landing-split-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'stretch',
          }}>
            {/* Left Part: 4 academic cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              {[
                {
                  author: 'Nguyen Thi Thoi & M. Kavitha (2025)',
                  stats: ['📈 20% increase in farmer income', '🤝 Reduced middlemen & marketing exploitation'],
                  bg: '#165c2d10', border: 'rgba(22,92,45,0.15)'
                },
                {
                  author: 'Aen Fariah (2025)',
                  stats: ['🔍 95% improvement in food supply traceability', '⚡ 15% increase in operations efficiency & 25% cost reduction'],
                  bg: '#2563eb10', border: 'rgba(37,99,235,0.15)'
                },
                {
                  author: 'Acarya et al. (2024)',
                  stats: ['🛡️ Improved peer-to-peer trust and system transparency', '🤖 High-efficiency smart contract escrow automation'],
                  bg: '#fbbf2415', border: 'rgba(251,191,36,0.2)'
                },
                {
                  author: 'Kamilaris et al. (2023)',
                  stats: ['Clearer parametric transparency for climate indicators', '📢 Reduced information asymmetry among rural growers'],
                  bg: '#a855f710', border: 'rgba(168,85,247,0.15)'
                }
              ].map(({ author, stats, bg, border }) => (
                <div key={author} style={{
                  background: 'var(--color-card)',
                  border: `1.5px solid ${border}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem 1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={14} color="var(--color-primary)" />
                    {author}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1rem', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {stats.map((s, idx) => (
                      <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right Part: Square layout with large picture */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1.5px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}>
              <div style={{ flex: 1, position: 'relative', minHeight: '260px' }}>
                <img
                  src="/farmer pic 2.jpg"
                  alt="Telemetry-based farming verification"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
                }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
                  <span style={{
                    fontSize: '0.55rem',
                    fontWeight: 900,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                  }}>
                    Parametric Ledger Integration
                  </span>
                  <p style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 700, margin: '0.25rem 0 0 0' }}>
                    Stellar Parametric Oracle Audits
                  </p>
                </div>
              </div>
              <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  Trustless Asset Verification
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  By feeding telemetry variables (precipitation, humidity) directly into Soroban smart contracts, settlements are triggered automatically without intermediaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Trust Features Grid with real Filipino Farmer images */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 900,
              backgroundColor: 'rgba(27,67,50,0.08)',
              color: 'var(--color-primary-dark)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Decentralized System
            </span>
            <h2 style={{
              fontSize: '2rem', fontWeight: 900,
              marginTop: '0.75rem', marginBottom: '0.75rem',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
            }}>
              Built for Absolute Trust
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Securing agricultural asset tokenization with standard protocols and cryptographic proof.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}>
            {/* Left columns: Feature grid items */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {[
                { icon: Shield, title: 'Soroban Escrow escrows', desc: 'Secure smart contract logic controls all asset capital payouts automatically.', color: '#1B4332', bg: 'rgba(27,67,50,0.06)' },
                { icon: TrendingUp, title: 'Parametric PayFi Settlements', desc: 'Auto payouts trigger proportionally to asset ownership based on harvest telemetry.', color: '#2563eb', bg: 'rgba(59,130,246,0.06)' },
                { icon: Users, title: 'W3C Verifiable Credentials (VC)', desc: 'Identity anchored on-chain ensuring robust compliance under secure SEP standards.', color: '#d97706', bg: 'rgba(249,173,0,0.06)' },
                { icon: Sprout, title: 'Philippine Highlands Onboarding', desc: 'Highland crop certifications mapped transparently for verified global funding.', color: '#16a34a', bg: 'rgba(34,197,94,0.06)' },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} style={{
                  background: 'var(--color-card)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 38, height: 38, background: bg,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text)' }}>{title}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: Farmer collage display representing built-for-trust */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ height: '140px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src="/farmer pic 3.jpg" alt="Benguet Farmer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ height: '180px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src="/farmer pic 4.jpg" alt="Strawberry Grower" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <div style={{ height: '180px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src="/farmer pic 5.jpg" alt="Cabbage Farmer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Connect Wallet & Invest */}
      <section style={{ padding: '4.5rem 1.5rem 5.5rem', background: 'var(--color-surface-2)', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Ready to Invest?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Connect your Freighter wallet and start funding Philippine farms today.
          </p>
          <button
            id="landing-final-cta"
            onClick={handleWalletAuth}
            disabled={isConnecting}
            className="btn btn-primary btn-full btn-lg"
            style={{
              padding: '1rem',
              fontSize: '0.85rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
              color: '#ffffff',
              boxShadow: '0 6px 20px rgba(22, 92, 45, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {isConnecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating Wallet...</span>
              </>
            ) : (
              <>
                <Cpu size={18} />
                <span>Connect & Start Investing</span>
              </>
            )}
          </button>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '1.25rem', marginBottom: 0 }}>
            Powered by USDC stablecoin on the Stellar Decentralized Network.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-primary-dark)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>G.A.P.A.S.</p>
        <p style={{ margin: 0 }}>Global Agricultural Payment & Asset Settlement Platform</p>
        <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>Built on Stellar + Soroban · Secured under W3C Verifiable Credentials standards</p>
      </footer>
    </div>
  )
}

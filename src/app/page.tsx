'use client'

import { useState, useEffect } from 'react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'
import WalletConnect from '@/components/WalletConnect'
import Link from 'next/link'
import { Shield, TrendingUp, Users, Sprout, ChevronDown } from 'lucide-react'

export default function LandingPage() {
  const { isConnected } = useGapasStore()
  const router = useRouter()
  const [showConnect, setShowConnect] = useState(false)

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      overflowX: 'hidden',
    }}>
      {/* Hero Section */}
      <section style={{
        background: 'var(--gradient-hero)',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG circles */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-30%',
          width: '70vw', height: '70vw', maxWidth: 400,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-20%',
          width: '60vw', height: '60vw', maxWidth: 350,
          background: 'rgba(249,173,0,0.06)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          {/* Logo */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-full)',
            padding: '0.5rem 1rem',
            marginBottom: '2rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🌾</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.1em' }}>
              GAPAS
            </span>
            <span style={{
              background: 'rgba(249,173,0,0.25)',
              color: '#f9ad00',
              fontSize: '0.625rem', fontWeight: 700,
              padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              TESTNET
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '1rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Fund Farms.<br />
            Earn Returns.<br />
            <span style={{ color: '#f9ad00' }}>On Blockchain.</span>
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.65,
            marginBottom: '2rem',
            maxWidth: 400,
          }}>
            GAPAS connects Filipino farmers with investors through Stellar blockchain and Soroban smart contracts — transparent, automated, and trustless.
          </p>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.625rem', marginBottom: '2rem',
          }}>
            {[
              { value: '₱2.4M+', label: 'Funded' },
              { value: '120+', label: 'Farms' },
              { value: '98%', label: 'Success' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 0.5rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!showConnect ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                id="landing-connect-btn"
                onClick={() => setShowConnect(true)}
                className="btn btn-amber btn-full btn-lg"
              >
                🌾 Get Started — Connect Wallet
              </button>
              <Link
                href="/farms"
                id="landing-browse-btn"
                className="btn btn-full"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9375rem', fontWeight: 600,
                  padding: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', textDecoration: 'none',
                }}
              >
                <Sprout size={18} /> Browse Farms
              </Link>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }} className="animate-scale-in">
              <WalletConnect onSuccess={() => router.push('/dashboard')} />
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
          color: 'rgba(255,255,255,0.4)', animation: 'pulse 2s infinite',
        }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '3.5rem 1.5rem', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1.75rem', fontWeight: 900,
            textAlign: 'center', marginBottom: '0.5rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            How GAPAS Works
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '2.5rem', fontSize: '0.9375rem' }}>
            Simple for farmers. Transparent for investors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                step: '01',
                title: 'Farmer Creates Farm',
                desc: 'A farmer submits their farm — crop type, funding goal, and expected yield. A cooperative can assist with verification.',
                icon: '🌱',
                color: '#1B4332',
              },
              {
                step: '02',
                title: 'Investors Fund via USDC',
                desc: 'Investors browse the marketplace and fund farms using USDC on Stellar. Funds are locked in a Soroban smart contract.',
                icon: '💰',
                color: '#2563eb',
              },
              {
                step: '03',
                title: 'Smart Contract Releases',
                desc: 'After harvest, the Soroban contract auto-distributes profit: 69% farmer, 30% investors, 1% cooperative.',
                icon: '⚡',
                color: '#d97706',
              },
              {
                step: '04',
                title: 'Cash Out to PHP',
                desc: 'Investors convert USDC to PHP via GCash, Maya, or bank transfer. Everything on-chain, fully transparent.',
                icon: '📱',
                color: '#16a34a',
              },
            ].map(({ step, title, desc, icon, color }, i) => (
              <div key={step} style={{
                display: 'flex', gap: '1rem',
                padding: '1.25rem',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 52, height: 52,
                  background: `${color}15`,
                  border: `1.5px solid ${color}30`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '1.5rem',
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{step}</span>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{title}</h3>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cooperative Section */}
      <section style={{ padding: '3rem 1.5rem', background: 'var(--color-surface-2)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            background: 'var(--gradient-hero)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 1.5rem',
            color: '#fff',
          }}>
            <span style={{ fontSize: '2rem' }}>🤝</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.75rem', marginBottom: '0.5rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Cooperative System
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Barangay cooperatives help farmers register, tokenize assets, and onboard to blockchain. In return, they earn <strong style={{ color: '#f9ad00' }}>1% of total farm profit</strong>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {[
                { pct: '69%', label: 'Farmer', color: '#fff' },
                { pct: '30%', label: 'Investors', color: '#93c5fd' },
                { pct: '1%', label: 'Cooperative', color: '#f9ad00' },
              ].map(({ pct, label, color }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 0.5rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 900, color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{pct}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/cooperative"
              id="landing-coop-btn"
              className="btn btn-amber btn-full"
            >
              Explore Cooperatives
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '3.5rem 1.5rem', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1.75rem', fontWeight: 900,
            textAlign: 'center', marginBottom: '2rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Built for Trust
          </h2>
          <div className="grid-responsive-2" style={{ gap: '0.875rem' }}>
            {[
              { icon: Shield, title: 'Soroban Escrow', desc: 'Smart contracts hold funds. No manual withdrawals.', color: '#1B4332', bg: 'rgba(27,67,50,0.08)' },
              { icon: TrendingUp, title: 'Auto Payouts', desc: 'Profit distributed automatically after harvest.', color: '#2563eb', bg: 'rgba(59,130,246,0.08)' },
              { icon: Users, title: 'Freighter Wallet', desc: 'Your wallet is your identity. No email needed.', color: '#d97706', bg: 'rgba(249,173,0,0.08)' },
              { icon: Sprout, title: 'Crops & Livestock', desc: 'Rice, corn, hogs, poultry, and more.', color: '#16a34a', bg: 'rgba(34,197,94,0.08)' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 44, height: 44, background: bg,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.375rem' }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '3rem 1.5rem 4rem', background: 'var(--color-surface-2)', textAlign: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Ready to Invest?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
            Connect your Freighter wallet and start funding Philippine farms today.
          </p>
          <button
            id="landing-final-cta"
            onClick={() => setShowConnect(true)}
            className="btn btn-primary btn-full btn-lg"
          >
            🌾 Connect & Start Investing
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            Requires Freighter browser extension · Stellar Testnet
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-primary-dark)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.8125rem',
      }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>🌾 GAPAS</p>
        <p>Global Agricultural Payment & Asset Settlement</p>
        <p style={{ marginTop: '0.375rem' }}>Built on Stellar + Soroban · Powered by USDC</p>
      </footer>
    </div>
  )
}

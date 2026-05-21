'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Wallet, BarChart3, User, LogOut, FileText, ClipboardList, Menu, X, Store, Sprout } from 'lucide-react'
import { useGapasStore } from '@/store/useGapasStore'

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { activeRole, switchRole, setWalletDisconnected, showToast } = useGapasStore()
  const router = useRouter()

  function handleLogout() {
    setIsOpen(false)
    setWalletDisconnected()
    showToast('Logged out successfully', 'info')
    router.push('/')
  }

  const handleRoleChange = (role: 'FARMER' | 'COOPERATIVE') => {
    switchRole(role as any)
    showToast(`Switched to ${role.charAt(0) + role.slice(1).toLowerCase()} Context`, 'success')
    
    const newItems = role === 'FARMER'
      ? ['/dashboard', '/farms', '/portfolio', '/wallet', '/cooperative', '/dao', '/profile']
      : ['/cooperative', '/wallet', '/dao', '/profile']
      
    if (!newItems.includes(pathname)) {
      router.push(newItems[0])
    }
  }

  // Determine nav items based on role
  const getNavItems = () => {
    switch (activeRole) {
      case 'COOPERATIVE':
        return [
          { href: '/cooperative', icon: ClipboardList, label: 'Ticketing Desk' },
          { href: '/wallet', icon: Wallet, label: 'Coop Wallet' },
          { href: '/farms', icon: Store, label: 'Marketplace' },
          { href: '/profile', icon: User, label: 'Coop Profile' },
        ]
      case 'FARMER':
      default:
        return [
          { href: '/dashboard', icon: Home, label: 'Dashboard' },
          { href: '/farms', icon: Store, label: 'Marketplace' },
          { href: '/portfolio', icon: BarChart3, label: 'My Activities' },
          { href: '/wallet', icon: Wallet, label: 'Wallet' },
          { href: '/cooperative', icon: ClipboardList, label: 'Cooperative' },
          { href: '/dao', icon: FileText, label: 'Proposals' },
          { href: '/profile', icon: User, label: 'Profile' },
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Top Header Bar */}
      <header className="mobile-header">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(27,67,50,0.08)', padding: '6px', borderRadius: '8px' }}>
            <Sprout size={20} style={{ color: 'var(--color-primary)' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', letterSpacing: '0.03em' }}>
            GAPAS
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Active Context Mini-Badge */}
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            background: activeRole === 'COOPERATIVE' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(27, 67, 50, 0.12)',
            color: activeRole === 'COOPERATIVE' ? 'var(--color-info)' : 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {activeRole === 'COOPERATIVE' ? 'Coop' : 'Farmer'}
          </span>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background 0.2s ease',
            }}
            aria-label="Open menu"
            onPointerDown={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'}
            onPointerUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Drawer Overlay */}
      <div 
        className={`mobile-drawer-overlay${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Menu */}
      <aside className={`mobile-drawer${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sprout size={20} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
              GAPAS MENU
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Premium Switcher Panel */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            letterSpacing: '0.1em', 
            color: 'var(--color-text-muted)', 
            textTransform: 'uppercase',
            marginBottom: '0.5rem' 
          }}>
            Workspace Context
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={activeRole === 'INVESTOR' ? 'FARMER' : activeRole}
              onChange={(e) => handleRoleChange(e.target.value as any)}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-surface-2)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                padding: '0.6rem 2rem 0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.8rem',
                cursor: 'pointer',
                appearance: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="FARMER" style={{ color: 'var(--color-text)' }}>Farmer Mode</option>
              <option value="COOPERATIVE" style={{ color: 'var(--color-text)' }}>Cooperative Mode</option>
            </select>
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '0.8rem',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--color-primary)',
              fontSize: '0.8rem'
            }}>
              ▼
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Menu Options
          </div>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard')
            return (
              <Link
                key={href}
                href={href}
                id={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '0.75rem 0.875rem',
                  fontSize: '0.9rem',
                }}
              >
                <Icon size={18} className="sidebar-nav-icon" strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout button at bottom */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: 'auto' }}>
          <button 
            className="sidebar-nav-item" 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.75rem 0.875rem', fontSize: '0.9rem' }} 
            onClick={handleLogout}
          >
            <LogOut size={18} className="sidebar-nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

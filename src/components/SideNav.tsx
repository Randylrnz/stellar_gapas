'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sprout, Wallet, BarChart3, User, LogOut, Gavel, FileText, ClipboardList } from 'lucide-react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'

export default function SideNav() {
  const pathname = usePathname()
  const { activeRole, switchRole, setWalletDisconnected, showToast } = useGapasStore()
  const router = useRouter()

  function handleLogout() {
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
          { href: '/dao', icon: Gavel, label: 'Samahan ng Magsasaka' },
          { href: '/profile', icon: User, label: 'Coop Profile' },
        ]
      case 'FARMER':
      default:
        return [
          { href: '/dashboard', icon: Home, label: 'Dashboard' },
          { href: '/farms', icon: Sprout, label: 'Palengke' },
          { href: '/portfolio', icon: BarChart3, label: 'My Activities' },
          { href: '/wallet', icon: Wallet, label: 'Wallet' },
          { href: '/cooperative', icon: ClipboardList, label: 'Cooperative' },
          { href: '/dao', icon: Gavel, label: 'Samahan ng Magsasaka' },
          { href: '/profile', icon: User, label: 'Profile' },
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Sprout size={24} style={{ color: 'var(--color-primary)' }} />
        </span>
        <span className="sidebar-logo-text">GAPAS</span>
      </div>

      {/* Premium Switcher Panel */}
      <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
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

      <nav className="sidebar-nav">
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu Options
        </div>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/dashboard')
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={20} className="sidebar-nav-icon" strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={handleLogout}>
          <LogOut size={20} className="sidebar-nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

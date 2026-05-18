'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sprout, Wallet, BarChart3, User, LogOut } from 'lucide-react'
import { useGapasStore } from '@/store/useGapasStore'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/farms', icon: Sprout, label: 'Marketplace' },
  { href: '/portfolio', icon: BarChart3, label: 'Portfolio' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/profile', icon: User, label: 'Settings' },
]

export default function SideNav() {
  const pathname = usePathname()
  const { setWalletDisconnected, showToast } = useGapasStore()
  const router = useRouter()

  function handleLogout() {
    setWalletDisconnected()
    showToast('Logged out', 'info')
    router.push('/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🌾</span>
        <span className="sidebar-logo-text">GAPAS</span>
      </div>

      <nav className="sidebar-nav">
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu
        </div>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/') && href !== '/dashboard'
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sprout, Wallet, BarChart3, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/farms', icon: Sprout, label: 'Farms' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/portfolio', icon: BarChart3, label: 'Portfolio' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            id={`nav-${label.toLowerCase()}`}
            className={`nav-item${isActive ? ' active' : ''}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-item-icon">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </span>
            <span className="nav-item-label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

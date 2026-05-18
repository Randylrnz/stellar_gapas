import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'GAPAS — Global Agricultural Payment & Asset Settlement',
    template: '%s | GAPAS',
  },
  description:
    'Blockchain-based agricultural finance platform built on Stellar + Soroban. Connecting farmers, investors, and cooperatives through transparent funding and automated USDC profit distribution.',
  keywords: [
    'agricultural finance',
    'blockchain',
    'stellar',
    'soroban',
    'USDC',
    'farm funding',
    'cooperative',
    'Philippines',
  ],
  authors: [{ name: 'GAPAS Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    siteName: 'GAPAS',
    title: 'GAPAS — Global Agricultural Payment & Asset Settlement',
    description:
      'Fund farms, earn returns. Blockchain-powered agricultural finance on Stellar.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B4332',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

'use client'

import { useGapasStore } from '@/store/useGapasStore'
import { CheckCircle, XCircle, Info } from 'lucide-react'

export default function Toast() {
  const toast = useGapasStore((s) => s.toast)
  const clearToast = useGapasStore((s) => s.clearToast)

  if (!toast) return null

  const icons = {
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />,
    info: <Info size={16} />,
  }

  const colors = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#1B4332',
  }

  return (
    <div
      className="toast animate-fade-in-up"
      style={{ background: colors[toast.type] }}
      onClick={clearToast}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <span>{toast.message}</span>
    </div>
  )
}

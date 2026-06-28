'use client'

import type { ToastState } from '@/lib/types'

interface ToastProps {
  toast: ToastState
}

export default function Toast({ toast }: ToastProps) {
  if (!toast.show) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] flex items-center gap-[9px] px-[18px] py-3 rounded-[14px] text-[14px] font-semibold text-white animate-toastIn"
      style={{
        transform: 'translateX(-50%)',
        background: toast.kind === 'ok' ? '#6E8483' : '#A8736D',
        boxShadow: '0 12px 30px -10px rgba(80,60,50,.55)',
        whiteSpace: 'nowrap',
      }}
    >
      {toast.kind === 'ok' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>
        </svg>
      )}
      {toast.msg}
    </div>
  )
}

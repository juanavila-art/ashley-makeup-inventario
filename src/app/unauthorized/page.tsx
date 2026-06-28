'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UnauthorizedContent() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#FBF3E9' }}
    >
      <div className="w-full max-w-sm text-center animate-mdIn">
        {/* Ícono */}
        <div
          className="w-[68px] h-[68px] rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#F7DBD6' }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C0635C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9.5"/>
            <path d="M12 8v5M12 16h.01"/>
          </svg>
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#5A4A43',
          }}
        >
          Acceso no autorizado
        </div>

        <div className="text-[13.5px] mt-3 mb-6 leading-relaxed" style={{ color: '#8A7E76' }}>
          La cuenta{' '}
          {email && (
            <strong style={{ color: '#4A3F39' }}>{email}</strong>
          )}{' '}
          no tiene acceso a esta aplicación.
          <br />
          Contacta a la dueña del negocio.
        </div>

        <button
          onClick={handleLogout}
          className="w-full h-[48px] rounded-[13px] font-semibold text-[14.5px] cursor-pointer transition-opacity hover:opacity-80"
          style={{
            background: '#A8736D',
            color: '#fff',
            border: 'none',
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense>
      <UnauthorizedContent />
    </Suspense>
  )
}

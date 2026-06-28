'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(120% 90% at 50% 0%, #FFE3D8 0%, #FBF3E9 60%)',
      }}
    >
      <div className="w-full max-w-sm text-center animate-mdIn">
        {/* Logo */}
        <div
          className="w-[74px] h-[74px] rounded-[22px] mx-auto mb-[22px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(150deg, #C99892, #A8736D)',
            boxShadow: '0 14px 34px -12px rgba(168,115,109,.6)',
          }}
        >
          <span
            className="text-white leading-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 38 }}
          >
            A
          </span>
        </div>

        {/* Título */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: '.5px',
            color: '#5A4A43',
          }}
        >
          Ashley{' '}
          <span style={{ opacity: 0.5, fontWeight: 500 }}>makeup</span>
        </div>
        <div className="text-[13.5px] mt-[6px] mb-[30px]" style={{ color: '#9A8C82' }}>
          Control de inventario y ventas
        </div>

        {/* Botón Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-[52px] flex items-center justify-center gap-3 rounded-[14px] cursor-pointer text-[15px] font-semibold disabled:opacity-60 transition-opacity"
          style={{
            border: '1px solid #EAD9CB',
            background: '#fff',
            color: '#5A4A43',
            boxShadow: '0 6px 18px -10px rgba(120,90,70,.4)',
          }}
        >
          {loading ? (
            <span
              className="w-5 h-5 rounded-full border-2 border-[#A8736D] border-t-transparent animate-spin"
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.3 13.2 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.7 7l7.6 5.9c4.4-4.1 7-10.1 7-17.4z"/>
              <path fill="#FBBC05" d="M10.5 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3l-7.9-6.1C1 16.7 0 20.2 0 24s1 7.3 2.6 10.4l7.9-6.1z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.7 2.3-6.4 0-11.7-3.7-13.5-9.1l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
            </svg>
          )}
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>
      </div>
    </div>
  )
}

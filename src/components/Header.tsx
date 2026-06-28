'use client'

import type { AppUser, TabId } from '@/lib/types'

interface HeaderProps {
  user: AppUser
  periodoNum: number
  onLogout: () => void
}

export default function Header({ user, periodoNum, onLogout }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
      style={{
        background: 'rgba(251,243,233,.86)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0E1D5',
      }}
    >
      {/* Logo */}
      <div
        className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(150deg, #C99892, #A8736D)' }}
      >
        <span
          className="text-white leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 21 }}
        >
          A
        </span>
      </div>

      {/* Nombre + email */}
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 19,
            fontWeight: 600,
            lineHeight: 1,
            color: '#5A4A43',
          }}
        >
          Ashley{' '}
          <span style={{ opacity: 0.45, fontWeight: 500 }}>makeup</span>
        </div>
        <div
          className="text-[11.5px] mt-[3px] truncate"
          style={{ color: '#A2948A' }}
        >
          {user.email} · {user.role === 'owner' ? 'Dueña' : 'Empleada'}
        </div>
      </div>

      {/* Período badge + logout */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[11px] font-semibold px-[10px] py-[6px] rounded-full whitespace-nowrap"
          style={{ color: '#A8736D', background: '#F4D5D2' }}
        >
          Período {periodoNum}
        </span>
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center cursor-pointer hover:bg-[#F4EDE5] transition-colors"
          style={{ border: '1px solid #EAD9CB', background: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7E76" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <path d="M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

'use client'

import type { TabId, UserRole } from '@/lib/types'

interface NavigationProps {
  activeTab: TabId
  role: UserRole
  onTabChange: (tab: TabId) => void
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-[7px] px-[14px] py-[9px] rounded-[12px] text-[13.5px] font-semibold whitespace-nowrap flex-shrink-0 transition-all cursor-pointer"
      style={{
        border: 'none',
        background: active ? '#fff' : 'transparent',
        color: active ? '#A8736D' : '#8A7E76',
        boxShadow: active ? '0 4px 14px -8px rgba(120,90,70,.5)' : 'none',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

export default function Navigation({ activeTab, role, onTabChange }: NavigationProps) {
  return (
    <nav
      className="sticky z-20 flex gap-1 px-3 py-2 overflow-x-auto scrl"
      style={{
        top: 63,
        background: 'rgba(251,243,233,.86)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0E1D5',
      }}
    >
      <TabButton
        active={activeTab === 1}
        onClick={() => onTabChange(1)}
        label="Vender"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>
            <path d="M2 3h2.2l2.3 12.5a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6"/>
          </svg>
        }
      />
      <TabButton
        active={activeTab === 2}
        onClick={() => onTabChange(2)}
        label="Inventario"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8l-9-5-9 5v8l9 5 9-5z"/>
            <path d="M3.3 7L12 12l8.7-5M12 22V12"/>
          </svg>
        }
      />
      {role === 'owner' && (
        <TabButton
          active={activeTab === 3}
          onClick={() => onTabChange(3)}
          label="Recarga"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 3h13v11H1z"/>
              <path d="M14 7h4l3 3v4h-7z"/>
              <circle cx="6" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>
            </svg>
          }
        />
      )}
      {role === 'owner' && (
        <TabButton
          active={activeTab === 4}
          onClick={() => onTabChange(4)}
          label="Panel"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <rect x="7" y="11" width="3" height="6"/>
              <rect x="13" y="7" width="3" height="10"/>
            </svg>
          }
        />
      )}
    </nav>
  )
}

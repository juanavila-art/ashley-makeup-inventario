'use client'

import { useState, useMemo } from 'react'
import type { Producto, Recarga } from '@/lib/types'
import { money, formatHHMM, formatShort, stockStatus, BADGE, sortByUrgency, filterProducts, uniqueCategories } from '@/lib/helpers'

interface TabRecargaProps {
  productos: Producto[]
  recargas: Recarga[]
  onApply: (items: { productoId: string; cantidad: number }[]) => Promise<void>
}

export default function TabRecarga({ productos, recargas, onApply }: TabRecargaProps) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const cats = useMemo(() => uniqueCategories(productos), [productos])
  const filtered = useMemo(
    () => sortByUrgency(filterProducts(productos.filter(p => p.activo), search, cat)),
    [productos, search, cat]
  )

  const canApply = Object.values(inputs).some(v => parseInt(v || '0', 10) > 0)

  async function handleApply() {
    if (!canApply || saving) return
    const items = Object.entries(inputs)
      .filter(([, v]) => parseInt(v || '0', 10) > 0)
      .map(([productoId, v]) => ({ productoId, cantidad: parseInt(v, 10) }))
    setSaving(true)
    await onApply(items)
    setInputs({})
    setSaving(false)
  }

  const historial = useMemo(() => [...recargas].reverse(), [recargas])

  return (
    <div>
      <div className="mb-[14px]">
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 600, color: '#5A4A43' }}>
          Recarga de inventario
        </div>
        <div className="text-[12.5px] mt-[2px]" style={{ color: '#A2948A' }}>
          Escribe cuántas unidades entraron de cada producto.
        </div>
      </div>

      {/* Búsqueda + categoría */}
      <div className="flex gap-[9px] mb-[14px]">
        <div className="flex-1 relative">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B6A89D" strokeWidth="2" strokeLinecap="round" className="absolute left-[13px] top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full h-[46px] rounded-[13px] pl-[38px] pr-[14px] text-[14px]"
            style={{ border: '1px solid #F0E1D5', background: '#fff', color: '#4A3F39' }}
          />
        </div>
        <select
          value={cat}
          onChange={e => setCat(e.target.value)}
          className="h-[46px] rounded-[13px] px-[12px] text-[13.5px] cursor-pointer max-w-[140px]"
          style={{ border: '1px solid #F0E1D5', background: '#fff', color: '#4A3F39' }}
        >
          <option value="all">Todas</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-[14px]" style={{ color: '#B6A89D' }}>
          No se encontraron productos.
        </div>
      )}

      <div className="flex flex-col gap-[8px]">
        {filtered.map(p => {
          const st = stockStatus(p)
          const badge = BADGE[st]
          const val = inputs[p.id] || ''
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-[14px] p-[11px_13px]"
              style={{ background: '#fff', border: '1px solid #F0E1D5' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold truncate" style={{ color: '#4A3F39' }}>
                  {p.nombre}
                </div>
                <div className="flex items-center gap-2 mt-[3px]">
                  <span className="text-[11.5px]" style={{ color: '#A2948A' }}>Stock: {p.stock}</span>
                  <span
                    className="text-[11px] font-bold px-[8px] py-[2px] rounded-full whitespace-nowrap"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
              <input
                value={val}
                onChange={e => setInputs(prev => ({ ...prev, [p.id]: e.target.value.replace(/[^0-9]/g, '') }))}
                inputMode="numeric"
                placeholder="+0"
                className="w-[62px] h-[44px] rounded-[12px] text-center text-[16px] font-bold"
                style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#A8736D' }}
              />
            </div>
          )
        })}
      </div>

      {/* Botón sticky */}
      <div className="sticky bottom-4 mt-4">
        <button
          onClick={handleApply}
          disabled={!canApply || saving}
          className="w-full h-[50px] rounded-[14px] font-bold text-[15px] text-white cursor-pointer disabled:cursor-not-allowed transition-all"
          style={{
            border: 'none',
            background: canApply ? '#A8736D' : '#DCCFC3',
            boxShadow: canApply ? '0 8px 20px -10px rgba(168,115,109,.7)' : 'none',
          }}
        >
          {saving ? 'Aplicando...' : 'Aplicar recarga al inventario'}
        </button>
      </div>

      {/* Historial de recargas */}
      {historial.length > 0 && (
        <div className="mt-[26px]">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#5A4A43', marginBottom: 10 }}>
            Historial de recargas
          </div>
          <div className="flex flex-col gap-[8px]">
            {historial.map(r => {
              const items = r.detalle_recargas ?? []
              const detail = items.map(i => `${i.productos?.nombre ?? '?'} +${i.cantidad}`).join(' · ')
              return (
                <div
                  key={r.id}
                  className="rounded-[13px] p-[12px_14px]"
                  style={{ background: '#fff', border: '1px solid #F0E1D5' }}
                >
                  <div className="flex items-center justify-between mb-[5px]">
                    <span className="text-[12.5px] font-bold" style={{ color: '#6E8483' }}>
                      {formatShort(r.creado_en)}/{new Date(r.creado_en).getFullYear()} · {formatHHMM(r.creado_en)}
                    </span>
                    <span className="text-[11px]" style={{ color: '#A2948A' }}>
                      {items.length} producto(s)
                    </span>
                  </div>
                  <div className="text-[12.5px] leading-[1.5]" style={{ color: '#8A7E76' }}>
                    {detail}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

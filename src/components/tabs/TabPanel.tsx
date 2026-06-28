'use client'

import { useState, useMemo } from 'react'
import type { Producto, Venta, Periodo } from '@/lib/types'
import { money, formatDMY, formatHHMM, formatShort, stockStatus, roleLabel } from '@/lib/helpers'

interface TabPanelProps {
  productos: Producto[]
  ventas: Venta[]
  periodos: Periodo[]
  periodoActual: Periodo | null
  periodoLabel: string
  onAnnulSale: (ventaId: string) => Promise<void>
  onClosePeriod: (contado: number | null) => Promise<void>
  onLoadPeriodSales: (periodoId: string) => Promise<Venta[]>
}

export default function TabPanel({
  productos, ventas, periodos, periodoActual, periodoLabel,
  onAnnulSale, onClosePeriod, onLoadPeriodSales,
}: TabPanelProps) {
  const [counted, setCounted] = useState('')
  const [annulTarget, setAnnulTarget] = useState<string | null>(null)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [detailPeriodo, setDetailPeriodo] = useState<Periodo | null>(null)
  const [detailVentas, setDetailVentas] = useState<Venta[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function openPeriodDetail(periodo: Periodo) {
    setDetailPeriodo(periodo)
    setLoadingDetail(true)
    const vts = await onLoadPeriodSales(periodo.id)
    setDetailVentas(vts)
    setLoadingDetail(false)
  }

  // Métricas
  const activeVentas = ventas.filter(v => !v.anulada)
  const totalVendido = activeVentas.reduce((a, v) => a + v.total_venta, 0)
  const totalUnidades = activeVentas.reduce(
    (a, v) => a + (v.detalle_ventas?.reduce((b, d) => b + d.cantidad, 0) ?? 0),
    0
  )
  const lowCount = productos.filter(p => p.stock > 0 && p.stock <= p.alerta).length
  const outCount = productos.filter(p => p.stock <= 0).length

  // Cuadre de caja
  const countedNum = counted === '' ? null : parseInt(counted, 10)
  let cajaLabel = 'Ingresa el dinero contado'
  let cajaColor = '#8A7E76'
  let cajaBg = '#FBF3E9'
  let cajaSub = ''
  if (countedNum !== null) {
    const diff = countedNum - totalVendido
    if (diff === 0) {
      cajaLabel = 'Caja cuadrada'
      cajaColor = '#5E8268'; cajaBg = '#E5EFE7'
      cajaSub = 'El conteo coincide con lo esperado.'
    } else if (diff < 0) {
      cajaLabel = `Faltan ${money(-diff)}`
      cajaColor = '#C0635C'; cajaBg = '#F7DBD6'
      cajaSub = 'Revisar con la empleada.'
    } else {
      cajaLabel = `Sobran ${money(diff)}`
      cajaColor = '#5E8268'; cajaBg = '#E5EFE7'
      cajaSub = 'Puede haber una venta no registrada.'
    }
  }

  // Historial ventas (todas)
  const allVentas = useMemo(() => [...ventas].reverse(), [ventas])
  const closedPeriods = useMemo(() => [...periodos].reverse(), [periodos])

  return (
    <div>
      <div className="mb-4">
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 600, color: '#5A4A43' }}>
          Panel de la dueña
        </div>
        <div className="text-[12.5px] mt-[2px]" style={{ color: '#A2948A' }}>{periodoLabel}</div>
      </div>

      {/* A: Métricas */}
      <div className="grid grid-cols-2 gap-[11px] mb-[22px]">
        <div className="rounded-[16px] p-[15px]" style={{ background: 'linear-gradient(140deg, #A8736D, #C99892)', color: '#fff' }}>
          <div className="text-[11px] font-semibold uppercase tracking-[.5px]" style={{ opacity: .85 }}>Total vendido</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginTop: 4, lineHeight: 1 }}>
            {money(totalVendido)}
          </div>
        </div>
        <div className="rounded-[16px] p-[15px]" style={{ background: '#fff', border: '1px solid #F0E1D5' }}>
          <div className="text-[11px] font-semibold uppercase tracking-[.5px]" style={{ color: '#A2948A' }}>Unidades vendidas</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginTop: 4, lineHeight: 1, color: '#4A3F39' }}>
            {totalUnidades}
          </div>
        </div>
        <div className="rounded-[16px] p-[15px]" style={{ background: '#FBEBCF' }}>
          <div className="text-[11px] font-semibold uppercase tracking-[.5px]" style={{ color: '#B0822C' }}>Stock bajo</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginTop: 4, lineHeight: 1, color: '#B0822C' }}>
            {lowCount}
          </div>
        </div>
        <div className="rounded-[16px] p-[15px]" style={{ background: '#F7DBD6' }}>
          <div className="text-[11px] font-semibold uppercase tracking-[.5px]" style={{ color: '#C0635C' }}>Agotados</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginTop: 4, lineHeight: 1, color: '#C0635C' }}>
            {outCount}
          </div>
        </div>
      </div>

      {/* B: Cuadre de caja */}
      <div className="rounded-[18px] p-[17px] mb-[22px]" style={{ background: '#fff', border: '1px solid #F0E1D5' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#5A4A43', marginBottom: 4 }}>
          Cuadre de caja
        </div>
        <div className="text-[12px] mb-[14px]" style={{ color: '#A2948A' }}>
          {periodoLabel} · desde {periodoActual ? formatDMY(periodoActual.inicio) : '—'}
        </div>
        <div
          className="flex items-center justify-between py-[11px]"
          style={{ borderBottom: '1px solid #F5EADF' }}
        >
          <span className="text-[13.5px]" style={{ color: '#8A7E76' }}>Dinero esperado en caja</span>
          <span className="text-[17px] font-bold" style={{ color: '#4A3F39' }}>{money(totalVendido)}</span>
        </div>
        <div className="mt-[14px]">
          <label className="text-[12.5px] font-semibold block mb-[6px]" style={{ color: '#8A7E76' }}>
            Dinero físico contado
          </label>
          <div className="relative">
            <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[16px] font-bold" style={{ color: '#B6A89D' }}>$</span>
            <input
              value={counted}
              onChange={e => setCounted(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="0"
              className="w-full h-[48px] rounded-[13px] pl-[28px] pr-[14px] text-[17px] font-bold"
              style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#4A3F39' }}
            />
          </div>
        </div>
        <div className="rounded-[13px] p-[14px_16px] mt-3" style={{ background: cajaBg }}>
          <div className="text-[16px] font-bold" style={{ color: cajaColor }}>{cajaLabel}</div>
          {cajaSub && <div className="text-[12.5px] mt-[3px]" style={{ color: cajaColor, opacity: .8 }}>{cajaSub}</div>}
        </div>
        <button
          onClick={() => activeVentas.length > 0 && setShowCloseModal(true)}
          disabled={activeVentas.length === 0}
          className="w-full h-[48px] rounded-[13px] font-bold text-[14.5px] text-white mt-[14px] cursor-pointer disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          style={{
            border: 'none',
            background: activeVentas.length > 0 ? '#6E8483' : '#C9C2BA',
          }}
        >
          Cerrar período y archivar
        </button>
      </div>

      {/* C: Historial de ventas */}
      {allVentas.length > 0 && (
        <div className="mb-[22px]">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#5A4A43', marginBottom: 10 }}>
            Historial de ventas del período
          </div>
          <div className="flex flex-col gap-[8px]">
            {allVentas.map(v => {
              const annulled = v.anulada
              const whoOwner = v.usuario_email === process.env.NEXT_PUBLIC_OWNER_EMAIL
              return (
                <div
                  key={v.id}
                  className="rounded-[14px] p-[12px_14px]"
                  style={{
                    background: annulled ? '#F7F1EA' : '#fff',
                    border: `1px solid ${annulled ? '#EADFD2' : '#F0E1D5'}`,
                    opacity: annulled ? 0.7 : 1,
                  }}
                >
                  <div className="flex items-center justify-between gap-[10px] mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[12px] font-bold" style={{ color: '#A8736D' }}>
                        {formatHHMM(v.creado_en)}
                      </span>
                      <span className="text-[11px]" style={{ color: '#B6A89D' }}>
                        {formatShort(v.creado_en)}
                      </span>
                      <span
                        className="text-[10.5px] font-bold px-[9px] py-[2px] rounded-full whitespace-nowrap"
                        style={{
                          background: whoOwner ? '#F4D5D2' : '#DCE5E5',
                          color: whoOwner ? '#A8736D' : '#6E8483',
                        }}
                      >
                        {roleLabel(v.usuario_email)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: annulled ? '#B6A89D' : '#6E8483',
                        textDecoration: annulled ? 'line-through' : 'none',
                      }}
                    >
                      {money(v.total_venta)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    {v.detalle_ventas?.map(it => (
                      <div key={it.id} className="flex justify-between text-[12.5px] gap-2" style={{ color: '#8A7E76' }}>
                        <span className="truncate">
                          {it.productos?.nombre}{' '}
                          <span className="font-semibold" style={{ color: '#C2A39C' }}>×{it.cantidad}</span>
                        </span>
                        <span className="flex-shrink-0" style={{ color: '#A2948A' }}>
                          {money(it.cantidad * it.precio_unitario)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!annulled && (
                    <div className="flex justify-end mt-[9px]">
                      <button
                        onClick={() => setAnnulTarget(v.id)}
                        className="flex items-center gap-[5px] text-[12px] font-semibold rounded-[9px] px-[11px] py-[6px] cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: '#C0635C', background: '#FBEEEB', border: 'none' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.5-9.5L3 7"/>
                        </svg>
                        Anular venta
                      </button>
                    </div>
                  )}
                  {annulled && (
                    <div className="flex items-center gap-[6px] mt-[9px] text-[11.5px] font-semibold" style={{ color: '#C0635C' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>
                      </svg>
                      Anulada · por {roleLabel(v.anulada_por ?? '')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* D: Períodos cerrados */}
      {closedPeriods.length > 0 && (
        <div className="mb-[22px]">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#5A4A43', marginBottom: 10 }}>
            Períodos cerrados
          </div>
          <div className="flex flex-col gap-[8px]">
            {closedPeriods.map(pr => {
              const cuadreMap: Record<string, { text: string; bg: string; color: string }> = {
                cuadro:       { text: 'Cuadró',        bg: '#E5EFE7', color: '#5E8268' },
                diferencia:   { text: 'Diferencia',    bg: '#F7DBD6', color: '#C0635C' },
                sin_verificar:{ text: 'Sin verificar', bg: '#EDE6DF', color: '#8A7E76' },
              }
              const cuadre = cuadreMap[pr.estado_cuadre ?? 'sin_verificar'] ?? cuadreMap.sin_verificar
              return (
                <div
                  key={pr.id}
                  className="rounded-[13px] p-[12px_14px]"
                  style={{ background: '#fff', border: '1px solid #F0E1D5' }}
                >
                  <div className="flex items-center justify-between mb-[7px]">
                    <span className="text-[13.5px] font-bold" style={{ color: '#5A4A43' }}>
                      Período {pr.numero}
                    </span>
                    <span
                      className="text-[11px] font-bold px-[9px] py-[3px] rounded-full whitespace-nowrap"
                      style={{ background: cuadre.bg, color: cuadre.color }}
                    >
                      {cuadre.text}
                    </span>
                  </div>
                  <div className="text-[11.5px] mb-[7px]" style={{ color: '#A2948A' }}>
                    {formatDMY(pr.inicio)} – {pr.cierre ? formatDMY(pr.cierre) : '—'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-[18px]">
                      <span className="text-[12.5px]" style={{ color: '#8A7E76' }}>
                        Ventas: <strong style={{ color: '#4A3F39' }}>{pr.n_ventas}</strong>
                      </span>
                      <span className="text-[12.5px]" style={{ color: '#8A7E76' }}>
                        Total: <strong style={{ color: '#4A3F39' }}>{money(pr.total_vendido)}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => openPeriodDetail(pr)}
                      className="flex items-center gap-[5px] text-[12px] font-semibold rounded-[9px] px-[10px] py-[5px] cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: '#A8736D', background: '#F4D5D2', border: 'none' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>
                      </svg>
                      Ver detalle
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal anular */}
      {annulTarget && (
        <AnnulModalPanel
          venta={ventas.find(v => v.id === annulTarget)!}
          onConfirm={async () => {
            await onAnnulSale(annulTarget)
            setAnnulTarget(null)
          }}
          onClose={() => setAnnulTarget(null)}
        />
      )}

      {/* Modal detalle período cerrado */}
      {detailPeriodo && (
        <PeriodDetailModal
          periodo={detailPeriodo}
          ventas={detailVentas}
          loading={loadingDetail}
          onClose={() => { setDetailPeriodo(null); setDetailVentas([]) }}
        />
      )}

      {/* Modal cerrar período */}
      {showCloseModal && (
        <ClosePeriodModal
          ventasCount={activeVentas.length}
          totalFmt={money(totalVendido)}
          periodoInicio={periodoActual ? formatDMY(periodoActual.inicio) : '—'}
          onConfirm={async () => {
            const c = counted === '' ? null : parseInt(counted, 10)
            await onClosePeriod(c)
            setCounted('')
            setShowCloseModal(false)
          }}
          onClose={() => setShowCloseModal(false)}
        />
      )}
    </div>
  )
}

// ── Modal anular (Panel) ─────────────────────────────────────

function AnnulModalPanel({ venta, onConfirm, onClose }: {
  venta: Venta
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const count = venta.detalle_ventas?.reduce((a, i) => a + i.cantidad, 0) ?? 0
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center p-6 animate-ovIn"
      style={{ background: 'rgba(74,63,57,.42)', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[350px] rounded-[20px] p-[26px_22px] text-center animate-mdInFast"
        style={{ background: '#fff' }}
      >
        <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F7DBD6' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C0635C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.5-9.5L3 7"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#5A4A43' }}>
          ¿Anular esta venta?
        </div>
        <div className="text-[13.5px] mt-2 mb-6 leading-relaxed" style={{ color: '#8A7E76' }}>
          Se devolverá el stock de los <strong style={{ color: '#4A3F39' }}>{count}</strong> artículo(s)
          y la venta de <strong style={{ color: '#4A3F39' }}>{money(venta.total_venta)}</strong> dejará
          de contar en caja. Quedará registrada como anulada.
        </div>
        <div className="flex gap-[11px]">
          <button onClick={onClose} className="flex-1 h-[46px] rounded-[12px] font-semibold text-[14.5px] cursor-pointer hover:opacity-80" style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#8A7E76' }}>
            Cancelar
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 h-[46px] rounded-[12px] font-bold text-[14.5px] text-white cursor-pointer disabled:opacity-60"
            style={{ border: 'none', background: '#C0635C' }}
          >
            {loading ? 'Anulando...' : 'Sí, anular'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal detalle período cerrado ─────────────────────────────

function PeriodDetailModal({ periodo, ventas, loading, onClose }: {
  periodo: Periodo
  ventas: Venta[]
  loading: boolean
  onClose: () => void
}) {
  const cuadreMap: Record<string, { text: string; bg: string; color: string }> = {
    cuadro:        { text: 'Caja cuadrada',   bg: '#E5EFE7', color: '#5E8268' },
    diferencia:    { text: 'Con diferencia',  bg: '#F7DBD6', color: '#C0635C' },
    sin_verificar: { text: 'Sin verificar',   bg: '#EDE6DF', color: '#8A7E76' },
  }
  const cuadre = cuadreMap[periodo.estado_cuadre ?? 'sin_verificar']

  const activas  = ventas.filter(v => !v.anulada)
  const anuladas = ventas.filter(v => v.anulada)

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center sm:p-6 animate-ovIn"
      style={{ background: 'rgba(74,63,57,.42)', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[520px] rounded-t-[22px] sm:rounded-[22px] overflow-y-auto scrl animate-mdInFast"
        style={{ background: '#FBF3E9', maxHeight: '92vh' }}
      >
        {/* Header del modal */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: '#FBF3E9', borderBottom: '1px solid #F0E1D5' }}
        >
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#5A4A43' }}>
              Período {periodo.numero}
            </div>
            <div className="text-[12px] mt-[2px]" style={{ color: '#A2948A' }}>
              {formatDMY(periodo.inicio)} – {periodo.cierre ? formatDMY(periodo.cierre) : '—'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-[#F0E5DB]"
            style={{ border: 'none', background: '#fff' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7E76" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-[#A8736D] border-t-transparent animate-spin"/>
            </div>
          ) : (
            <>
              {/* Resumen del período */}
              <div className="grid grid-cols-2 gap-[10px] mb-5">
                <div className="rounded-[14px] p-[13px]" style={{ background: 'linear-gradient(140deg, #A8736D, #C99892)', color: '#fff' }}>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[.5px]" style={{ opacity: .85 }}>Total vendido</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginTop: 3, lineHeight: 1 }}>
                    {money(periodo.total_vendido)}
                  </div>
                </div>
                <div className="rounded-[14px] p-[13px]" style={{ background: '#fff', border: '1px solid #F0E1D5' }}>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[.5px]" style={{ color: '#A2948A' }}>Ventas activas</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginTop: 3, lineHeight: 1, color: '#4A3F39' }}>
                    {activas.length}
                  </div>
                </div>
                <div className="rounded-[14px] p-[13px] col-span-2 flex items-center justify-between" style={{ background: cuadre.bg }}>
                  <span className="text-[13px] font-semibold" style={{ color: cuadre.color }}>Cuadre de caja</span>
                  <span className="text-[13px] font-bold px-[10px] py-[4px] rounded-full" style={{ background: 'rgba(255,255,255,.6)', color: cuadre.color }}>
                    {cuadre.text}
                  </span>
                </div>
              </div>

              {/* Ventas activas */}
              {activas.length > 0 && (
                <div className="mb-5">
                  <div className="text-[13px] font-bold uppercase tracking-[.8px] mb-3" style={{ color: '#A2948A' }}>
                    Ventas registradas ({activas.length})
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {activas.map(v => <VentaDetalle key={v.id} venta={v} />)}
                  </div>
                </div>
              )}

              {/* Ventas anuladas */}
              {anuladas.length > 0 && (
                <div className="mb-4">
                  <div className="text-[13px] font-bold uppercase tracking-[.8px] mb-3" style={{ color: '#C0635C' }}>
                    Ventas anuladas ({anuladas.length})
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {anuladas.map(v => <VentaDetalle key={v.id} venta={v} />)}
                  </div>
                </div>
              )}

              {ventas.length === 0 && (
                <div className="text-center py-8 text-[14px]" style={{ color: '#B6A89D' }}>
                  Sin ventas registradas en este período.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function VentaDetalle({ venta }: { venta: Venta }) {
  const annulled = venta.anulada
  const whoOwner = venta.usuario_email === process.env.NEXT_PUBLIC_OWNER_EMAIL
  return (
    <div
      className="rounded-[13px] p-[11px_13px]"
      style={{
        background: annulled ? '#F7F1EA' : '#fff',
        border: `1px solid ${annulled ? '#EADFD2' : '#F0E1D5'}`,
        opacity: annulled ? 0.75 : 1,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-[6px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11.5px] font-bold" style={{ color: '#A8736D' }}>{formatHHMM(venta.creado_en)}</span>
          <span className="text-[10.5px]" style={{ color: '#B6A89D' }}>{formatShort(venta.creado_en)}</span>
          <span
            className="text-[10px] font-bold px-[8px] py-[2px] rounded-full whitespace-nowrap"
            style={{ background: whoOwner ? '#F4D5D2' : '#DCE5E5', color: whoOwner ? '#A8736D' : '#6E8483' }}
          >
            {roleLabel(venta.usuario_email)}
          </span>
          {annulled && (
            <span className="text-[10px] font-bold px-[7px] py-[2px] rounded-full" style={{ background: '#F7DBD6', color: '#C0635C' }}>
              Anulada
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14,
            fontWeight: 700,
            color: annulled ? '#B6A89D' : '#6E8483',
            textDecoration: annulled ? 'line-through' : 'none',
            flexShrink: 0,
          }}
        >
          {money(venta.total_venta)}
        </span>
      </div>
      <div className="flex flex-col gap-[2px]">
        {venta.detalle_ventas?.map(it => (
          <div key={it.id} className="flex justify-between text-[12px] gap-2" style={{ color: '#8A7E76' }}>
            <span className="truncate">
              {it.productos?.nombre}{' '}
              <span className="font-semibold" style={{ color: '#C2A39C' }}>×{it.cantidad}</span>
            </span>
            <span className="flex-shrink-0" style={{ color: '#A2948A' }}>
              {money(it.cantidad * it.precio_unitario)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Modal cerrar período ──────────────────────────────────────

function ClosePeriodModal({ ventasCount, totalFmt, periodoInicio, onConfirm, onClose }: {
  ventasCount: number
  totalFmt: string
  periodoInicio: string
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center p-6 animate-ovIn"
      style={{ background: 'rgba(74,63,57,.42)', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-[20px] p-[26px_22px] text-center animate-mdInFast"
        style={{ background: '#fff' }}
      >
        <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DCE5E5' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6E8483" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#5A4A43' }}>
          ¿Cerrar el período?
        </div>
        <div className="text-[13.5px] mt-2 mb-2 leading-relaxed" style={{ color: '#8A7E76' }}>
          Desde <strong style={{ color: '#4A3F39' }}>{periodoInicio}</strong> hasta hoy.
        </div>
        <div
          className="rounded-[12px] p-[12px_14px] mb-5 text-left"
          style={{ background: '#FBF3E9', border: '1px solid #F0E1D5' }}
        >
          <div className="flex justify-between text-[13px] mb-1">
            <span style={{ color: '#8A7E76' }}>Ventas registradas</span>
            <strong style={{ color: '#4A3F39' }}>{ventasCount}</strong>
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: '#8A7E76' }}>Total del período</span>
            <strong style={{ color: '#A8736D' }}>{totalFmt}</strong>
          </div>
        </div>
        <p className="text-[12px] mb-5" style={{ color: '#B6A89D' }}>
          Este período quedará archivado y se creará uno nuevo automáticamente.
        </p>
        <div className="flex gap-[11px]">
          <button onClick={onClose} className="flex-1 h-[46px] rounded-[12px] font-semibold text-[14.5px] cursor-pointer hover:opacity-80" style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#8A7E76' }}>
            Cancelar
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 h-[46px] rounded-[12px] font-bold text-[14.5px] text-white cursor-pointer disabled:opacity-60"
            style={{ border: 'none', background: '#6E8483' }}
          >
            {loading ? 'Cerrando...' : 'Cerrar período'}
          </button>
        </div>
      </div>
    </div>
  )
}

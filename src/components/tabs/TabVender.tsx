'use client'

import { useState, useMemo } from 'react'
import type { Producto, Venta, CartItem, AppUser } from '@/lib/types'
import {
  money, formatHHMM, formatShort, stockStatus, BADGE,
  sortByUrgency, filterProducts, uniqueCategories, roleLabel,
} from '@/lib/helpers'

interface TabVenderProps {
  user: AppUser
  productos: Producto[]
  ventas: Venta[]
  periodoLabel: string
  onConfirmSale: (cart: CartItem[]) => Promise<void>
  onAnnulSale: (ventaId: string) => Promise<void>
}

export default function TabVender({
  user, productos, ventas, periodoLabel,
  onConfirmSale, onAnnulSale,
}: TabVenderProps) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [saving, setSaving] = useState(false)
  const [annulTarget, setAnnulTarget] = useState<string | null>(null)

  const cats = useMemo(() => uniqueCategories(productos), [productos])
  const filtered = useMemo(
    () => sortByUrgency(filterProducts(productos.filter(p => p.activo), search, cat)),
    [productos, search, cat]
  )

  // Cart helpers
  function addToCart(p: Producto) {
    if (p.stock <= 0) return
    setCart(prev => {
      const ex = prev.find(c => c.productoId === p.id)
      if (ex) {
        if (ex.qty >= p.stock) return prev
        return prev.map(c => c.productoId === p.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { productoId: p.id, nombre: p.nombre, precio: p.precio, qty: 1, stockMax: p.stock }]
    })
  }

  function cartInc(id: string) {
    setCart(prev => prev.map(c => {
      if (c.productoId !== id) return c
      return c.qty < c.stockMax ? { ...c, qty: c.qty + 1 } : c
    }))
  }

  function cartDec(id: string) {
    setCart(prev => prev.map(c => c.productoId === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0))
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.productoId !== id))
  }

  const cartCount = cart.reduce((a, c) => a + c.qty, 0)
  const cartTotal = cart.reduce((a, c) => a + c.precio * c.qty, 0)

  async function handleConfirm() {
    if (!cart.length || saving) return
    setSaving(true)
    await onConfirmSale(cart)
    setCart([])
    setSaving(false)
  }

  // Ventas del período del usuario actual
  const myVentas = useMemo(
    () => [...ventas].reverse(),
    [ventas]
  )

  return (
    <div>
      {/* Banner período */}
      <div
        className="rounded-[16px] p-[14px_16px] mb-[14px] flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #FFE3D8, #F4D5D2)' }}
      >
        <div>
          <div className="text-[11px] tracking-[1px] uppercase font-bold" style={{ color: '#A8736D' }}>
            Período activo
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: '#5A4A43', marginTop: 1 }}>
            {periodoLabel}
          </div>
        </div>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#A8736D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .6 }}>
          <rect x="3" y="4" width="18" height="17" rx="2.5"/>
          <path d="M3 9h18M8 2v4M16 2v4"/>
        </svg>
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

      {/* Grilla de productos */}
      {filtered.length === 0 && (
        <div className="text-center py-10 text-[14px]" style={{ color: '#B6A89D' }}>
          No se encontraron productos.
        </div>
      )}
      <div className="grid gap-[11px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {filtered.map(p => {
          const st = stockStatus(p)
          const cartItem = cart.find(c => c.productoId === p.id)
          const inCart = !!cartItem
          const isOut = st === 'out'
          return (
            <div
              key={p.id}
              onClick={() => !isOut && addToCart(p)}
              className="relative rounded-[15px] p-[13px] transition-all"
              style={{
                background: isOut ? '#F6F0E9' : '#fff',
                border: `1px solid ${inCart ? '#A8736D' : '#F0E1D5'}`,
                cursor: isOut ? 'not-allowed' : 'pointer',
                opacity: isOut ? 0.62 : 1,
                boxShadow: inCart
                  ? '0 0 0 3px #F4D5D2'
                  : '0 2px 8px -6px rgba(120,90,70,.3)',
              }}
            >
              {isOut && (
                <span
                  className="absolute top-[10px] right-[10px] text-[10px] font-bold rounded-full px-[8px] py-[2px]"
                  style={{ color: '#C0635C', background: '#F7DBD6' }}
                >
                  Agotado
                </span>
              )}
              {inCart && !isOut && (
                <span
                  className="absolute top-[9px] right-[9px] min-w-[22px] h-[22px] px-[6px] text-[12px] font-bold text-white rounded-full flex items-center justify-center"
                  style={{ background: '#A8736D', boxShadow: '0 2px 6px -2px rgba(168,115,109,.8)' }}
                >
                  {cartItem!.qty}
                </span>
              )}
              <div
                className="text-[13.5px] font-semibold mb-[7px] leading-[1.3]"
                style={{ color: isOut ? '#8A7E76' : '#4A3F39', minHeight: 35 }}
              >
                {p.nombre}
              </div>
              <div className="flex items-end justify-between">
                <span
                  className="text-[16px] font-bold"
                  style={{ color: isOut ? '#8A7E76' : '#A8736D' }}
                >
                  {money(p.precio)}
                </span>
                <span className="text-[11.5px] font-medium" style={{ color: '#A2948A' }}>
                  Stock: {p.stock}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Carrito sticky */}
      {cart.length > 0 && (
        <div
          className="sticky bottom-4 mt-4 rounded-[18px] p-4"
          style={{
            background: '#fff',
            border: '1px solid #F0E1D5',
            boxShadow: '0 16px 40px -14px rgba(120,90,70,.5)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-[9px]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8736D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>
                <path d="M2 3h2.2l2.3 12.5a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6"/>
              </svg>
              <span className="text-[14px] font-bold" style={{ color: '#5A4A43' }}>
                Carrito · {cartCount} ítem{cartCount !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setCart([])}
              className="text-[12px] font-semibold cursor-pointer hover:underline"
              style={{ color: '#B6A89D', background: 'none', border: 'none' }}
            >
              Vaciar
            </button>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-[8px] mb-3">
            {cart.map(item => (
              <div key={item.productoId} className="flex items-center gap-[10px]">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: '#4A3F39' }}>
                    {item.nombre}
                  </div>
                  <div className="text-[11.5px]" style={{ color: '#A2948A' }}>
                    {money(item.precio)} c/u
                  </div>
                </div>
                <div className="flex items-center gap-[6px]">
                  <button
                    onClick={() => cartDec(item.productoId)}
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer font-bold text-[16px] transition-colors"
                    style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#8A7E76' }}
                  >
                    −
                  </button>
                  <span className="w-[22px] text-center text-[14px] font-bold" style={{ color: '#4A3F39' }}>
                    {item.qty}
                  </span>
                  <button
                    onClick={() => cartInc(item.productoId)}
                    disabled={item.qty >= item.stockMax}
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer font-bold text-[16px] transition-colors disabled:opacity-40"
                    style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#8A7E76' }}
                  >
                    +
                  </button>
                </div>
                <div className="text-[13px] font-semibold w-[70px] text-right flex-shrink-0" style={{ color: '#A8736D' }}>
                  {money(item.precio * item.qty)}
                </div>
                <button
                  onClick={() => removeFromCart(item.productoId)}
                  className="ml-1 cursor-pointer opacity-40 hover:opacity-80 transition-opacity"
                  style={{ background: 'none', border: 'none' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A3F39" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Total + confirmar */}
          <div
            className="flex items-center justify-between pt-3 mb-3"
            style={{ borderTop: '1px solid #F0E1D5' }}
          >
            <span className="text-[13.5px] font-semibold" style={{ color: '#8A7E76' }}>Total</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#5A4A43' }}>
              {money(cartTotal)}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full h-[50px] rounded-[14px] font-bold text-[15px] text-white cursor-pointer disabled:opacity-60 transition-opacity"
            style={{
              border: 'none',
              background: '#A8736D',
              boxShadow: '0 8px 20px -10px rgba(168,115,109,.7)',
            }}
          >
            {saving ? 'Guardando...' : 'Confirmar venta'}
          </button>
        </div>
      )}

      {/* Historial de ventas del período */}
      {myVentas.length > 0 && (
        <div className="mt-6">
          <div
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#5A4A43', marginBottom: 10 }}
          >
            Mis ventas del período
          </div>
          <div className="flex flex-col gap-[8px]">
            {myVentas.map(v => (
              <VentaCard
                key={v.id}
                venta={v}
                userEmail={user.email}
                role={user.role}
                onAnnul={() => setAnnulTarget(v.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal anular */}
      {annulTarget && (
        <AnnulModal
          venta={ventas.find(v => v.id === annulTarget)!}
          onConfirm={async () => {
            await onAnnulSale(annulTarget)
            setAnnulTarget(null)
          }}
          onClose={() => setAnnulTarget(null)}
        />
      )}
    </div>
  )
}

// ── Tarjeta de venta ─────────────────────────────────────────

function VentaCard({
  venta, userEmail, role, onAnnul,
}: {
  venta: Venta
  userEmail: string
  role: string
  onAnnul: () => void
}) {
  const annulled = venta.anulada
  const whoOwner = venta.usuario_email === process.env.NEXT_PUBLIC_OWNER_EMAIL

  return (
    <div
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
            {formatHHMM(venta.creado_en)}
          </span>
          <span className="text-[11px]" style={{ color: '#B6A89D' }}>
            {formatShort(venta.creado_en)}
          </span>
          <span
            className="text-[10.5px] font-bold px-[9px] py-[2px] rounded-full whitespace-nowrap"
            style={{
              background: whoOwner ? '#F4D5D2' : '#DCE5E5',
              color: whoOwner ? '#A8736D' : '#6E8483',
            }}
          >
            {roleLabel(venta.usuario_email)}
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
          {money(venta.total_venta)}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-[3px]">
        {venta.detalle_ventas?.map(it => (
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

      {/* Anular */}
      {!annulled && (
        <div className="flex justify-end mt-[9px]">
          <button
            onClick={onAnnul}
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
          Anulada · por {roleLabel(venta.anulada_por ?? '')}
        </div>
      )}
    </div>
  )
}

// ── Modal confirmar anulación ────────────────────────────────

function AnnulModal({ venta, onConfirm, onClose }: {
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
        <div
          className="w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#F7DBD6' }}
        >
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
          de contar en caja.
        </div>
        <div className="flex gap-[11px]">
          <button
            onClick={onClose}
            className="flex-1 h-[46px] rounded-[12px] font-semibold text-[14.5px] cursor-pointer hover:opacity-80"
            style={{ border: '1px solid #EAD9CB', background: '#FBF3E9', color: '#8A7E76' }}
          >
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

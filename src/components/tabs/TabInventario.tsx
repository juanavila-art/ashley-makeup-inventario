'use client'

import { useState, useMemo } from 'react'
import type { Producto, UserRole } from '@/lib/types'
import {
  money, stockStatus, BADGE, sortByUrgency, filterProducts, uniqueCategories,
} from '@/lib/helpers'

interface TabInventarioProps {
  productos: Producto[]
  role: UserRole
  onAddProduct: (data: ProductFormData) => Promise<void>
  onEditProduct: (id: string, data: ProductFormData) => Promise<void>
  onDeleteProduct: (id: string) => Promise<void>
}

export interface ProductFormData {
  nombre: string
  categoria: string
  precio: number
  stock: number
  alerta: number
}

export default function TabInventario({
  productos, role, onAddProduct, onEditProduct, onDeleteProduct,
}: TabInventarioProps) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [modal, setModal] = useState<'add' | 'edit' | 'del' | null>(null)
  const [editTarget, setEditTarget] = useState<Producto | null>(null)
  const [delTarget, setDelTarget] = useState<Producto | null>(null)

  const cats = useMemo(() => uniqueCategories(productos), [productos])
  const filtered = useMemo(
    () => sortByUrgency(filterProducts(productos.filter(p => p.activo), search, cat)),
    [productos, search, cat]
  )

  function openEdit(p: Producto) {
    setEditTarget(p)
    setModal('edit')
  }
  function openDel(p: Producto) {
    setDelTarget(p)
    setModal('del')
  }

  return (
    <div>
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

      {/* Botón agregar (solo dueña) */}
      {role === 'owner' && (
        <button
          onClick={() => setModal('add')}
          className="w-full h-[46px] rounded-[13px] font-semibold text-[14px] mb-4 cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ border: '1.5px dashed #C99892', background: '#FFF5F0', color: '#A8736D' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Agregar producto
        </button>
      )}

      {/* Lista */}
      {filtered.length === 0 && (
        <div className="text-center py-10 text-[14px]" style={{ color: '#B6A89D' }}>
          No se encontraron productos.
        </div>
      )}
      <div className="flex flex-col gap-[8px]">
        {filtered.map(p => {
          const st = stockStatus(p)
          const badge = BADGE[st]
          return (
            <div
              key={p.id}
              className="flex items-center gap-[13px] rounded-[14px] p-[13px_15px]"
              style={{ background: '#fff', border: '1px solid #F0E1D5' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: '#4A3F39' }}>
                  {p.nombre}
                </div>
                <div className="text-[11.5px] mt-[2px]" style={{ color: '#A2948A' }}>
                  {p.categoria}
                </div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-[17px] font-bold leading-none" style={{ color: '#4A3F39' }}>
                  {p.stock}
                </div>
                <div className="text-[10px]" style={{ color: '#B6A89D' }}>
                  alerta: {p.alerta}
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-[9px] py-[3px] rounded-full whitespace-nowrap"
                style={{ background: badge.bg, color: badge.text }}
              >
                {badge.label}
              </span>
              {role === 'owner' && (
                <div className="flex gap-[6px] flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    title="Editar"
                    className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center cursor-pointer hover:bg-[#F4EDE5] transition-colors"
                    style={{ border: '1px solid #EAD9CB', background: '#fff' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7E76" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => openDel(p)}
                    title="Eliminar"
                    className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center cursor-pointer hover:bg-[#F7EBE8] transition-colors"
                    style={{ border: '1px solid #EAD9CB', background: '#fff' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0635C" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info empleada */}
      {role === 'employee' && (
        <div
          className="mt-[18px] flex gap-[11px] items-start rounded-[14px] p-[14px_16px]"
          style={{ background: '#DCE5E5' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E8483" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[1px]">
            <circle cx="12" cy="12" r="9.5"/><path d="M12 8h.01M11 12h1v4h1"/>
          </svg>
          <div className="text-[12.5px] leading-[1.55]" style={{ color: '#566D6C' }}>
            Esta vista es de <strong>solo lectura</strong>. Si notas diferencias entre la app y el inventario físico, avísale a la dueña de inmediato.
          </div>
        </div>
      )}

      {/* Modales */}
      {(modal === 'add' || modal === 'edit') && (
        <ProductModal
          cats={cats}
          product={modal === 'edit' ? editTarget : null}
          onSave={async (data) => {
            if (modal === 'edit' && editTarget) {
              await onEditProduct(editTarget.id, data)
            } else {
              await onAddProduct(data)
            }
            setModal(null)
            setEditTarget(null)
          }}
          onClose={() => { setModal(null); setEditTarget(null) }}
        />
      )}

      {modal === 'del' && delTarget && (
        <DeleteModal
          product={delTarget}
          onConfirm={async () => {
            await onDeleteProduct(delTarget.id)
            setModal(null)
            setDelTarget(null)
          }}
          onClose={() => { setModal(null); setDelTarget(null) }}
        />
      )}
    </div>
  )
}

// ── Modal Agregar/Editar producto ────────────────────────────

function ProductModal({
  cats, product, onSave, onClose,
}: {
  cats: string[]
  product: Producto | null
  onSave: (data: ProductFormData) => Promise<void>
  onClose: () => void
}) {
  const isEdit = !!product
  const [nombre, setNombre] = useState(product?.nombre ?? '')
  const [categoria, setCategoria] = useState(product?.categoria ?? cats[0] ?? '')
  const [newCat, setNewCat] = useState('')
  const [showNewCat, setShowNewCat] = useState(false)
  const [precio, setPrecio] = useState(product ? String(product.precio) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '')
  const [alerta, setAlerta] = useState(product ? String(product.alerta) : '')
  const [saving, setSaving] = useState(false)

  function handleCatChange(v: string) {
    if (v === '__new__') { setShowNewCat(true); setCategoria('__new__') }
    else { setShowNewCat(false); setCategoria(v) }
  }

  const finalCat = categoria === '__new__' ? newCat.trim() : categoria
  const valid = nombre.trim() && finalCat && parseFloat(precio) > 0

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center sm:p-6 animate-ovIn"
      style={{ background: 'rgba(74,63,57,.42)', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-[22px] sm:rounded-[22px] p-[22px_20px] overflow-y-auto scrl animate-mdInFast"
        style={{ background: '#FBF3E9', maxHeight: '90vh', paddingBottom: 'max(22px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-[18px]">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 600, color: '#5A4A43' }}>
            {isEdit ? 'Editar producto' : 'Agregar producto'}
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

        <div className="flex flex-col gap-[14px]">
          {/* Nombre */}
          <div>
            <label className="text-[12.5px] font-semibold block mb-[6px]" style={{ color: '#8A7E76' }}>
              Nombre del producto <span style={{ color: '#C0635C' }}>*</span>
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Crema hidratante facial"
              className="w-full h-[48px] rounded-[13px] px-[14px] text-[14.5px]"
              style={{ border: '1px solid #EAD9CB', background: '#fff', color: '#4A3F39' }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-[12.5px] font-semibold block mb-[6px]" style={{ color: '#8A7E76' }}>
              Categoría <span style={{ color: '#C0635C' }}>*</span>
            </label>
            <select
              value={categoria}
              onChange={e => handleCatChange(e.target.value)}
              className="w-full h-[48px] rounded-[13px] px-[12px] text-[14.5px] cursor-pointer"
              style={{ border: '1px solid #EAD9CB', background: '#fff', color: '#4A3F39' }}
            >
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__new__">+ Crear nueva categoría...</option>
            </select>
            {showNewCat && (
              <input
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="Nombre de la nueva categoría"
                className="w-full h-[48px] rounded-[13px] px-[14px] text-[14.5px] mt-[9px]"
                style={{ border: '1px solid #C99892', background: '#fff', color: '#4A3F39' }}
              />
            )}
          </div>

          {/* Precio + Alerta */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[12.5px] font-semibold block mb-[6px]" style={{ color: '#8A7E76' }}>
                Precio de venta <span style={{ color: '#C0635C' }}>*</span>
              </label>
              <div className="relative">
                <span className="absolute left-[13px] top-1/2 -translate-y-1/2 font-bold text-[#B6A89D]">$</span>
                <input
                  value={precio}
                  onChange={e => setPrecio(e.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full h-[48px] rounded-[13px] pl-[26px] pr-[14px] text-[14.5px]"
                  style={{ border: '1px solid #EAD9CB', background: '#fff', color: '#4A3F39' }}
                />
              </div>
            </div>
            <div className="w-[110px]">
              <label className="text-[12.5px] font-semibold block mb-[6px]" style={{ color: '#8A7E76' }}>
                N.º alerta
              </label>
              <input
                value={alerta}
                onChange={e => setAlerta(e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
                placeholder="0"
                className="w-full h-[48px] rounded-[13px] px-[14px] text-[14.5px]"
                style={{ border: '1px solid #EAD9CB', background: '#fff', color: '#4A3F39' }}
              />
            </div>
          </div>

          {/* Stock inicial (solo al crear) */}
          {!isEdit && (
            <div>
              <label className="text-[12.5px] font-semibold block mb-[6px]" style={{ color: '#8A7E76' }}>
                Stock inicial
              </label>
              <input
                value={stock}
                onChange={e => setStock(e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
                placeholder="0"
                className="w-full h-[48px] rounded-[13px] px-[14px] text-[14.5px]"
                style={{ border: '1px solid #EAD9CB', background: '#fff', color: '#4A3F39' }}
              />
            </div>
          )}

          {/* Info stock al editar */}
          {isEdit && product && (
            <div
              className="text-[12px] rounded-[11px] p-[11px_13px] leading-relaxed"
              style={{ color: '#8A7E76', background: '#DCE5E5' }}
            >
              Stock actual: <strong>{product.stock}</strong> unidades. Para modificar el stock usa la pestaña <strong>Recarga</strong>.
            </div>
          )}
        </div>

        <div className="flex gap-[11px] mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-[46px] rounded-[12px] font-semibold text-[14.5px] cursor-pointer hover:opacity-80"
            style={{ border: '1px solid #EAD9CB', background: '#fff', color: '#8A7E76' }}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (!valid || saving) return
              setSaving(true)
              await onSave({
                nombre: nombre.trim(),
                categoria: finalCat,
                precio: parseFloat(precio),
                stock: parseInt(stock || '0', 10),
                alerta: parseInt(alerta || '0', 10),
              })
              setSaving(false)
            }}
            disabled={!valid || saving}
            className="flex-1 h-[46px] rounded-[12px] font-bold text-[14.5px] text-white cursor-pointer disabled:opacity-50"
            style={{ border: 'none', background: valid ? '#A8736D' : '#DCCFC3' }}
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal confirmar eliminación ───────────────────────────────

function DeleteModal({ product, onConfirm, onClose }: {
  product: Producto
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
        className="w-full max-w-[340px] rounded-[20px] p-[26px_22px] text-center animate-mdInFast"
        style={{ background: '#fff' }}
      >
        <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F7DBD6' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C0635C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#5A4A43' }}>
          ¿Eliminar producto?
        </div>
        <div className="text-[13.5px] mt-2 mb-6 leading-relaxed" style={{ color: '#8A7E76' }}>
          Se eliminará <strong style={{ color: '#4A3F39' }}>{product.nombre}</strong> de forma permanente. Esta acción no se puede deshacer.
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
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

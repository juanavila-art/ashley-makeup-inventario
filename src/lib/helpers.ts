import type { Producto, StockStatus } from './types'

// ── Formato dinero COP ────────────────────────────────────────
export function money(n: number): string {
  return '$' + Math.round(n || 0).toLocaleString('es-CO')
}

// ── Fechas ────────────────────────────────────────────────────
export function formatDMY(iso: string): string {
  const d = new Date(iso)
  return (
    String(d.getDate()).padStart(2, '0') + '/' +
    String(d.getMonth() + 1).padStart(2, '0') + '/' +
    d.getFullYear()
  )
}

export function formatHHMM(iso: string): string {
  const d = new Date(iso)
  return (
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0')
  )
}

export function formatShort(iso: string): string {
  const d = new Date(iso)
  return (
    String(d.getDate()).padStart(2, '0') + '/' +
    String(d.getMonth() + 1).padStart(2, '0')
  )
}

// ── Stock status ──────────────────────────────────────────────
export function stockStatus(p: Producto): StockStatus {
  if (p.stock <= 0) return 'out'
  if (p.stock <= p.alerta) return 'low'
  return 'ok'
}

// ── Badge styles ──────────────────────────────────────────────
export const BADGE: Record<StockStatus, { bg: string; text: string; label: string }> = {
  ok:  { bg: '#E5EFE7', text: '#5E8268', label: 'OK' },
  low: { bg: '#FBEBCF', text: '#B0822C', label: 'Stock bajo' },
  out: { bg: '#F7DBD6', text: '#C0635C', label: 'Agotado' },
}

// ── Rol ───────────────────────────────────────────────────────
export function roleLabel(email: string): string {
  return email === process.env.NEXT_PUBLIC_OWNER_EMAIL ? 'Dueña' : 'Empleada'
}

export function isOwner(email: string): boolean {
  return email === process.env.NEXT_PUBLIC_OWNER_EMAIL
}

// ── Ordenar por urgencia (agotado → bajo → ok, luego stock asc) ──
export function sortByUrgency(list: Producto[]): Producto[] {
  const rank = (p: Producto) => {
    const s = stockStatus(p)
    return s === 'out' ? 0 : s === 'low' ? 1 : 2
  }
  return [...list].sort((a, b) => {
    const ra = rank(a), rb = rank(b)
    if (ra !== rb) return ra - rb
    if (a.stock !== b.stock) return a.stock - b.stock
    return a.nombre.localeCompare(b.nombre)
  })
}

// ── Filtrar por búsqueda y categoría ─────────────────────────
export function filterProducts(
  list: Producto[],
  q: string,
  cat: string
): Producto[] {
  const s = q.trim().toLowerCase()
  return list.filter(
    (p) =>
      (cat === 'all' || p.categoria === cat) &&
      (!s || p.nombre.toLowerCase().includes(s))
  )
}

// ── Categorías únicas ─────────────────────────────────────────
export function uniqueCategories(products: Producto[]): string[] {
  return Array.from(new Set(products.map((p) => p.categoria))).sort()
}

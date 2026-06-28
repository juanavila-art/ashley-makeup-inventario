// ── Entidades base ────────────────────────────────────────────

export interface Producto {
  id: string
  nombre: string
  categoria: string
  precio: number
  stock: number
  alerta: number
  activo: boolean
  creado_en: string
}

export interface Periodo {
  id: string
  numero: number
  inicio: string
  cierre: string | null
  total_vendido: number
  n_ventas: number
  estado_cuadre: 'cuadro' | 'diferencia' | 'sin_verificar' | null
  creado_en: string
}

export interface Venta {
  id: string
  periodo_id: string
  usuario_email: string
  cliente_nombre: string | null
  total_venta: number
  anulada: boolean
  anulada_en: string | null
  anulada_por: string | null
  creado_en: string
  detalle_ventas?: DetalleVenta[]
}

export interface DetalleVenta {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  productos?: { nombre: string }
}

export interface Recarga {
  id: string
  usuario_email: string
  creado_en: string
  detalle_recargas?: DetalleRecarga[]
}

export interface DetalleRecarga {
  id: string
  recarga_id: string
  producto_id: string
  cantidad: number
  productos?: { nombre: string }
}

// ── View models ───────────────────────────────────────────────

export type StockStatus = 'ok' | 'low' | 'out'

export interface CartItem {
  productoId: string
  nombre: string
  precio: number
  qty: number
  stockMax: number
}

export type UserRole = 'owner' | 'employee'

export interface AppUser {
  email: string
  role: UserRole
}

export type TabId = 1 | 2 | 3 | 4

export interface ToastState {
  show: boolean
  msg: string
  kind: 'ok' | 'error'
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Producto, Venta, Recarga, Periodo, AppUser, CartItem, TabId, ToastState } from '@/lib/types'
import type { ProductFormData } from '@/components/tabs/TabInventario'
import { isOwner } from '@/lib/helpers'

import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Toast from '@/components/Toast'
import TabVender from '@/components/tabs/TabVender'
import TabInventario from '@/components/tabs/TabInventario'
import TabRecarga from '@/components/tabs/TabRecarga'
import TabPanel from '@/components/tabs/TabPanel'

let toastTimer: ReturnType<typeof setTimeout> | null = null

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [tab, setTab] = useState<TabId>(1)
  const [productos, setProductos] = useState<Producto[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [periodoActual, setPeriodoActual] = useState<Periodo | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastState>({ show: false, msg: '', kind: 'ok' })

  function notify(msg: string, kind: 'ok' | 'error' = 'ok') {
    if (toastTimer) clearTimeout(toastTimer)
    setToast({ show: true, msg, kind })
    toastTimer = setTimeout(() => setToast(t => ({ ...t, show: false })), 2600)
  }

  // ── Cargar datos ─────────────────────────────────────────────
  const loadData = useCallback(async (email: string) => {
    // Período actual (el que no tiene cierre)
    const { data: periodos } = await supabase
      .from('periodos')
      .select('*')
      .order('numero', { ascending: true })

    const allPeriodos = (periodos ?? []) as Periodo[]
    const actual = allPeriodos.find(p => !p.cierre) ?? null
    const cerrados = allPeriodos.filter(p => p.cierre)
    setPeriodos(cerrados)
    setPeriodoActual(actual)

    if (!actual) { setLoading(false); return }

    // Productos activos
    const { data: prods } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    setProductos((prods ?? []) as Producto[])

    // Ventas del período actual con detalle
    const { data: vts } = await supabase
      .from('ventas')
      .select('*, detalle_ventas(*, productos(nombre))')
      .eq('periodo_id', actual.id)
      .order('creado_en', { ascending: false })

    // Filtrar: empleada solo ve sus ventas en Tab1, pero en Panel dueña ve todas
    const allVentas = (vts ?? []) as Venta[]
    setVentas(allVentas)

    // Recargas (solo dueña)
    if (isOwner(email)) {
      const { data: recs } = await supabase
        .from('recargas')
        .select('*, detalle_recargas(*, productos(nombre))')
        .order('creado_en', { ascending: false })
      setRecargas((recs ?? []) as Recarga[])
    }

    setLoading(false)
  }, [supabase])

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) { router.replace('/login'); return }
      const email = user.email
      const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL
      const employeeEmail = process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL
      if (email !== ownerEmail && email !== employeeEmail) {
        router.replace(`/unauthorized?email=${encodeURIComponent(email)}`)
        return
      }
      const role = isOwner(email) ? 'owner' : 'employee'
      setAppUser({ email, role })
      loadData(email)
    })
  }, [router, supabase, loadData])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // ── Vender ────────────────────────────────────────────────────
  async function handleConfirmSale(cart: CartItem[]) {
    if (!periodoActual || !appUser) return
    try {
      // 1. Insertar venta
      const total = cart.reduce((a, c) => a + c.precio * c.qty, 0)
      const { data: ventaData, error: ventaErr } = await supabase
        .from('ventas')
        .insert({
          periodo_id: periodoActual.id,
          usuario_email: appUser.email,
          total_venta: total,
        })
        .select()
        .single()
      if (ventaErr || !ventaData) throw ventaErr

      // 2. Insertar detalle
      const detalles = cart.map(c => ({
        venta_id: ventaData.id,
        producto_id: c.productoId,
        cantidad: c.qty,
        precio_unitario: c.precio,
      }))
      await supabase.from('detalle_ventas').insert(detalles)

      // 3. Descontar stock
      for (const c of cart) {
        await supabase.rpc('descontar_stock', {
          p_id: c.productoId,
          p_qty: c.qty,
        })
      }

      await loadData(appUser.email)
      notify(`Venta registrada · $${total.toLocaleString('es-CO')}`)
    } catch {
      notify('Error al registrar la venta', 'error')
    }
  }

  // ── Anular venta ──────────────────────────────────────────────
  async function handleAnnulSale(ventaId: string) {
    if (!appUser) return
    try {
      const venta = ventas.find(v => v.id === ventaId)
      if (!venta) return

      // Devolver stock
      for (const det of venta.detalle_ventas ?? []) {
        await supabase.rpc('sumar_stock', {
          p_id: det.producto_id,
          p_qty: det.cantidad,
        })
      }

      // Marcar anulada
      await supabase.from('ventas').update({
        anulada: true,
        anulada_por: appUser.email,
        anulada_en: new Date().toISOString(),
      }).eq('id', ventaId)

      await loadData(appUser.email)
      notify('Venta anulada · stock devuelto')
    } catch {
      notify('Error al anular la venta', 'error')
    }
  }

  // ── Agregar producto ──────────────────────────────────────────
  async function handleAddProduct(data: ProductFormData) {
    try {
      await supabase.from('productos').insert({
        nombre: data.nombre,
        categoria: data.categoria,
        precio: data.precio,
        stock: data.stock,
        alerta: data.alerta,
      })
      await loadData(appUser!.email)
      notify('Producto agregado')
    } catch {
      notify('Error al agregar producto', 'error')
    }
  }

  // ── Editar producto ───────────────────────────────────────────
  async function handleEditProduct(id: string, data: ProductFormData) {
    try {
      await supabase.from('productos').update({
        nombre: data.nombre,
        categoria: data.categoria,
        precio: data.precio,
        alerta: data.alerta,
      }).eq('id', id)
      await loadData(appUser!.email)
      notify('Producto actualizado')
    } catch {
      notify('Error al actualizar producto', 'error')
    }
  }

  // ── Eliminar producto (soft delete) ───────────────────────────
  async function handleDeleteProduct(id: string) {
    try {
      await supabase.from('productos').update({ activo: false }).eq('id', id)
      await loadData(appUser!.email)
      notify('Producto eliminado')
    } catch {
      notify('Error al eliminar producto', 'error')
    }
  }

  // ── Recarga ───────────────────────────────────────────────────
  async function handleApplyRecarga(items: { productoId: string; cantidad: number }[]) {
    if (!appUser) return
    try {
      const { data: recData } = await supabase
        .from('recargas')
        .insert({ usuario_email: appUser.email })
        .select()
        .single()
      if (!recData) throw new Error('No recarga data')

      const detalles = items.map(i => ({
        recarga_id: recData.id,
        producto_id: i.productoId,
        cantidad: i.cantidad,
      }))
      await supabase.from('detalle_recargas').insert(detalles)

      for (const i of items) {
        await supabase.rpc('sumar_stock', {
          p_id: i.productoId,
          p_qty: i.cantidad,
        })
      }

      await loadData(appUser.email)
      notify(`Recarga aplicada · ${items.length} producto(s)`)
    } catch {
      notify('Error al aplicar recarga', 'error')
    }
  }

  // ── Cargar ventas de un período cerrado ──────────────────────
  async function loadPeriodSales(periodoId: string): Promise<Venta[]> {
    const { data } = await supabase
      .from('ventas')
      .select('*, detalle_ventas(*, productos(nombre))')
      .eq('periodo_id', periodoId)
      .order('creado_en', { ascending: false })
    return (data ?? []) as Venta[]
  }

  // ── Cerrar período ────────────────────────────────────────────
  async function handleClosePeriod(contado: number | null) {
    if (!periodoActual || !appUser) return
    try {
      const activeVentas = ventas.filter(v => !v.anulada)
      const total = activeVentas.reduce((a, v) => a + v.total_venta, 0)
      let estado: 'cuadro' | 'diferencia' | 'sin_verificar' = 'sin_verificar'
      if (contado !== null) {
        estado = contado === total ? 'cuadro' : 'diferencia'
      }

      await supabase.from('periodos').update({
        cierre: new Date().toISOString(),
        total_vendido: total,
        n_ventas: activeVentas.length,
        estado_cuadre: estado,
      }).eq('id', periodoActual.id)

      // Crear nuevo período
      const { data: maxRow } = await supabase
        .from('periodos')
        .select('numero')
        .order('numero', { ascending: false })
        .limit(1)
        .single()
      const nextNum = (maxRow?.numero ?? 0) + 1
      await supabase.from('periodos').insert({ numero: nextNum })

      await loadData(appUser.email)
      notify(`Período ${periodoActual.numero} cerrado y archivado`)
    } catch {
      notify('Error al cerrar el período', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────────
  if (loading || !appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBF3E9' }}>
        <div className="text-center">
          <div
            className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(150deg, #C99892, #A8736D)' }}
          >
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1 }}>A</span>
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 border-[#A8736D] border-t-transparent animate-spin mx-auto"
          />
        </div>
      </div>
    )
  }

  const periodoLabel = periodoActual
    ? `Período ${periodoActual.numero}`
    : 'Sin período activo'

  // Ventas del usuario actual (para Tab Vender)
  const misVentas = ventas.filter(v => v.usuario_email === appUser.email)

  return (
    <div style={{ minHeight: '100vh', background: '#FBF3E9' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          user={appUser}
          periodoNum={periodoActual?.numero ?? 0}
          onLogout={handleLogout}
        />
        <Navigation
          activeTab={tab}
          role={appUser.role}
          onTabChange={(t) => {
            // Solo dueña puede acceder a tabs 3 y 4
            if ((t === 3 || t === 4) && appUser.role !== 'owner') return
            setTab(t)
          }}
        />
        <main className="flex-1 p-4 pb-20">
          {tab === 1 && (
            <TabVender
              user={appUser}
              productos={productos}
              ventas={misVentas}
              periodoLabel={periodoLabel}
              onConfirmSale={handleConfirmSale}
              onAnnulSale={handleAnnulSale}
            />
          )}
          {tab === 2 && (
            <TabInventario
              productos={productos}
              role={appUser.role}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
          {tab === 3 && appUser.role === 'owner' && (
            <TabRecarga
              productos={productos}
              recargas={recargas}
              onApply={handleApplyRecarga}
            />
          )}
          {tab === 4 && appUser.role === 'owner' && (
            <TabPanel
              productos={productos}
              ventas={ventas}
              periodos={periodos}
              periodoActual={periodoActual}
              periodoLabel={periodoLabel}
              onAnnulSale={handleAnnulSale}
              onClosePeriod={handleClosePeriod}
              onLoadPeriodSales={loadPeriodSales}
            />
          )}
        </main>
        <Toast toast={toast} />
      </div>
    </div>
  )
}

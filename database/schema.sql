-- ============================================================
-- Ashley Makeup — Inventario · Schema Supabase
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- ============================================================

-- ── Extensiones ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. productos ─────────────────────────────────────────────
create table if not exists public.productos (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  categoria   text not null,
  precio      numeric(12,0) not null check (precio >= 0),
  stock       integer not null default 0 check (stock >= 0),
  alerta      integer not null default 3 check (alerta >= 0),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- ── 2. periodos ──────────────────────────────────────────────
create table if not exists public.periodos (
  id            uuid primary key default uuid_generate_v4(),
  numero        integer not null unique,
  inicio        timestamptz not null default now(),
  cierre        timestamptz,
  total_vendido numeric(14,0) not null default 0,
  n_ventas      integer not null default 0,
  estado_cuadre text check (estado_cuadre in ('cuadro', 'diferencia', 'sin_verificar')),
  creado_en     timestamptz not null default now()
);

-- ── 3. ventas ────────────────────────────────────────────────
create table if not exists public.ventas (
  id            uuid primary key default uuid_generate_v4(),
  periodo_id    uuid not null references public.periodos(id),
  usuario_email text not null,
  cliente_nombre text,
  total_venta   numeric(14,0) not null check (total_venta >= 0),
  anulada       boolean not null default false,
  anulada_en    timestamptz,
  anulada_por   text,
  creado_en     timestamptz not null default now()
);

-- ── 4. detalle_ventas ────────────────────────────────────────
create table if not exists public.detalle_ventas (
  id              uuid primary key default uuid_generate_v4(),
  venta_id        uuid not null references public.ventas(id) on delete cascade,
  producto_id     uuid not null references public.productos(id),
  cantidad        integer not null check (cantidad > 0),
  precio_unitario numeric(12,0) not null check (precio_unitario >= 0)
);

-- ── 5. recargas ──────────────────────────────────────────────
create table if not exists public.recargas (
  id            uuid primary key default uuid_generate_v4(),
  usuario_email text not null,
  creado_en     timestamptz not null default now()
);

-- ── 6. detalle_recargas ──────────────────────────────────────
create table if not exists public.detalle_recargas (
  id          uuid primary key default uuid_generate_v4(),
  recarga_id  uuid not null references public.recargas(id) on delete cascade,
  producto_id uuid not null references public.productos(id),
  cantidad    integer not null check (cantidad > 0)
);

-- ── Índices útiles ────────────────────────────────────────────
create index if not exists idx_ventas_periodo    on public.ventas(periodo_id);
create index if not exists idx_ventas_email      on public.ventas(usuario_email);
create index if not exists idx_detalle_venta     on public.detalle_ventas(venta_id);
create index if not exists idx_detalle_recarga   on public.detalle_recargas(recarga_id);
create index if not exists idx_productos_activo  on public.productos(activo);

-- ── RLS (Row Level Security) ──────────────────────────────────
alter table public.productos        enable row level security;
alter table public.periodos         enable row level security;
alter table public.ventas           enable row level security;
alter table public.detalle_ventas   enable row level security;
alter table public.recargas         enable row level security;
alter table public.detalle_recargas enable row level security;

-- Política: solo usuarios autenticados con correo autorizado pueden leer/escribir
-- (La validación del correo se hace en el middleware de Next.js;
--  aquí garantizamos que solo sesiones autenticadas accedan)

create policy "auth_read_productos" on public.productos
  for select to authenticated using (true);

create policy "auth_write_productos" on public.productos
  for all to authenticated using (true) with check (true);

create policy "auth_read_periodos" on public.periodos
  for select to authenticated using (true);

create policy "auth_write_periodos" on public.periodos
  for all to authenticated using (true) with check (true);

create policy "auth_read_ventas" on public.ventas
  for select to authenticated using (true);

create policy "auth_write_ventas" on public.ventas
  for all to authenticated using (true) with check (true);

create policy "auth_read_detalle_ventas" on public.detalle_ventas
  for select to authenticated using (true);

create policy "auth_write_detalle_ventas" on public.detalle_ventas
  for all to authenticated using (true) with check (true);

create policy "auth_read_recargas" on public.recargas
  for select to authenticated using (true);

create policy "auth_write_recargas" on public.recargas
  for all to authenticated using (true) with check (true);

create policy "auth_read_detalle_recargas" on public.detalle_recargas
  for select to authenticated using (true);

create policy "auth_write_detalle_recargas" on public.detalle_recargas
  for all to authenticated using (true) with check (true);

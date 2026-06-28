-- ============================================================
-- Funciones RPC para modificar stock de forma atómica
-- Ejecuta DESPUÉS del schema.sql
-- ============================================================

-- Descontar stock (ventas)
create or replace function descontar_stock(p_id uuid, p_qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.productos
  set stock = greatest(stock - p_qty, 0)
  where id = p_id;
end;
$$;

-- Sumar stock (recargas y anulaciones)
create or replace function sumar_stock(p_id uuid, p_qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.productos
  set stock = stock + p_qty
  where id = p_id;
end;
$$;

-- Dar acceso a usuarios autenticados
grant execute on function descontar_stock(uuid, integer) to authenticated;
grant execute on function sumar_stock(uuid, integer) to authenticated;

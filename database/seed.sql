-- ============================================================
-- Ashley Makeup — Seed de productos iniciales
-- Ejecuta DESPUÉS del schema.sql
-- ============================================================

insert into public.productos (nombre, categoria, precio, stock, alerta) values
  ('Crema hidratante facial',     'Cremas',           28000, 12, 4),
  ('Crema antiarrugas noche',     'Cremas',           45000,  0, 3),
  ('Tinte rubio cenizo',          'Tintes',           22000,  2, 5),
  ('Tinte castaño chocolate',     'Tintes',           22000,  8, 5),
  ('Base líquida natural',        'Maquillaje',       35000,  6, 3),
  ('Labial mate rosa',            'Maquillaje',       18000,  1, 4),
  ('Máscara de pestañas',         'Maquillaje',       24000,  0, 3),
  ('Rubor compacto',              'Maquillaje',       20000,  9, 3),
  ('Shampoo nutritivo',           'Cuidado capilar',  26000, 14, 5),
  ('Acondicionador reparador',    'Cuidado capilar',  26000,  3, 5),
  ('Tratamiento keratina',        'Cuidado capilar',  52000,  5, 2),
  ('Serum vitamina C',            'Cuidado facial',   48000,  7, 3),
  ('Agua micelar',                'Cuidado facial',   19000,  0, 4),
  ('Esmalte rojo clásico',        'Uñas',              9000, 20, 6),
  ('Quitaesmalte sin acetona',    'Uñas',             12000,  4, 5);

-- Crear período 1 activo (sin cierre)
insert into public.periodos (numero, inicio) values (1, now());

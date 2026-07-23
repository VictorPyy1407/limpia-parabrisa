-- ============================================================
-- Columnas de zona / condición de pago para pedidos_web
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- La landing funciona igual sin esto (reintenta sin estas columnas),
-- pero con ellas el panel puede filtrar interior vs. Asunción/Central.
-- ============================================================
alter table public.pedidos_web
  add column if not exists tipo_entrega text default 'delivery',
  add column if not exists tipo_pago text default 'contra_entrega',
  add column if not exists zona_cliente text default 'asuncion_central',
  add column if not exists datos_confirmados boolean default false;

create index if not exists pedidos_web_zona_cliente_idx
  on public.pedidos_web (zona_cliente);

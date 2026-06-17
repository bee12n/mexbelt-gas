-- =============================================
-- GASOLINA TRACKER — Schema para Supabase
-- Pega esto en el SQL Editor de Supabase
-- =============================================

-- Tabla de usuarios
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  password_hash text not null,
  rol text not null default 'usuario', -- 'superusuario' o 'usuario'
  activo boolean default true,
  created_at timestamptz default now()
);

-- Tabla de viajes
create table if not exists viajes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete cascade,
  vendedor text not null,
  descripcion text,
  tipo_gasolina text not null, -- 'magna', 'premium', 'diesel'
  distancia_km numeric not null,
  precio_litro numeric not null,
  rendimiento numeric not null,
  litros numeric not null,
  costo_total numeric not null,
  tiene_caseta boolean default false,
  costo_caseta numeric default 0,
  costo_total_con_caseta numeric not null,
  notas text,
  fecha timestamptz default now()
);

-- Índices
create index if not exists viajes_usuario_id_idx on viajes(usuario_id);
create index if not exists viajes_fecha_idx on viajes(fecha desc);
create index if not exists viajes_vendedor_idx on viajes(vendedor);

-- Row Level Security
alter table usuarios enable row level security;
alter table viajes enable row level security;

-- Políticas: todos pueden leer/escribir (auth la manejamos nosotros con bcrypt)
create policy "allow_all_usuarios" on usuarios for all using (true) with check (true);
create policy "allow_all_viajes" on viajes for all using (true) with check (true);

-- =============================================
-- Usuarios iniciales de ejemplo
-- (Los passwords se setean desde la app)
-- =============================================
-- Después de correr el schema, crea tu primer superusuario desde la app
-- en la ruta /setup (solo disponible si no hay usuarios aún)

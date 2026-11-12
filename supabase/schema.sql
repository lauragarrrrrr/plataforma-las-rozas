-- ==========================================================
-- Plataforma Las Rozas 2040 · preparación de Supabase
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.
-- ==========================================================

-- 1. Tabla única: cada fila es un elemento (un equipo, un mensaje, una foto…)
create table if not exists public.registros (
  coleccion   text        not null,
  id          text        not null,
  datos       jsonb       not null,
  actualizado timestamptz not null default now(),
  primary key (coleccion, id)
);

-- 2. Permisos: la web (clave pública) puede leer y escribir.
--    ⚠️ Provisional: cualquiera con la dirección de la web puede escribir.
--    Se restringirá cuando el panel tenga contraseña.
alter table public.registros enable row level security;

drop policy if exists "web lee"       on public.registros;
drop policy if exists "web crea"      on public.registros;
drop policy if exists "web actualiza" on public.registros;
drop policy if exists "web borra"     on public.registros;

create policy "web lee"       on public.registros for select to anon using (true);
create policy "web crea"      on public.registros for insert to anon with check (true);
create policy "web actualiza" on public.registros for update to anon using (true) with check (true);
create policy "web borra"     on public.registros for delete to anon using (true);

-- 3. Tiempo real: los cambios llegan al momento a todos los dispositivos
do $$
begin
  alter publication supabase_realtime add table public.registros;
exception when duplicate_object then null;
end $$;

-- 4. Carpeta de fotos (pública para poder verlas en la plataforma)
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "web sube fotos" on storage.objects;
drop policy if exists "web ve fotos"   on storage.objects;

create policy "web sube fotos" on storage.objects for insert to anon with check (bucket_id = 'fotos');
create policy "web ve fotos"   on storage.objects for select to anon using (bucket_id = 'fotos');

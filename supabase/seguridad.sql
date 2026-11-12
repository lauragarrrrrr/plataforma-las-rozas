-- ==========================================================
-- Plataforma Las Rozas 2040 · SEGURIDAD
-- Sustituye los permisos provisionales de schema.sql.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.
--
-- ⚠️ Antes de ejecutarlo, crea las cuentas del equipo facilitador en
--    Authentication → Users → Add user (con «Auto Confirm User»).
--    Después de ejecutarlo, el panel y la sala SOLO funcionan con la sesión iniciada.
--
-- Quién puede hacer qué:
--  · Cualquiera (participantes, sin sesión): leer todo y escribir solo lo suyo:
--      equipos (su fase), personas del equipo, progreso, chat, peticiones de ayuda, fotos y su voto.
--      El voto solo se puede crear, nunca cambiar.
--  · Equipo facilitador (con sesión): todo, incluido abrir dinámicas, mover la sala,
--      abrir la votación y borrar o restaurar los datos.
-- ==========================================================

-- 1. Quitar los permisos provisionales
drop policy if exists "web lee"       on public.registros;
drop policy if exists "web crea"      on public.registros;
drop policy if exists "web actualiza" on public.registros;
drop policy if exists "web borra"     on public.registros;

drop policy if exists "todos leen"                on public.registros;
drop policy if exists "participantes crean"       on public.registros;
drop policy if exists "participantes actualizan"  on public.registros;
drop policy if exists "facilitacion todo"         on public.registros;

-- 2. Leer: todo el mundo (las pantallas necesitan ver el estado de la jornada)
create policy "todos leen" on public.registros
  for select to anon, authenticated using (true);

-- 3. Participantes: crear solo en sus colecciones (incluido su voto)
create policy "participantes crean" on public.registros
  for insert to anon
  with check (coleccion in ('teams', 'setups', 'progress', 'chat', 'helpRequests', 'photos', 'votes'));

-- 4. Participantes: actualizar solo sus colecciones (el voto no se puede cambiar)
create policy "participantes actualizan" on public.registros
  for update to anon
  using (coleccion in ('teams', 'setups', 'progress', 'chat', 'helpRequests', 'photos'))
  with check (coleccion in ('teams', 'setups', 'progress', 'chat', 'helpRequests', 'photos'));

-- 5. Equipo facilitador con sesión: todo (crear, cambiar y borrar cualquier cosa)
create policy "facilitacion todo" on public.registros
  for all to authenticated using (true) with check (true);

-- 6. Fotos: todo el mundo puede subir y ver fotos; borrar, solo el equipo facilitador
drop policy if exists "web sube fotos"          on storage.objects;
drop policy if exists "web ve fotos"            on storage.objects;
drop policy if exists "todos suben fotos"       on storage.objects;
drop policy if exists "todos ven fotos"         on storage.objects;
drop policy if exists "facilitacion borra fotos" on storage.objects;

create policy "todos suben fotos" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'fotos');
create policy "todos ven fotos" on storage.objects
  for select to anon, authenticated using (bucket_id = 'fotos');
create policy "facilitacion borra fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos');

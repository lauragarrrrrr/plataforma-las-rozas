// ==========================================================
// PERSONAS DE CADA EQUIPO · ⚠️ SIMULACIÓN CON NOMBRES INVENTADOS
//
// Sirve para probar «¿Quién eres?» (/participa) y la votación.
// Nombre de pila + inicial del apellido, para distinguir a quienes se llaman igual.
// Los nombres REALES no van aquí: el repositorio es público.
// Cuando lleguen, se cargarán en Supabase (como los equipos) y sustituirán a estos.
// ==========================================================

export const SIMULATED_ROSTER: Record<string, string[]> = {
  A: ['Lucía M.', 'Marcos R.', 'Irene T.', 'Hugo S.', 'Carmen V.'],
  B: ['Sergio L.', 'Elena P.', 'Álvaro G.', 'Paula N.'],
  C: ['Javier D.', 'Nuria B.', 'Diego F.', 'Sara C.', 'Raúl M.'],
  D: ['Clara O.', 'Óscar P.', 'Laia R.', 'Mateo G.'],
  E: ['Andrea S.', 'Iván T.', 'Noelia C.', 'Pedro A.', 'Rocío L.'],
  F: ['Daniel V.', 'Alba M.', 'Gonzalo H.', 'Inés R.'],
  G: ['Ana B.', 'Luis C.', 'Marta D.', 'Pablo E.'],
  H: ['Eva F.', 'Rubén G.', 'Celia H.', 'Tomás I.', 'Lucía S.'],
  I: ['Adrián J.', 'Beatriz K.', 'Samuel L.', 'Olga M.'],
  J: ['Carla N.', 'Víctor O.', 'Lorena P.', 'Mario Q.', 'Nerea R.'],
  K: ['Héctor S.', 'Silvia T.', 'Jaime U.', 'Patricia V.'],
  L: ['Alicia Z.', 'Rodrigo A.', 'Miriam B.', 'Emilio C.', 'Teresa D.'],
}

// Nombres reales: solo en el ordenador de Laura, en src/data/roster.local.json (no se sube).
// Si ese archivo existe, manda sobre la simulación.
const local = Object.values(import.meta.glob<Record<string, string[]>>('./roster.local.json', { eager: true, import: 'default' }))[0]

/** Personas de cada equipo: las reales si están en este ordenador; si no, la simulación */
export const ROSTER: Record<string, string[]> = local ?? SIMULATED_ROSTER

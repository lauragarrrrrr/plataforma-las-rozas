// ==========================================================
// EJEMPLOS PARA EL CHAT · cuando el equipo pide «dame un ejemplo»
// Mismos ejemplos que las fichas en papel (presentación v5, 19/11/2026). Todo es ficticio.
// ⚠️ Cuando lleguen las cartas definitivas de giros y personajes, cambiarlas aquí.
// ==========================================================

/** Cartas de giros (Pieza 05 de la metodología v3) */
export const CARTAS_GIROS = [
  { titulo: 'Sin pantallas', texto: 'Eliminad las aplicaciones y plataformas digitales. ¿Cómo resolveríais el reto?' },
  { titulo: 'Presupuesto mínimo', texto: 'Tenéis 500 € para ponerla en marcha. ¿Qué haríais?' },
  { titulo: '×100', texto: 'Vuestra solución debe funcionar para cien veces más personas. ¿Qué cambiaríais?' },
  { titulo: 'En 24 horas', texto: '¿Qué versión mínima de la idea podríais activar mañana mismo?' },
  { titulo: 'Sin edificio', texto: '¿Y si no pudierais usar ningún espacio fijo?' },
  { titulo: 'Solo un barrio', texto: '¿Cómo sería la versión para 50 vecinos?' },
]

/** Cartas de personajes (Pieza 05b de la metodología v3) */
export const CARTAS_PERSONAJES = [
  { titulo: 'Una persona mayor', texto: '¿Cómo viviría esta solución alguien de 80 años?' },
  { titulo: 'Un adolescente', texto: '¿Cómo resolvería este reto alguien de 16 años?' },
  { titulo: 'Una persona emprendedora', texto: '¿Cómo lo abordaría alguien que está creando su primera empresa?' },
  { titulo: 'Una persona con movilidad reducida', texto: '¿Qué barreras encontraría al usar esta solución?' },
  { titulo: 'Una persona recién llegada', texto: '¿Cómo descubriría y utilizaría esta solución alguien que acaba de llegar a la ciudad?' },
  { titulo: 'Alguien de la administración', texto: '¿Cómo podría simplificar o facilitar su puesta en marcha?' },
]

/** Ejemplos por dinámica (id de TEAM_DYNAMICS) */
export const EJEMPLOS: Record<string, string[]> = {
  // Los mismos ejemplos que las fichas en papel (presentación v5)
  titular: [
    '«Lista de espera para abrir tienda en Las Rozas: la ciudad con más comercio de barrio de España no tiene ni un local libre».',
  ],
  senales: [
    'París organiza sus barrios para que todo quede a 15 minutos a pie. Fuente: noticias sobre la «ciudad de los 15 minutos».',
    'Cada vez compramos más por internet y los pedidos llegan en menos de 24 horas.',
    'Los mercados de abastos se reinventan: suman restauración y actividades para atraer a nuevo público.',
  ],
  'a-quien': [
    'Cliente: personas mayores que viven solas en el centro y no conducen, cuando necesitan hacer la compra del día.',
    'Problema: las tiendas de su calle han cerrado y la más cercana está a 20 minutos andando. Sus hijos les hacen la compra por internet, pero pierden autonomía y el trato con el barrio.',
    'Beneficio: comprar solas, cerca de casa, y seguir sintiéndose autónomas y parte del barrio.',
    'Reto: «¿Cómo podríamos ayudar a las personas mayores que viven solas en el centro a hacer su compra diaria cerca de casa, sin depender de nadie?»',
  ],
  ideacion: [
    'La Plaza Vuelve: un mercado semanal de comercios locales que rota por las plazas del centro, con reparto a pie para quien no pueda cargar.',
    'Tres palancas: comercios del municipio · plazas y espacios municipales · vecinos voluntarios. Primer paso: un piloto de tres meses en una plaza del centro, un día por semana.',
  ],
  portada: [
    '«La plaza vuelve: 300 vecinos mayores del centro ya hacen la compra a pie, cada semana».',
  ],
}

/** Un ejemplo para la dinámica; en las cartas, alterna una de giro y una de personaje */
export function ejemploPara(dynamicId: string, n: number): string | null {
  if (dynamicId === 'cartas') {
    const lista = n % 2 === 0 ? CARTAS_GIROS : CARTAS_PERSONAJES
    const carta = lista[Math.floor(n / 2) % lista.length]
    return `Carta de ${n % 2 === 0 ? 'giro' : 'personaje'} «${carta.titulo}»: ${carta.texto}`
  }
  const lista = EJEMPLOS[dynamicId]
  return lista?.length ? lista[n % lista.length] : null
}

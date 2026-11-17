// ==========================================================
// EJEMPLOS PARA EL CHAT · cuando el equipo pide «dame un ejemplo»
// Textos de la metodología v3 (docs/metodologia.html). Todo es ficticio.
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
  senales: [
    'Nuevas profesiones que hace diez años no existían.',
    'Cambios en la movilidad: más bicis y patinetes, coches compartidos.',
    'Nuevas formas de aprender: cursos cortos en línea en lugar de carreras largas.',
  ],
  'a-quien': [
    'Un joven recién formado quiere empezar su carrera sin tener que desplazarse lejos cada día.',
    '¿A quién? Jóvenes recién formados. ¿Cuándo le pasa? Al terminar sus estudios, cuando busca su primera experiencia.',
    '¿Qué se lo impide hoy? No conoce a las empresas locales y ellas no le conocen a él.',
  ],
  'como-podriamos': [
    '«¿Cómo podríamos ayudar a jóvenes recién formados a encontrar su primera oportunidad en empresas locales?»',
  ],
  ideacion: [
    'Si pensamos en una plataforma de empleo, «sin pantallas» obliga a imaginar encuentros, redes locales o experiencias presenciales.',
    'Combinad dos ideas que os gusten en una sola, o llevad una al extremo.',
  ],
  ficha: [
    'Nombre: Primer Paso. A quién ayudamos: jóvenes recién formados de Las Rozas. Solución: estancias de dos semanas en empresas del municipio.',
    'Tres palancas: empresas del Hub · centros educativos · sin burocracia.',
  ],
  portada: [
    '«Las Rozas conecta a 1.000 jóvenes con su primera oportunidad profesional».',
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

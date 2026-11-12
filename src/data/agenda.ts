// ==========================================================
// PRESENTACIÓN DE LA SALA · la escaleta de la metodología, paso a paso.
// El equipo facilitador la va pasando como una presentación.
// Textos y horas copiados de docs/metodologia.html (escaleta).
// ⚠️ Las diapositivas de apertura, recorrido y Juanjo las suben Laura y Marina:
//    aquí solo se deja el hueco (`pending`). No inventar su contenido.
// ==========================================================

export type SlideKind =
  | 'welcome'   // primera pantalla, dinámica, con Las Rozas 2040
  | 'deck'      // diapositivas (PPT) que se subirán
  | 'video'     // el vídeo inmersivo
  | 'dynamic'   // una dinámica: título, explicación y cronómetro grande
  | 'reveal'    // revelación de los ámbitos
  | 'break'     // descanso
  | 'info'      // momento de sala sin cronómetro (speed pitch, votación…)

export interface AgendaStep {
  id: string
  time: string
  minutes: number
  title: string
  who: 'Toda la sala' | 'Individual' | 'Equipo' | 'Equipo facilitador' | 'Libre'
  kind: SlideKind
  description: string
  /** Hueco para lo que subiréis (diapositivas, foto, vídeo) */
  pending?: string
}

export const AGENDA: AgendaStep[] = [
  { id: 'bienvenida', time: '09:00', minutes: 30, title: 'Bienvenida', who: 'Toda la sala', kind: 'welcome',
    description: 'Acreditación, café y picoteo de bienvenida.' },
  { id: 'apertura', time: '09:30', minutes: 10, title: 'Apertura institucional', who: 'Toda la sala', kind: 'deck',
    description: 'Bienvenida del alcalde y de Las Rozas Innova: por qué Las Rozas 2040 y qué se espera del día.',
    pending: 'Diapositivas de la apertura institucional y foto del alcalde' },
  { id: 'recorrido', time: '09:40', minutes: 5, title: 'El recorrido de la jornada', who: 'Toda la sala', kind: 'deck',
    description: 'Cómo será el día: las cuatro fases, los tiempos y lo que se llevará cada equipo al final.',
    pending: 'Diapositivas del recorrido de la jornada' },
  { id: 'foresight', time: '09:45', minutes: 10, title: 'Inspiración: qué es el foresight', who: 'Toda la sala', kind: 'deck',
    description: 'Qué es el foresight, por qué miramos al futuro desde hoy y qué son los futuros plausibles, posibles y deseables.',
    pending: 'Diapositivas de Juanjo' },
  { id: 'video', time: '09:55', minutes: 5, title: 'Una simulación desde 2040', who: 'Toda la sala', kind: 'video',
    description: 'Se apagan las luces y se proyecta el vídeo inmersivo. Termina con la pregunta que abre la primera dinámica.',
    pending: 'Vídeo inmersivo' },
  { id: 'ciudad', time: '10:00', minutes: 15, title: '¿Cuál es la ciudad que no elegirías en 2040?', who: 'Individual', kind: 'dynamic',
    description: 'Cada persona rellena su ficha: un hecho concreto ocurrido en 2040 y sus causas inmediata, antecedente y fundamental.' },
  { id: 'escuchar', time: '10:15', minutes: 5, title: 'Escuchar los futuros posibles', who: 'Toda la sala', kind: 'dynamic',
    description: 'Una persona comparte su ciudad y quien haya imaginado algo parecido o distinto toma el relevo.' },
  { id: 'ambitos', time: '10:20', minutes: 2, title: 'Ahora, el futuro que sí queremos', who: 'Toda la sala', kind: 'reveal',
    description: '«Ahora que sabemos qué futuro queremos evitar, imaginemos el que sí queremos construir». Se revela el ámbito de cada equipo.' },
  { id: 'titular', time: '10:20', minutes: 20, title: 'Titular positivo', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo pasa a su sala y escribe su primer titular positivo para Las Rozas Times 2040.' },
  { id: 'senales', time: '10:40', minutes: 10, title: 'Señales de cambio', who: 'Equipo', kind: 'dynamic',
    description: 'Señales de hoy que apuntan al titular de cada equipo. Hechos frente a hipótesis.' },
  { id: 'a-quien', time: '10:50', minutes: 40, title: '¿A quién queremos ayudar? y ¿Cómo podríamos…?', who: 'Equipo', kind: 'dynamic',
    description: 'El expediente del colectivo, con la Unidad de Investigación, y el reto formulado como «¿Cómo podríamos…?».' },
  { id: 'descanso', time: '11:30', minutes: 10, title: 'Descanso', who: 'Libre', kind: 'break',
    description: 'Pausa a mitad de mañana para salir, tomar algo y despejarse antes de idear.' },
  { id: 'cartas', time: '11:40', minutes: 20, title: 'Cartas de restricciones y de personajes', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo roba cartas y genera ideas desde otras restricciones y otros personajes.' },
  { id: 'ideacion', time: '12:00', minutes: 10, title: 'Ideación libre', who: 'Equipo', kind: 'dynamic',
    description: 'Ideas sin las restricciones de las cartas.' },
  { id: 'ficha', time: '12:10', minutes: 30, title: 'Ficha de iniciativa', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo elige una propuesta y la desarrolla en la ficha de iniciativa.' },
  { id: 'portada', time: '12:40', minutes: 15, title: 'Portada', who: 'Equipo', kind: 'dynamic',
    description: 'La ficha se convierte en la portada de Las Rozas Times 2040 y el equipo prepara cómo contar su idea en 30 segundos.' },
  { id: 'traslado', time: '12:55', minutes: 5, title: 'Vuelta a la sala principal', who: 'Toda la sala', kind: 'info',
    description: 'Los equipos vuelven a la sala principal mientras se cargan las portadas en el orden del speed pitch.' },
  { id: 'pitch', time: '13:00', minutes: 50, title: 'Speed pitch', who: 'Toda la sala', kind: 'info',
    description: 'Cada equipo: 30 s para contar su idea con la portada detrás, 1,5 min de preguntas del jurado y 2 min de cambio.' },
  { id: 'votacion', time: '13:50', minutes: 10, title: 'Votación', who: 'Individual', kind: 'info',
    description: 'Primero, todas las portadas en pantalla; después, cada persona vota sus tres favoritas.' },
  { id: 'valoracion', time: '14:00', minutes: 10, title: 'Valoración y presentación del juego', who: 'Toda la sala', kind: 'info',
    description: 'El equipo facilitador suma su valoración a los votos mientras se presenta el juego en el escenario.' },
  { id: 'resultados', time: '14:10', minutes: 10, title: 'Resultados', who: 'Toda la sala', kind: 'info',
    description: 'Anuncio de las iniciativas ganadoras y lectura de sus titulares de 2040.' },
  { id: 'cierre', time: '14:20', minutes: 10, title: 'Cierre y foto de familia', who: 'Toda la sala', kind: 'info',
    description: 'Cierre de la jornada y foto de familia con todos los participantes.' },
]

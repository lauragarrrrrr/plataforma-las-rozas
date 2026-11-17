// ==========================================================
// PRESENTACIÓN DE LA SALA · la escaleta de la metodología, paso a paso.
// El equipo facilitador la va pasando como una presentación.
// Textos y horas copiados de docs/metodologia.html (escaleta de la metodología v3, 16/11/2026).
// Las diapositivas de apertura, recorrido y Juanjo van en una presentación aparte:
//    aquí la sala solo muestra el título, la hora y la descripción de esos pasos.
// ==========================================================

export type SlideKind =
  | 'welcome'   // primera pantalla, dinámica, con Las Rozas 2040
  | 'deck'      // momento con diapositivas propias, en una presentación aparte
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
  /** Hueco para lo que subiréis (el vídeo) */
  pending?: string
}

export const AGENDA: AgendaStep[] = [
  { id: 'bienvenida', time: '09:00', minutes: 30, title: 'Acreditación, café y bienvenida', who: 'Toda la sala', kind: 'welcome',
    description: 'Cada persona se acredita, recoge su identificación y se sienta frente al escenario. Café y picoteo mientras se completa la sala.' },
  { id: 'apertura', time: '09:30', minutes: 10, title: 'Apertura institucional', who: 'Toda la sala', kind: 'deck',
    description: 'Bienvenida del alcalde y de Las Rozas Innova: por qué Las Rozas 2040 y qué se espera del día.' },
  { id: 'recorrido', time: '09:40', minutes: 5, title: 'El recorrido de la jornada', who: 'Toda la sala', kind: 'deck',
    description: 'Cómo será el día: imaginar futuros, entender una necesidad, explorar soluciones y presentar y votar.' },
  { id: 'foresight', time: '09:45', minutes: 10, title: 'Inspiración: qué es el foresight', who: 'Toda la sala', kind: 'deck',
    description: 'Juanjo abre la fase: qué es el foresight y por qué empezamos imaginando futuros antes de decidir cuál queremos.' },
  { id: 'video', time: '09:55', minutes: 5, title: 'Una simulación desde 2040', who: 'Toda la sala', kind: 'video',
    description: 'Se apagan las luces y se proyecta el vídeo inmersivo. Termina con la pregunta que abre la primera dinámica.',
    pending: 'Vídeo inmersivo' },
  { id: 'ciudad', time: '10:00', minutes: 10, title: '¿Cuál es la ciudad que no elegirías en 2040?', who: 'Individual', kind: 'dynamic',
    description: 'Cada persona rellena su ficha: un hecho concreto ocurrido en 2040 y sus causas inmediata, antecedente y fundamental.' },
  { id: 'escuchar', time: '10:10', minutes: 5, title: 'Escuchar los futuros posibles', who: 'Toda la sala', kind: 'dynamic',
    description: 'Una persona comparte su ciudad y quien haya imaginado algo parecido o distinto toma el relevo.' },
  { id: 'ambitos', time: '10:15', minutes: 10, title: 'Ámbitos y equipos', who: 'Toda la sala', kind: 'reveal',
    description: 'Se presentan los seis ámbitos. Cada persona escanea el código, escribe su nombre y descubre su equipo, su ámbito y su sala.' },
  { id: 'traslado-titular', time: '10:25', minutes: 5, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'De la sala principal a las salas de equipo.' },
  { id: 'titular', time: '10:30', minutes: 15, title: 'Titular positivo', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo escribe en su sala su primer titular positivo para Las Rozas Times 2040. Los 2 últimos minutos, foto y subida.' },
  { id: 'traslado-investigacion', time: '10:45', minutes: 5, title: 'Volvemos a la sala principal', who: 'Toda la sala', kind: 'info',
    description: 'De las salas de equipo a la sala principal.' },
  { id: 'explica-investigacion', time: '10:50', minutes: 5, title: 'Explicación de la investigación', who: 'Toda la sala', kind: 'info',
    description: 'En qué consiste la fase: señales de cambio, «¿A quién queremos ayudar?», la Unidad de Investigación con IA y el reto «¿Cómo podríamos…?».' },
  { id: 'traslado-senales', time: '10:55', minutes: 5, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'De la sala principal a las salas de equipo.' },
  { id: 'senales', time: '11:00', minutes: 20, title: 'Señales de cambio', who: 'Equipo', kind: 'dynamic',
    description: 'Señales de hoy que apuntan al titular de cada equipo. Hechos frente a hipótesis. Los 2 últimos minutos, foto y subida.' },
  { id: 'a-quien', time: '11:20', minutes: 25, title: '¿A quién queremos ayudar? y ¿Cómo podríamos…?', who: 'Equipo', kind: 'dynamic',
    description: 'El expediente del colectivo, con la Unidad de Investigación con IA, y el reto formulado como «¿Cómo podríamos…?».' },
  { id: 'descanso', time: '11:45', minutes: 10, title: 'Pausa para café', who: 'Libre', kind: 'break',
    description: 'Pausa a mitad de mañana para salir, tomar algo y despejarse antes de idear.' },
  { id: 'explica-ideacion', time: '11:55', minutes: 5, title: 'Explicación de la ideación', who: 'Toda la sala', kind: 'info',
    description: 'En qué consiste la fase: cartas de giros y de personajes, ideación libre y ficha de iniciativa.' },
  { id: 'traslado-ideacion', time: '12:00', minutes: 5, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'De la sala principal a las salas de equipo.' },
  { id: 'cartas', time: '12:05', minutes: 15, title: 'Cartas de giros y de personajes', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo roba cartas y genera ideas desde otros giros y otros personajes.' },
  { id: 'ideacion', time: '12:20', minutes: 15, title: 'Ideación libre', who: 'Equipo', kind: 'dynamic',
    description: 'Ideas sin las reglas de las cartas, que quedan como apoyo. Los 2 últimos minutos, foto y subida.' },
  { id: 'ficha', time: '12:35', minutes: 25, title: 'Ficha de iniciativa', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo elige una propuesta y la desarrolla en la ficha de iniciativa. Los 2 últimos minutos, foto y subida.' },
  { id: 'portada', time: '13:00', minutes: 15, title: 'Portada', who: 'Equipo', kind: 'dynamic',
    description: 'La ficha se convierte en la portada de Las Rozas Times 2040 y el equipo prepara cómo contar su idea en 30 segundos.' },
  { id: 'traslado', time: '13:15', minutes: 5, title: 'Volvemos a la sala principal', who: 'Toda la sala', kind: 'info',
    description: 'Los equipos vuelven al escenario mientras se cargan las portadas en el orden del speed pitch.' },
  { id: 'pitch', time: '13:20', minutes: 50, title: 'Speed pitch', who: 'Toda la sala', kind: 'info',
    description: 'Cada equipo sube al escenario con su portada en papel: 30 s para contar su idea, 1,5 min de preguntas del jurado y 2 min de cambio.' },
  { id: 'votacion', time: '14:10', minutes: 5, title: 'Votación', who: 'Individual', kind: 'info',
    description: 'Primero, todas las portadas en pantalla; después, cada persona vota sus tres favoritas.' },
  { id: 'valoracion', time: '14:15', minutes: 10, title: 'Valoración y El Rey Mono', who: 'Toda la sala', kind: 'info',
    description: 'El equipo facilitador suma su valoración a los votos mientras Badan Studio presenta el juego «El Rey Mono» en el escenario.' },
  { id: 'resultados', time: '14:25', minutes: 10, title: 'Resultados', who: 'Toda la sala', kind: 'info',
    description: 'Anuncio de las iniciativas ganadoras y lectura de sus titulares de 2040.' },
  { id: 'cierre', time: '14:35', minutes: 5, title: 'Cierre y foto de familia', who: 'Toda la sala', kind: 'info',
    description: 'Cierre de la jornada y foto de familia con todos los participantes.' },
  { id: 'comida', time: '14:40', minutes: 50, title: 'Comida y networking', who: 'Libre', kind: 'break',
    description: 'Catering y conversación entre participantes. Recogida de regalos a la salida.' },
]

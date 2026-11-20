// ==========================================================
// PRESENTACIÓN DE LA SALA · la escaleta de la metodología, paso a paso.
// El equipo facilitador la va pasando como una presentación.
// Horas y momentos de la escaleta final en Excel del 19/11/2026 (Las_Rozas_2040_Escaleta (2).xlsx), que manda.
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
  { id: 'bienvenida', time: '09:00', minutes: 30, title: 'Acreditación y café de bienvenida', who: 'Toda la sala', kind: 'welcome',
    description: 'Cada persona se acredita, escanea el QR y descubre su ámbito y su equipo. Café y picoteo mientras se completa la sala.' },
  { id: 'apertura', time: '09:30', minutes: 5, title: 'Bienvenida institucional', who: 'Toda la sala', kind: 'deck',
    description: 'Bienvenida institucional y de Las Rozas Innova.' },
  { id: 'inauguracion', time: '09:35', minutes: 5, title: 'Inauguración oficial', who: 'Toda la sala', kind: 'deck',
    description: 'Inauguración oficial de la jornada.' },
  { id: 'recorrido', time: '09:40', minutes: 10, title: 'El recorrido de la jornada', who: 'Toda la sala', kind: 'deck',
    description: 'Irene y Marina: el equipo, la metodología, los ámbitos, la herramienta digital y la escaleta del día.' },
  { id: 'foto', time: '09:50', minutes: 2, title: 'Foto de grupo', who: 'Toda la sala', kind: 'info',
    description: 'Foto con todas las personas participantes y paso a la primera fase.' },
  { id: 'video', time: '09:52', minutes: 3, title: 'Una simulación desde 2040', who: 'Toda la sala', kind: 'video',
    description: 'Se apagan las luces y se proyecta el vídeo inmersivo. Termina con la pregunta que abre la primera dinámica.',
    pending: 'Vídeo inmersivo' },
  { id: 'foresight', time: '09:55', minutes: 15, title: 'Inspiración: foresight y ciudades del futuro', who: 'Toda la sala', kind: 'deck',
    description: 'Juanjo recoge el vídeo y da su ponencia sobre foresight y las ciudades del futuro.' },
  { id: 'explica-ciudad', time: '10:10', minutes: 5, title: 'Explicación de «¿Cuál es la ciudad que no elegirías?»', who: 'Toda la sala', kind: 'info',
    description: 'Juanjo explica la primera dinámica.' },
  { id: 'ciudad', time: '10:15', minutes: 5, title: '¿Cuál es la ciudad que no elegirías en 2040?', who: 'Individual', kind: 'dynamic',
    description: 'Cada persona completa su ficha A4.' },
  { id: 'explica-titular', time: '10:20', minutes: 5, title: 'Explicación del titular positivo', who: 'Toda la sala', kind: 'info',
    description: 'Juanjo explica la primera dinámica de equipo: el titular positivo para Las Rozas Times 2040.' },
  { id: 'traslado-titular', time: '10:25', minutes: 10, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'Cada equipo va a su sala y abre en su ordenador el enlace del correo.' },
  { id: 'titular', time: '10:35', minutes: 15, title: 'Titular positivo', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo elige su digital owner, rellena la ficha del titular positivo y sube la foto.' },
  { id: 'traslado-investigacion', time: '10:50', minutes: 5, title: 'Volvemos a la sala principal', who: 'Toda la sala', kind: 'info',
    description: 'De las salas de equipo a la sala principal.' },
  { id: 'explica-investigacion', time: '10:55', minutes: 5, title: 'Explicación de la investigación', who: 'Toda la sala', kind: 'info',
    description: 'Andrea explica la fase: señales de cambio, «¿A quién queremos ayudar?» y «¿Cómo podríamos…?», con la Unidad de Investigación.' },
  { id: 'traslado-senales', time: '11:00', minutes: 5, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'De la sala principal a las salas de equipo.' },
  { id: 'senales', time: '11:05', minutes: 20, title: 'Señales de cambio', who: 'Equipo', kind: 'dynamic',
    description: 'Rellenan con post-its la ficha de señales de cambio, acompañados de la Unidad de Investigación, y suben la foto.' },
  { id: 'a-quien', time: '11:25', minutes: 25, title: '¿A quién queremos ayudar? y ¿Cómo podríamos…?', who: 'Equipo', kind: 'dynamic',
    description: 'Cliente, problema, beneficio y el reto en forma de «¿Cómo podríamos…?», con la Unidad de Investigación. Suben la foto.' },
  { id: 'descanso', time: '11:50', minutes: 10, title: 'Pausa para café', who: 'Libre', kind: 'break',
    description: 'Pausa corta para despejarse.' },
  { id: 'explica-ideacion', time: '12:00', minutes: 10, title: 'Explicación de la ideación', who: 'Toda la sala', kind: 'info',
    description: 'Irene explica la ficha de «Nuestra iniciativa», el apoyo de la baraja de cartas y la solución.' },
  { id: 'traslado-ideacion', time: '12:10', minutes: 5, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'De la sala principal a las salas de equipo.' },
  { id: 'ideacion', time: '12:15', minutes: 20, title: 'Ideación libre · Nuestra iniciativa', who: 'Equipo', kind: 'dynamic',
    description: 'Rellenan la ficha de «Nuestra iniciativa», con el sobre de cartas si se atascan, y suben la foto.' },
  { id: 'traslado-explica-portada', time: '12:35', minutes: 5, title: 'Volvemos a la sala principal', who: 'Toda la sala', kind: 'info',
    description: 'De las salas de equipo a la sala principal.' },
  { id: 'explica-portada', time: '12:40', minutes: 5, title: 'Explicación del speed pitch y la portada', who: 'Toda la sala', kind: 'info',
    description: 'Cómo se hace la portada y cómo será el speed pitch.' },
  { id: 'traslado-portada', time: '12:45', minutes: 5, title: 'A vuestras salas', who: 'Toda la sala', kind: 'info',
    description: 'De la sala principal a las salas de equipo.' },
  { id: 'portada', time: '12:50', minutes: 15, title: 'Portada', who: 'Equipo', kind: 'dynamic',
    description: 'Cada equipo rellena su portada de Las Rozas Times 2040 en papel y sube la foto.' },
  { id: 'traslado', time: '13:05', minutes: 5, title: 'Al escenario con la portada', who: 'Toda la sala', kind: 'info',
    description: 'De las salas de equipo al escenario, cada equipo con su portada en papel.' },
  { id: 'pitch', time: '13:10', minutes: 50, title: 'Speed pitch', who: 'Toda la sala', kind: 'info',
    description: 'Cada equipo sube al escenario con su portada en papel: 30 s para contar su idea, 1,5 min de preguntas del jurado y 2 min de cambio.' },
  { id: 'explica-votacion', time: '14:00', minutes: 5, title: 'Explicación de la votación', who: 'Toda la sala', kind: 'info',
    description: 'Irene explica cómo se vota desde el móvil.' },
  { id: 'votacion', time: '14:05', minutes: 5, title: 'Votación', who: 'Individual', kind: 'info',
    description: 'Un QR en pantalla lleva a la votación: cada persona elige sus tres iniciativas favoritas.' },
  { id: 'valoracion', time: '14:10', minutes: 10, title: 'Valoración y presentación del juego', who: 'Toda la sala', kind: 'info',
    description: 'El equipo facilitador y el jurado revisan los votos y hacen el ranking final mientras se presenta el juego en el escenario.' },
  { id: 'resultados', time: '14:20', minutes: 10, title: 'Resultados y diplomas', who: 'Toda la sala', kind: 'info',
    description: 'Anuncio de las iniciativas ganadoras, lectura de sus titulares de 2040, fotos y entrega de diplomas.' },
  { id: 'cierre', time: '14:30', minutes: 5, title: 'Cierre y foto de familia', who: 'Toda la sala', kind: 'info',
    description: 'Cierre de la jornada y foto de familia con todos los participantes.' },
  { id: 'comida', time: '14:35', minutes: 50, title: 'Comida y networking', who: 'Libre', kind: 'break',
    description: 'Catering y conversación entre participantes. Recogida de regalos a la salida.' },
]

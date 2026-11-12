# Plataforma Las Rozas 2040 · Brief para Claude Code

Este archivo es la referencia principal del proyecto. Léelo entero antes de escribir código y vuelve a él cuando tengas dudas.

La metodología completa está en `docs/metodologia.html`. Es la **fuente de verdad** de dinámicas, textos, tiempos y estilo. Si este archivo y la metodología no coinciden, para y pregunta.

---

## 1. Qué estamos construyendo

Una plataforma web que acompaña el hackathon **Las Rozas 2040**, organizado por Las Rozas Innova con Avantis.

| Dato | Valor |
| --- | --- |
| Fecha | Sábado 21/11/2026, de 9:30 a 14:30 |
| Participantes | 60 personas en 12 equipos de hasta 5 |
| Ámbitos | 6 (ver apartado 9) |
| Dispositivos | 1 ordenador por equipo y el móvil de cada persona |
| Hilo conductor | El periódico **Las Rozas Times 2040**: titular, reto, ficha de iniciativa y portada final |
| Alcance | Solo el **durante** y el **después** del evento. La inscripción y la guía quedan fuera |
| Coste objetivo | 0 € |

**Principio de diseño:** las personas están en el centro y las pantallas son de apoyo. Los equipos trabajan primero en papel. Después registran sus conclusiones en la plataforma.

> Primero se conversa; después se contrasta; finalmente el equipo decide qué registrar.

La plataforma tiene que ser **sencilla**. Ante la duda, haz la versión más simple que cumpla la metodología.

---

## 2. Cómo trabajamos en el repositorio

Somos dos personas, Laura y Marina, en el mismo repositorio: `lauragarrrrrr/plataforma-las-rozas`.

| Rama | Uso |
| --- | --- |
| `main` | Producción. Se despliega sola en Vercel y es la web pública |
| `Lau` | Rama de trabajo de Laura |
| `Marina` | Rama de trabajo de Marina |

Los nombres de rama empiezan por **mayúscula** (`Lau`, `Marina`). Git distingue mayúsculas y minúsculas: no crees ramas `lau` ni `marina`.

**Reglas obligatorias:**

1. Trabaja **solo en la rama de la persona** con la que estás hablando. Nunca toques la rama de la otra persona.
2. **Nunca hagas merge ni push a `main`** sin que la persona lo pida de forma explícita en ese momento. Antes de hacerlo, recuérdale que se actualizará la web pública.
3. Antes de modificar archivos, explica en dos o tres líneas qué vas a cambiar y espera el visto bueno.
4. Haz commits pequeños, con mensajes en español que digan qué cambia. Por ejemplo: «Añade la pantalla de subida de fotos».
5. Antes de empezar una tarea, trae los últimos cambios de `main` a la rama de trabajo para no divergir.
6. No subas nunca secretos, claves ni datos personales. El archivo `.env` va en `.gitignore`.
7. La identidad visual vive en un solo sitio (`src/styles/tokens.css` y `docs/IDENTIDAD.md`). Las dos ramas la usan igual. No inventes colores ni tipografías nuevas.

**Reparto orientativo:** Laura lleva Foresight e Investigación. Marina lleva Ideación y Pitch. El panel y la sala se reparten según avance.

**Las personas del equipo no son programadoras.** Explica los pasos técnicos con frases cortas y sin jerga. Cuando tengan que hacer algo ellas (instalar, iniciar sesión, aceptar un aviso), dilo claro y en orden.

---

## 3. Tecnología

| Pieza | Elección |
| --- | --- |
| Framework | Vue 3 + Vite + TypeScript + Vue Router |
| Estilos | CSS propio con las variables de `tokens.css`. Sin frameworks de CSS |
| Datos, fase 1 | `localStorage` + `BroadcastChannel` para sincronizar pestañas. Sirve para probar todo sin servidor |
| Datos, fase 2 | Supabase gratis: base de datos, almacenamiento de fotos y tiempo real |
| Despliegue | Vercel, conectado a `main` |
| IA | **Sin API.** Ver apartado 7 |

**Capa de datos:** todo el acceso a datos pasa por un único módulo (`src/data/store.ts`) con una interfaz común. Las pantallas nunca hablan directamente con `localStorage` ni con Supabase. Así pasamos de la fase 1 a la fase 2 cambiando solo ese módulo.

**Tamaños que tienen que verse bien:**

- Móvil a 390 px de ancho, sin scroll horizontal (subir fotos y votar).
- Ordenador del equipo a 1280 px (app del equipo).
- Pantalla de sala a 1920 × 1080 (proyección).

---

## 4. Identidad visual

Copia la identidad de `docs/metodologia.html`. Estas son sus variables. Ponlas tal cual en `src/styles/tokens.css`:

```css
:root{
  --c-ink:#000;--c-white:#fff;
  --c-innova:#00b5a8;--c-innova-dark:#17929e;--c-blue:#0a4780;
  --c-green-dark:#307373;--c-green-deep:#1d5e5f;--c-green-mid:#8ce2d6;--c-green-light:#dff9f4;
  --c-gris-10:#e6e6e6;--c-paper:#fffefa;--c-paper-line:#cfd8d4;
  --c-rubi:#d81e5b;
  --gradient-verde:linear-gradient(135deg,var(--c-green-mid),var(--c-innova));
  --gradient-dark:linear-gradient(160deg,var(--c-green-dark) 0%,var(--c-green-deep) 100%);
  --gradient-anio:linear-gradient(100deg,var(--c-innova),var(--c-innova-dark) 60%,var(--c-blue));
  --font-sans:"Poppins",system-ui,-apple-system,"Segoe UI",sans-serif;
  --font-paper:Georgia,"Times New Roman",serif;
  --radius-card:1.75rem;
  --ease-out:cubic-bezier(.22,1,.36,1);
}
body{font-family:var(--font-sans);color:var(--c-green-dark);background:var(--c-white);line-height:1.6}
```

**Reglas de estilo:**

| Elemento | Regla |
| --- | --- |
| Tipografía | Poppins (300-700) desde Google Fonts. Georgia solo para todo lo que imita el periódico: titulares, portada y expedientes |
| Texto principal | `--c-green-dark` sobre blanco |
| Acento | `--c-innova` para botones y estados activos |
| Fondos de bloque | `--c-green-light` o `--gradient-dark` con texto blanco |
| Rubí | Solo para alertas y avisos |
| Tarjetas | Esquinas de `--radius-card`, sin sombras duras |
| Etiquetas pequeñas | MAYÚSCULAS, 0.75rem, espaciado de letra amplio, como los «kickers» de la metodología |
| Pie | «Powered by Avantis» |
| Logos | Las Rozas Innova, Ayuntamiento de Las Rozas y Avantis en `public/logos/` |

**Textos:**

- Español de España, frases cortas y tono cercano. A los equipos se les habla de «vosotros».
- Comillas latinas « » y apóstrofo tipográfico ’ en los textos que se leen. Comillas rectas solo en el código.
- Vocabulario del proyecto: «equipo facilitador», «post-its», «futuros» en plural, «Las Rozas Times 2040».
- **Nada de política ni personas reales** en ejemplos ni datos de prueba. Hay elecciones municipales el 29/11/2026.

Crea también `docs/IDENTIDAD.md` con estas reglas, para que las dos ramas las sigan igual.

---

## 5. La jornada: fases y dinámicas

Cada fase de la app se corresponde con una fase de la metodología. Lo que el equipo registra en la app es **lo mismo** que escribe en papel. No añadas campos que no estén aquí.

### Fase 01 · Foresight (45 min de dinámicas + inspiración)

| Hora | Dinámica | Quién | Qué se registra |
| --- | --- | --- | --- |
| 9:45 | Inspiración: qué es el foresight (Juanjo) | Sala | Nada |
| 9:55 | Vídeo «Una simulación desde 2040» | Sala | Nada |
| 10:00 | ¿Cuál es la ciudad que no elegirías en 2040? | Individual, en papel | Foto de las fichas (opcional) |
| 10:15 | Escuchar los futuros posibles | Sala | Nada |
| 10:20 | Titular positivo para Las Rozas Times 2040 | Equipo | Titular + 3 respuestas + foto |

**Tarjeta premortem (individual, en papel):** el hecho (qué ha pasado en 2040, como una noticia), causa inmediata, causa antecedente y causa fundamental.

**Titular (equipo):** el titular y tres preguntas.

- ¿Qué nos gustaría que se dijera de Las Rozas en 2040?
- ¿Qué tendría que haber cambiado?
- ¿Cómo sabríamos que lo hemos conseguido?

Opcional: una entradilla de una frase.

### Fase 02 · Investigación (50 min)

| Hora | Dinámica | Qué se registra |
| --- | --- | --- |
| 10:40 | Señales de cambio | 3 o 4 señales: título, descripción, fuente y si es **hecho contrastado** o **hipótesis** |
| 10:50 | ¿A quién queremos ayudar? (30 min) | Expediente con las 5 preguntas |
| — | ¿Cómo podríamos…? (10 min) | El reto en una frase que empieza por «¿Cómo podríamos…?» |

**Las 5 preguntas del expediente (en este orden):**

1. ¿A quién queremos ayudar?
2. ¿Cuándo le pasa?
3. ¿Qué intenta conseguir?
4. ¿Qué le impide hacerlo hoy?
5. ¿Cómo lo resuelve hoy y por qué no le vale?

La **Unidad de Investigación con IA** acompaña toda esta fase (ver apartado 7).

### Fase 03 · Ideación (60 min)

| Hora | Dinámica | Qué se registra |
| --- | --- | --- |
| 11:40 | Cartas de restricciones y de personajes (20 min) | Foto de las ideas. Opcional: lista corta de ideas |
| 12:00 | Ideación libre (10 min) | Foto |
| 12:10 | Ficha de iniciativa (30 min) | Los 6 campos |

**Cartas de restricciones (ejemplos):** sin pantallas, presupuesto mínimo, multiplicar su impacto, una primera solución en 24 horas.

**Cartas de personajes (ejemplos):** una persona mayor, un adolescente, alguien recién llegado.

**Ficha de iniciativa: 6 campos, en este orden:**

1. Nombre
2. A quién ayudamos
3. ¿Qué problema resuelve?
4. Beneficio: lo que obtiene
5. Solución: lo que construimos
6. Tres palancas para impulsarla

### Fase 04 · Pitch y cierre (100 min)

| Hora | Dinámica | Qué pasa en la plataforma |
| --- | --- | --- |
| 12:40 | Portada (15 min) | La ficha se convierte en la portada del Las Rozas Times 2040 |
| 12:55 | Traslado y carga de portadas (5 min) | El panel ordena las portadas para el speed pitch |
| 13:00 | Speed pitch (50 min) | La sala proyecta la portada de cada equipo con cronómetro |
| 13:50 | Votación (10 min) | Cada persona vota su top 3 desde el móvil |
| 14:00 | Valoración del equipo facilitador (10 min) | Cuadro de mando interno |
| 14:10 | Resultados (10 min) | La sala muestra las ganadoras cuando facilitación lo aprueba |

**Speed pitch, por equipo:** 30 s para contar su idea con la portada en pantalla detrás, más 1,5 min de preguntas del jurado y un mínimo de 2 min de cambio. En total, 12 × 4 min = 48 min. **No hay vídeo por equipo**: se quitó.

**Portada:** su estructura es la de la «Pieza 07 · Portada final» de la metodología.

- Cabecera: LAS ROZAS TIMES · edición especial · fecha en 2040.
- Ámbito.
- Titular grande en Georgia.
- Entradilla con el nombre de la iniciativa.
- Una cifra destacada.
- «¿Qué cambió?» y «¿Cómo empezó?».
- Las 3 palancas.
- El reto de partida.
- «Del titular de la mañana».

Casi todo sale de lo que el equipo ya registró. El equipo solo escribe lo que falta: titular de portada, cifra, «¿Qué cambió?» y «¿Cómo empezó?».

**Votación:**

- Cada participante elige 3 iniciativas y **no puede votar a su propio equipo**.
- Entra con un **código de un solo uso** impreso en su acreditación, sin dar su nombre.
- No ve porcentajes.
- Antes de votar, la sala muestra todas las portadas.

**Valoración del equipo facilitador.** Criterios provisionales, pendientes de confirmar con el cliente: relevancia de la necesidad, impacto potencial, originalidad y posibilidad de activación. Hazlos **configurables** desde un archivo.

El resultado final combina votos y valoración. Solo lo ve facilitación hasta que lo aprueba para la sala.

---

## 6. Pantallas y rutas

| Ruta | Quién la usa | Qué hace |
| --- | --- | --- |
| `/` | Todos | Portada con acceso a cada pantalla. Sin datos sensibles |
| `/equipo/:id` | Ordenador del equipo (digital owner) | App del equipo, fase a fase |
| `/subir/:id` | Móvil, vía QR | Subir una foto al expediente del equipo |
| `/votar` | Móvil | Votación con código de un solo uso |
| `/sala` | Proyector | Pantalla de sala |
| `/panel` | Equipo facilitador | Control de la jornada y cuadro de mando |

### `/equipo/:id` · App del equipo

- Cabecera con equipo, ámbito y las 4 fases. Cada fase está completada, activa o bloqueada.
- Las fases se abren desde el panel. Por defecto solo está abierta la actual.
- Dentro de cada fase:
  - Instrucción corta («misión»).
  - Lista de tareas que se marcan al completarse.
  - Formularios con los campos del apartado 5.
  - Botón «Registrar fotografía».
- «Registrar fotografía» abre un QR que lleva a `/subir/:id`. Las fotos también se pueden subir desde el ordenador. Al guardar, se elige el tipo: expediente de investigación, periódico con el titular, ficha de iniciativa u otra.
- «Mi expediente»: todo lo registrado por el equipo, fase a fase.
- Si llega una alerta del panel, aparece arriba en rubí.
- El prototipo «App del equipo» de la metodología es la referencia visual y de textos.

### `/subir/:id` · Móvil

- Una sola acción: hacer o elegir una foto, elegir el tipo y enviarla.
- Confirmación clara.
- Si no hay conexión, guarda la foto y la envía al volver la conexión.

### `/votar` · Móvil

- Pide el código.
- Muestra las 12 portadas en miniatura y deja elegir 3, sin la del propio equipo.
- Confirmación y fin. El código queda gastado.

### `/sala` · Proyector

Tiene varios modos, que elige el panel:

| Modo | Qué muestra |
| --- | --- |
| Bienvenida | Portada del evento |
| Fase | Fase actual y cronómetro grande |
| Alerta | Desafío sorpresa a pantalla completa |
| Speed pitch | Portada del equipo que presenta y cronómetro de 30 s + 1,5 min |
| Portadas | Las 12 portadas en mosaico, antes de votar |
| Resultados | Ganadoras aprobadas, con su titular |

Ejemplo de alerta: «Atención, equipo 07. Las empresas ya no pueden publicar ofertas de empleo. ¿Cómo conseguís que el talento y las oportunidades se encuentren? Tenéis 10 minutos».

### `/panel` · Equipo facilitador

**Durante:**

- Seguimiento de los 12 equipos: fase, tareas hechas y fotos subidas.
- Abrir y cerrar fases.
- Controlar la sala: modo y cronómetro.
- Lanzar alertas preparadas antes, a todos o a un equipo. Las alertas se escriben antes y se lanzan **a mano**.
- Orden del speed pitch.
- Generar e imprimir los códigos de voto.
- Cuadro de mando: votos en tiempo real, valoración por criterios, resultado combinado y botón «Aprobar para la sala».

**Después:**

- Revisar todo el material por equipo.
- Exportar a CSV: titulares, señales, expedientes, retos, fichas, votos y valoraciones.

**Acceso:** el panel lleva una contraseña sencilla, definida en una variable de entorno. Cada equipo solo ve sus propios datos.

---

## 7. Unidad de Investigación con IA

**No hay API de IA.** La de Gemini de pago queda fuera por coste, y la gratuita no se permite a usuarios europeos. El equipo usa el chat de forma manual.

En la app, el botón «Abrir Unidad de Investigación» hace dos cosas:

1. Muestra las instrucciones y un botón para **copiar el prompt**.
2. Abre el chat en otra pestaña. El enlace va en una variable de configuración.

Después, el equipo vuelve a la app y **registra él mismo** sus conclusiones. La IA no escribe en la plataforma.

**Comportamiento que pide el prompt** (borrador; el texto completo está en el brief anterior de la plataforma):

- Se presenta como «Unidad de Investigación de Las Rozas 2040».
- Hace **una pregunta cada vez** y no da soluciones.
- Ayuda a separar hechos de hipótesis («¿Esto es un dato contrastado o una hipótesis vuestra?»).
- Pregunta qué saben y qué están suponiendo sobre el colectivo.
- No habla de política ni de personas reales.
- Tras unas 5 preguntas, ayuda a formular el reto como «¿Cómo podríamos…?», sin dar la solución por hecha.

**Plan B:** si se cae el chat, el facilitador lleva las preguntas impresas.

---

## 8. Modelo de datos

Ponlo en `src/data/types.ts`. Nombres en inglés en el código; textos de pantalla en español.

```ts
type PhaseId = 'foresight' | 'research' | 'ideation' | 'pitch'
type PhaseState = 'locked' | 'active' | 'done'

interface Team { id: string; number: number; name: string; area: AreaId; phases: Record<PhaseId, PhaseState> }
interface Headline { teamId: string; headline: string; lead?: string; said: string; changed: string; measure: string }
interface Signal { id: string; teamId: string; title: string; description: string; source?: string; kind: 'fact' | 'hypothesis' }
interface Dossier { teamId: string; who: string; when: string; goal: string; barrier: string; currentWorkaround: string; challenge: string }
interface Idea { id: string; teamId: string; text: string; card?: string }
interface Initiative { teamId: string; name: string; whoWeHelp: string; problem: string; benefit: string; solution: string; levers: [string, string, string] }
interface Cover { teamId: string; headline: string; keyFigure?: string; keyFigureLabel?: string; whatChanged: string; howItStarted: string }
interface Photo { id: string; teamId: string; kind: 'dossier' | 'headline' | 'initiative' | 'premortem' | 'other'; url: string; createdAt: string }
interface Alert { id: string; target: 'all' | string; title: string; body: string; minutes?: number; launchedAt?: string }
interface VoteCode { code: string; used: boolean; teamId?: string }
interface Vote { code: string; teamIds: [string, string, string]; createdAt: string }
interface Assessment { teamId: string; scores: Record<string, number>; notes?: string }
interface RoomState { mode: 'welcome' | 'phase' | 'alert' | 'pitch' | 'covers' | 'results'; timerEndsAt?: string; currentTeamId?: string; alertId?: string; resultsApproved: boolean }
```

El `VoteCode` puede llevar el equipo de la persona para impedir que vote al suyo. **Nunca guarda nombres.**

---

## 9. Datos de ejemplo

Crea `src/data/seed.ts` con 12 equipos repartidos en estos 6 ámbitos:

1. Ciudad y calidad de vida
2. Desarrollo empresarial
3. Educación y futuro
4. Atracción de talento
5. Administración pública
6. Movilidad y sostenibilidad (nombre pendiente; puede llamarse «Mirada abierta»)

**El equipo 07 · Atracción de talento** está completo con el ejemplo de la metodología:

| Campo | Valor |
| --- | --- |
| Titular | «En 2040, Las Rozas conecta talento, empresas y nuevas oportunidades» |
| ¿Qué nos gustaría que se dijera…? | Que es el sitio donde los jóvenes empiezan su carrera |
| ¿Qué tendría que haber cambiado? | Alianzas estables entre empresas y centros educativos |
| ¿Cómo sabríamos que lo hemos conseguido? | Más jóvenes encuentran su primera oportunidad aquí |
| A quién | Jóvenes recién formados que viven en Las Rozas |
| Cuándo le pasa | Al terminar sus estudios, cuando busca su primera experiencia |
| Qué intenta conseguir | Su primera experiencia profesional cerca de casa |
| Qué se lo impide | No conoce a las empresas locales y ellas no le conocen a él |
| Cómo lo resuelve hoy | Busca en portales de empleo generales, pero casi todas las ofertas le obligan a desplazarse lejos |
| Reto | «¿Cómo podríamos acercar a jóvenes y empresas locales en sus primeras oportunidades?» |
| Iniciativa | Primer Paso |
| Beneficio | Una primera experiencia real cerca de casa, y empresas que conocen al talento local |
| Solución | Estancias de dos semanas en empresas del municipio |
| Palancas | Alianzas con empresas del Hub · centros educativos que derivan · estancias cortas y sin burocracia |
| Portada | «Las Rozas conecta a 1.000 jóvenes con su primera oportunidad profesional» · cifra 1.000 · nació en el hackathon de 2026 · piloto de 20 jóvenes y 5 empresas del Hub |

Otros equipos con ejemplos ya usados en la metodología: 11 · Bus a demanda, 05 · Aula ciudad y Mentores 60+. El resto, con datos inventados y neutros.

**Todo dato de ejemplo es ficticio.** Ni nombres reales, ni partidos, ni cargos.

---

## 10. Orden de construcción

Haz un hito cada vez. Al terminarlo, comprueba que funciona, enséñalo y espera el visto bueno antes de seguir.

| Hito | Contenido | Listo cuando |
| --- | --- | --- |
| 0 | Proyecto Vue + Vite + TS, `tokens.css`, `docs/IDENTIDAD.md`, logos, pie «Powered by Avantis» y `/` | `npm run build` funciona y la portada se ve con la identidad |
| 1 | Router, tipos, `store.ts` en modo local y datos de ejemplo | Todas las rutas abren y leen datos de ejemplo |
| 2 | `/equipo/:id`: fases, tareas y formularios de las 4 fases | El equipo 07 se ve completo y los cambios se guardan al recargar |
| 3 | Fotos: QR y `/subir/:id` | Una foto subida desde otra pestaña aparece en el expediente |
| 4 | `/panel` (durante) y `/sala`: fases, cronómetro y alertas | Una alerta lanzada en el panel aparece en la sala y en la app del equipo |
| 5 | Portada generada desde la ficha | La portada del 07 se parece a la Pieza 07 de la metodología |
| 6 | Speed pitch, códigos, `/votar`, cuadro de mando y resultados | Votos válidos, sin votar al propio equipo ni dos veces; resultados solo tras aprobar |
| 7 | Panel (después): revisión y exportación CSV | El CSV se abre bien en Excel, con tildes |
| 8 | Supabase: datos, fotos y tiempo real | Todo funciona entre dispositivos distintos |

---

## 11. Comprobaciones antes de cada entrega

- [ ] Sin errores en la consola y `npm run build` funciona.
- [ ] El estado se conserva al recargar.
- [ ] Cada equipo solo ve sus datos.
- [ ] No se puede votar al propio equipo ni usar un código dos veces.
- [ ] El móvil funciona a 390 px sin scroll horizontal.
- [ ] La sala se lee bien a 1920 × 1080 desde el fondo de una sala.
- [ ] Textos en español, con « » y sin política ni personas reales.
- [ ] Colores y tipografías solo de `tokens.css`.
- [ ] Nada se ha subido a `main` sin permiso.

---

## 12. Planes B del día

| Si se cae… | Qué hacemos |
| --- | --- |
| La wifi | Router móvil de reserva. Las fotos se suben cuando vuelve la conexión |
| La plataforma | Los equipos siguen en papel; todo el trabajo existe ya en las plantillas |
| El chat de investigación | Preguntas impresas en manos del facilitador |
| La votación | Papeletas en papel |
| La portada | Se proyecta la ficha fotografiada |

---

## 13. Pendiente de decidir (no lo decidas tú)

Si una tarea depende de uno de estos puntos, pregunta antes de seguir.

| Tema | Estado |
| --- | --- |
| Alojamiento | El plan gratuito de Vercel (Hobby) no permite uso comercial. Opciones: Vercel Pro (20 $) o Cloudflare Pages gratis |
| Propiedad de las cuentas | A nombre de quién van Vercel y Supabase |
| Criterios de valoración | Los provisionales no coinciden con los del cliente |
| Sexto ámbito | «Movilidad y sostenibilidad» o «Mirada abierta» |
| Datos personales | Fichas y votos van sin nombre. Falta confirmar el aviso con Las Rozas Innova |
| Conecta 2040 | Forma parte de la plataforma, pero tiene datos personales. No entra en esta base ni en un repositorio público |

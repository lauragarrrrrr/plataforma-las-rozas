// ==========================================================
// Lógica principal — Plataforma Las Rozas
// Carga las experiencias de data/experiencias.json y las pinta
// como tarjetas en cualquier elemento con id="tarjetas".
// ==========================================================

// Ruta a los datos relativa a la página actual (funciona en / y en /paginas/)
const enSubcarpeta = location.pathname.includes('/paginas/');
const RUTA_DATOS = (enSubcarpeta ? '../' : '') + 'data/experiencias.json';

async function cargarExperiencias() {
  const contenedor = document.getElementById('tarjetas');
  if (!contenedor) return;

  try {
    const respuesta = await fetch(RUTA_DATOS);
    const experiencias = await respuesta.json();

    contenedor.innerHTML = experiencias
      .map(
        (exp) => `
        <article class="tarjeta">
          <span class="etiqueta">${exp.categoria}</span>
          <h3>${exp.titulo}</h3>
          <p>${exp.descripcion}</p>
        </article>`
      )
      .join('');
  } catch (error) {
    contenedor.innerHTML =
      '<p>No se pudieron cargar las experiencias. ¿Has abierto la web con un servidor local? (mira el README)</p>';
    console.error(error);
  }
}

cargarExperiencias();

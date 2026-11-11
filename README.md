# plataforma-las-rozas

Plataforma experiencial de Las Rozas, hecha para un hackathon.

Es una web estática con HTML, CSS y JavaScript, sin frameworks ni instalaciones. Se publica automáticamente en **Vercel** cada vez que se junta un cambio en `main`.

🌍 **Web publicada:** https://plataforma-las-rozas.vercel.app/

---

## 📁 Estructura

```
index.html              Portada
paginas/                Resto de páginas (experiencias, sobre…)
css/styles.css          Estilos. Colores y fuentes en las variables de arriba
js/main.js              Lógica (carga y pinta las experiencias)
data/experiencias.json  Contenido de las experiencias. Edítalo sin tocar código
img/                    Imágenes
```

**Consejo para no pisaros:** repartíos el trabajo por archivos o páginas. Por ejemplo, una se encarga de `paginas/experiencias.html` y la otra de la portada. Si las dos editáis las mismas líneas del mismo archivo a la vez, Git os pedirá resolver un conflicto. Tiene solución, pero es mejor evitarlo.

---

## 🚀 Primera vez (cada una en su ordenador)

1. Instala [Git](https://git-scm.com/) y, si quieres, [VS Code](https://code.visualstudio.com/).
2. Clona el repo:
   ```bash
   git clone https://github.com/lauragarrrrrr/plataforma-las-rozas.git
   cd plataforma-las-rozas
   ```
3. Abre la web en local. Hace falta un servidor pequeño para que cargue `data/experiencias.json`:
   - Con VS Code: instala la extensión **Live Server**, haz clic derecho en `index.html` y elige *Open with Live Server*.
   - Con Node: `npx serve .` y abre la dirección que te muestre.
   - Con Python: `python -m http.server 8000` y abre http://localhost:8000

---

## 🔁 Cómo trabajamos juntas (ramas + pull requests)

`main` es la versión buena, la que se publica. **Nadie trabaja directamente en `main`.**

Cada tarea sigue este ciclo:

```bash
# 1. Ponte al día con lo último de main
git switch main
git pull

# 2. Crea una rama para tu tarea
git switch -c nombre-de-la-tarea      # p. ej. pagina-mapa, estilos-portada

# 3. Trabaja y guarda cambios a menudo
git add .
git commit -m "Añade el mapa de experiencias"

# 4. Sube tu rama a GitHub
git push -u origin nombre-de-la-tarea
```

5. En GitHub aparecerá el botón **Compare & pull request**. Ábrelo, describe qué has hecho y pide a tu compañera que lo revise.
   Vercel comentará en el PR con un **enlace de vista previa**, una versión de la web con tus cambios para que tu compañera la vea sin descargar nada.
6. Cuando esté bien, pulsa **Merge**. En un minuto estará en la web publicada.
7. Vuelve al paso 1 para la siguiente tarea.

### Si la otra ha juntado cambios mientras tú trabajabas

```bash
git switch main
git pull
git switch tu-rama
git merge main
```

Si sale un **conflicto**, abre el archivo en VS Code. Verás las dos versiones marcadas y botones para elegir *Accept Current*, *Accept Incoming* o *Accept Both*. Elige, guarda, y luego ejecuta `git add .` y `git commit`.

---

## ✏️ Añadir una experiencia

Edita `data/experiencias.json` y añade un bloque como este:

```json
{
  "titulo": "Nombre de la experiencia",
  "categoria": "Cultura",
  "descripcion": "Texto corto que la describe."
}
```

Ojo con las comas entre bloques: si falta una, la página no carga.

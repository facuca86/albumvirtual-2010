# TEMPLATE GUIDE — Cómo clonar este álbum para un nuevo torneo

Este documento explica la arquitectura del proyecto y los pasos para crear un álbum virtual de un nuevo torneo a partir de este repositorio.

**Este repositorio es el proyecto madre** — exclusivamente el álbum del Mundial Qatar 2022.
Al clonar para un nuevo torneo, trabajar siempre sobre el repositorio nuevo. Nunca modificar este.

---

## Sección 1: Estructura del proyecto

El proyecto está compuesto por 6 archivos en la raíz:

| Archivo | Rol |
|---|---|
| `albumConfig_2022.js` | Configuración central: id, título, equipos, secciones, grupos, estadísticas, paleta |
| `playerNames_2022.js` | Nombres de jugadores por equipo (clave de equipo → objeto número → nombre) |
| `teamThemes_2022.js` | Gradientes visuales por equipo usando clases Tailwind |
| `firebase_2022.js` | Configuración de Firebase y funciones de lectura/escritura del progreso |
| `panini_virtual_album_2022_app.jsx` | Componente React principal — toda la UI y lógica del álbum |
| `index.html` | Punto de entrada HTML — carga los scripts y define el título de la página |

Los archivos con sufijo `_2022` son la implementación concreta del Mundial Qatar 2022.
Al clonar el repositorio para un nuevo torneo, crear equivalentes con el sufijo del nuevo torneo
(ej: `albumConfig_EURO2028.js`, `playerNames_EURO2028.js`, etc.).

---

## Sección 2: Dos tipos de álbum

Esta arquitectura soporta dos paradigmas de numeración de figuritas:

### Álbum por equipos (ej: Mundial 2022, Mundial 2026)

Las figuritas se identifican con un código de equipo más un número (`ARG1`, `FWC3`, `PANINI`).
El código interno **es** el código visible en el front — no requiere diccionarios de traducción.
El usuario busca por código de equipo o por nombre de jugador.

### Álbum numerado (ej: CWC 2025)

Las figuritas tienen un código interno por equipo (`PAL1`, `RMA18`) pero el usuario ve
un número correlativo único en todo el álbum (`5`, `547`).
Se implementa mediante dos diccionarios bidireccionales exportados desde `albumConfig_*.js`.
El almacenamiento interno siempre usa los códigos — los diccionarios solo afectan la capa de presentación.

---

## Sección 3: El sistema de numeración bidireccional

Para álbumes numerados, agregar al final de `albumConfig_*.js` los siguientes diccionarios,
**después** de definir `albumConfig.teams` y la función `getTeamCodes()`:

```js
// Se generan una sola vez al final de albumConfig_*.js
// después de definir albumConfig.teams y la función getTeamCodes()

export const codeToNumber = {}; // "PAL1" → 5
export const numberToCode = {}; // 5 → "PAL1"

let counter = 1;
for (const team of albumConfig.teams) {
  for (const code of getTeamCodes(team)) {
    codeToNumber[code] = counter;
    numberToCode[counter] = code;
    counter++;
  }
}
```

Qué resuelve cada diccionario:

- **`codeToNumber`**: el componente `Sticker` muestra el número visible en lugar del código interno.
  Ejemplo: la figurita `PAL1` se renderiza como `#5`.
- **`numberToCode`**: la búsqueda por número (`"47"`) encuentra la figurita correcta.
  Ejemplo: buscar `"47"` resuelve al código `RMA3` y retorna esa figurita.
- El almacenamiento (Firebase, localStorage, export/import) **nunca se entera** — sigue usando
  códigos internos sin ningún cambio.

### Búsqueda extendida por número

En el JSX, dentro de la función `searchResults`, agregar antes del filtro existente:

```js
// En searchResults, agregar antes del filtro existente:
if (/^\d+$/.test(query)) {
  const code = numberToCode[parseInt(query)];
  if (code) // buscar ese code en searchIndex y devolverlo
}
```

---

## Sección 4: Pasos para clonar a un nuevo torneo

1. **Crear nuevo repositorio** en GitHub a partir de este — no modificar este repositorio.

2. **Crear los 5 archivos con el sufijo del nuevo torneo** en el nuevo repositorio
   (ej: `_EURO2028`). Copiar el contenido de los archivos `_2022` como punto de partida.

3. **En `albumConfig_*.js`**:
   - Actualizar `id` (debe ser único por álbum — ver Sección 5)
   - Actualizar `owner`, `title`, `subtitle`, `totalStickers`, `teamStickerCount`
   - Actualizar la lista de `competingTeams`, los grupos en `groups` y `teamGroups`
   - Actualizar las `specialSections` para las secciones no estándar del nuevo torneo
   - Actualizar `albumPalette` con los colores del nuevo torneo (ver Sección 6)
     y reemplazar los valores equivalentes hardcodeados en el JSX
   - Si el álbum es numerado, agregar los diccionarios `codeToNumber`/`numberToCode` al final

4. **En `playerNames_*.js`**: agregar todos los equipos con labels genéricos (`"Jugador N"`)
   que luego se pueden completar con los nombres reales.

5. **En `teamThemes_*.js`**: definir gradientes con colores institucionales de cada equipo o club.
   Usar clases Tailwind `from-`, `via-`, `to-`. Agregar `dark: true` cuando el texto sobre ese
   fondo deba ser claro (blanco).

6. **En `firebase_*.js`**: dejar config vacía `""` al inicio y cambiar el nombre de la app en
   `initializeApp(config, 'nombre-unico')`. El nombre debe ser único entre todos los álbumes.

7. **En `panini_virtual_album_*_app.jsx`**: cambiar **solo los 5 imports** del tope del archivo
   para apuntar a los nuevos archivos con el sufijo del torneo. Si es álbum numerado, agregar
   la importación de `codeToNumber`/`numberToCode` y aplicar los cambios en el componente
   `Sticker` y la función de búsqueda.

8. **En `index.html`**: actualizar las referencias a los nuevos archivos y el `<title>`.

9. **Configurar Firebase**: completar las credenciales reales en `firebase_*.js` con los datos
   del proyecto Firebase del nuevo álbum.

10. **Habilitar GitHub Pages** en el nuevo repositorio (Settings → Pages → rama `main`, carpeta `/`).

11. **Agregar el nuevo álbum** a la vista "Otros Proyectos" en todos los repositorios existentes
    siguiendo el procedimiento documentado en la Sección 8.

---

## Sección 5: El campo `id` y Firebase

El campo `id` dentro de `albumConfig` es **la decisión de diseño más importante** al crear un álbum.

```js
export const albumConfig = {
  id: 'paniniWorldCup2022',  // clave usada en localStorage y Firestore
  ...
};
```

- Es la clave con la que se escribe en Firestore: `doc(db, 'albumProgress', albumConfig.id)`
- **Debe ser único por álbum** — permite compartir el mismo proyecto Firebase entre todos los
  álbumes sin ninguna colisión de datos.
- La estructura resultante en Firestore queda así:

```
albumProgress/
  ├── paniniWorldCup2026
  ├── paniniWorldCup2022
  └── paniniCWC2025
```

- El fallback `localStorage → Firestore` garantiza que el progreso nunca se pierde aunque
  Firebase no esté configurado todavía. Ideal para desarrollo y pruebas locales.

---

## Sección 6: Paleta general del álbum

Cada `albumConfig_*.js` exporta una constante `albumPalette` con la identidad visual del álbum:

```js
export const albumPalette = {
  name: 'Qatar 2022',
  primary: '#7B1010',       // vinotinto — fondo general de la app
  secondary: '#B8860B',     // dorado oscuro — acentos, bordes
  accent: '#FFD700',        // dorado brillante — highlights, progress bar
  headerBg: '#ffffff',      // fondo del header en modo claro
  headerBgDark: '#1a1a2e',  // fondo del header en modo oscuro
  darkBase: '#0f0f1a',      // fondo general en modo oscuro
  darkCard: '#1e1e30',      // fondo de cards en modo oscuro
  text: '#1e293b',          // texto principal modo claro
  textDark: '#ffffff',      // texto principal modo oscuro
};
```

- Es el **lugar canónico** donde definir la identidad visual dominante del álbum.
- Al clonar, actualizar sus valores y reemplazar los equivalentes hardcodeados en el JSX.
- Esta constante es de referencia — no reemplaza automáticamente los valores en el JSX,
  pero sirve de guía para saber qué valores buscar y reemplazar.

### Ejemplos de referencia por torneo

| Torneo | `primary` | `accent` | Notas |
|---|---|---|---|
| Qatar 2022 | `#7B1010` vinotinto | `#FFD700` dorado brillante | Identidad oficial Qatar |
| CWC 2025 | `#000000` negro | `#B8860B` dorado oscuro | Estética premium oscura |
| Mundial 2026 | multicolor | gradiente | Identidad multicolor USA-CAN-MEX |

---

## Sección 7: Decisiones de diseño a respetar

Estas decisiones no son obvias y deben mantenerse en cualquier nuevo álbum:

- **`lastSectionCode`** define qué sección cierra el álbum. El botón "siguiente" desde esa
  sección vuelve a HOME. Siempre debe apuntar a la última sección de navegación.

- **`specialSections`** permiten figuritas que no siguen el patrón estándar de equipo + número.
  Usarlas para intros, estadios, secciones promocionales, o equipos con conteo distinto al estándar.
  Soportan dos formas: lista explícita con `stickers: [...]` o generación automática con
  `codePrefix`, `codeStart` y `count`.

- **`promoCodePrefix`** excluye ciertas figuritas del conteo total visible. Útil para secciones
  promocionales (ej: Coca-Cola) que no forman parte del álbum "oficial".

- Los **gradientes** en `teamThemes_*.js` usan clases Tailwind `from-`, `via-`, `to-`.
  La propiedad `dark: true` indica que el texto sobre ese fondo debe ser claro (blanco).
  Sin esa propiedad, el texto usa el color oscuro por defecto.

- El **fallback localStorage → Firestore** es intencional. Permite que el álbum funcione
  completamente offline o sin credenciales de Firebase configuradas. No eliminar ese fallback.

- Los diccionarios **`codeToNumber` / `numberToCode`** (álbumes numerados) deben generarse
  al final del archivo de config, después de que `albumConfig.teams` esté definido, para
  garantizar el orden correcto de los números correlativos.

---

## Sección 8: Cómo agregar un nuevo álbum a la vista "Otros Proyectos"

Cada álbum tiene un menú de navegación entre proyectos que lista los demás álbumes disponibles.
Cada vez que se crea un nuevo álbum, este procedimiento debe aplicarse en **todos** los repositorios existentes.

### Estructura del array `PROYECTOS`

El array vive en el JSX principal (`panini_virtual_album_*_app.jsx`):

```js
const PROYECTOS = [
  {
    id: 'paniniWorldCup2026',
    label: 'Mundial 2026',
    url: 'https://facuca86.github.io/albumvirtual/',
    style: 'multicolor',
  },
  {
    id: 'paniniWorldCup2022',
    label: 'Mundial 2022 · Qatar',
    url: 'https://facuca86.github.io/albumvirtual-2022/',
    style: 'qatar',
  },
  {
    id: 'paniniCWC2025',
    label: 'Club World Cup 2025',
    url: 'https://facuca86.github.io/albumvirtual-cwc25/',
    style: 'cwc',
  },
];
```

### Reglas de visibilidad y estilos

- El álbum actual se detecta comparando `proyecto.id` con `albumConfig.id` — el proyecto
  actual **no se muestra** en la lista (no tendría sentido navegar al álbum que ya estás viendo).
- Los botones navegan en la misma pestaña: `onClick={() => { window.location.href = proyecto.url; }}`

Cada estilo tiene su tratamiento visual definido en el JSX:

| `style` | Estilos aplicados |
|---|---|
| `multicolor` | `background: linear-gradient(135deg, #e53e3e, #dd6b20, #d69e2e, #38a169, #3182ce, #805ad5)`, texto blanco |
| `qatar` | `backgroundColor: '#6B0F1A'`, `border: '2px solid #B8860B'`, texto blanco |
| `cwc` | `backgroundColor: '#000000'`, `border: '2px solid #B8860B'`, texto dorado (`text-yellow-400`) |

Al agregar un nuevo álbum, definir un nuevo valor de `style` con su tratamiento visual
representativo del torneo y agregarlo al bloque de estilos del componente.

### Pasos para agregar un nuevo álbum

1. Agregar una nueva entrada al array `PROYECTOS` en el JSX de **cada repositorio existente**.
2. Definir el estilo visual del nuevo álbum y agregarlo al bloque condicional de estilos del componente.
3. El nuevo repositorio ya trae el array `PROYECTOS` actualizado desde su creación (fue clonado con la versión más reciente).
4. Crear un pull request en cada repositorio con título `feat: agregar [nombre álbum] a otros proyectos`.

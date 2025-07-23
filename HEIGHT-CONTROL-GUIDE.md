# 📐 Guía de Control de Altura - FocusLocus

## 🎯 Elementos Principales y Dónde Modificar

### 1. **ALTURA TOTAL DE LA APP**

**Archivo:** `src/styles/Home.css`
**Selector:** `.home`
**Líneas:** 8-9

```css
.home {
  height: 100%; /* ← CAMBIAR AQUÍ para altura total */
  min-height: 100%; /* ← CAMBIAR AQUÍ para altura mínima */
}
```

**Opciones comunes:**

- `height: 100vh;` - Altura completa del viewport
- `height: calc(100vh - 2rem);` - Altura menos un margen
- `height: 80vh;` - 80% de la altura del viewport

---

### 2. **PADDING INTERNO EN DESKTOP**

**Archivo:** `src/styles/Home.css`
**Selector:** `.home__content-main` (dentro del media query 1024px+)
**Líneas:** 57

```css
@media (min-width: 1024px) {
  .home__content-main {
    padding: 1rem 1.25rem 1.5rem; /* ← CAMBIAR padding bottom (1.5rem) */
  }
}
```

**El tercer valor (1.5rem) controla el espacio inferior donde no llegan las listas.**

---

### 3. **PADDING EN PANTALLAS GRANDES**

**Archivo:** `src/styles/Home.css`
**Selector:** `.home__content-main` (dentro del media query 1280px+)
**Líneas:** 69

```css
@media (min-width: 1280px) {
  .home__content-main {
    padding: 1.25rem 1.5rem 2rem; /* ← CAMBIAR padding bottom (2rem) */
  }
}
```

---

### 4. **ALTURA DEL CONTENEDOR PADRE (AppLayout)**

**Archivo:** `src/styles/AppLayout.css`
**Selector:** `.app-layout`
**Líneas:** 2-4

```css
.app-layout {
  height: 100vh; /* ← Altura del contenedor padre */
  height: -webkit-fill-available; /* ← Para iOS Safari */
}
```

---

### 5. **ALTURA GLOBAL (HTML/BODY)**

**Archivo:** `src/index.css`
**Selector:** `html, body, #root`
**Líneas:** 4-7

```css
html,
body {
  height: 100%; /* ← Altura base de la página */
  min-height: 100vh; /* ← Altura mínima del viewport */
}

#root {
  height: 100%; /* ← Altura del contenedor React */
}
```

---

## 🔧 Cambios Comunes

### Reducir el espacio inferior en desktop:

```css
/* En Home.css, línea ~57 */
@media (min-width: 1024px) {
  .home__content-main {
    padding: 1rem 1.25rem 0.5rem; /* Cambiar 1.5rem → 0.5rem */
  }
}
```

### Hacer la app más compacta:

```css
/* En Home.css, líneas 8-9 */
.home {
  height: calc(100vh - 1rem); /* Restar espacio al viewport */
  min-height: calc(100vh - 1rem);
}
```

### Aumentar el área de contenido:

```css
/* En Home.css, línea ~69 */
@media (min-width: 1280px) {
  .home__content-main {
    padding: 1rem 1.5rem 3rem; /* Aumentar padding bottom */
  }
}
```

---

## 🚫 **NO TOCAR** (Se manejan automáticamente)

- `.home__content` - Se ajusta automáticamente al `.home`
- `.list__container` - Controla el scroll interno de las listas
- Flexbox properties (`flex: 1`, `min-height: 0`) - Son para el layout interno

---

## 🧪 Testing

Usa el archivo `test-layout.html` en la raíz del proyecto para probar diferentes resoluciones:

```bash
# Abrir en navegador
open test-layout.html
```

O modificar directamente en DevTools del navegador para pruebas rápidas.

/**
 * Viewport Height Fix para iOS Safari y otros navegadores móviles
 *
 * Safari iOS cambia la altura del viewport cuando aparecen/desaparecen
 * las barras de navegación. Esta función detecta la altura real y la
 * configura como variable CSS --vh para usar en los estilos.
 */

let timeoutId = null;

function setViewportHeight() {
  // Obtener la altura real del viewport
  const vh = window.innerHeight * 0.01;

  // Configurar la variable CSS --vh
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  // Debug: mostrar en consola la altura detectada (solo en desarrollo)
  if (import.meta.env?.DEV) {
    console.log(
      `📱 Viewport height detected: ${window.innerHeight}px (--vh: ${vh}px)`
    );
  }
}

function handleResize() {
  // Debounce para evitar demasiadas actualizaciones
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    setViewportHeight();
  }, 150);
}

// Configurar altura inicial
setViewportHeight();

// Escuchar cambios de tamaño de ventana
window.addEventListener("resize", handleResize);

// Escuchar cambios de orientación (importante para móviles)
window.addEventListener("orientationchange", () => {
  // Esperar un poco después del cambio de orientación
  setTimeout(setViewportHeight, 300);
});

// Para dispositivos iOS, también escuchar eventos de scroll
// (las barras de Safari aparecen/desaparecen al hacer scroll)
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;

      // Solo actualizar si hay un cambio significativo en el scroll
      if (Math.abs(currentScrollY - lastScrollY) > 50) {
        setTimeout(setViewportHeight, 100);
        lastScrollY = currentScrollY;
      }
    },
    { passive: true }
  );
}

// Exportar función para uso manual si es necesario
export { setViewportHeight };

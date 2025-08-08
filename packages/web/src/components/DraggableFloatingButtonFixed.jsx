import React, { useEffect, useState } from "react";

/**
 * Wrapper para hacer botones flotantes arrastrables - VERSIÓN FIJA
 * @param {React.ReactNode} children - El contenido del botón flotante
 * @param {string} storageKey - Clave única para guardar la posición en localStorage
 * @param {Object} defaultPosition - Posición por defecto { bottom?: number, right?: number, left?: number, top?: number }
 * @param {boolean} enabled - Si el arrastre está habilitado
 */
function DraggableFloatingButtonFixed({
  children,
  storageKey,
  defaultPosition = { bottom: 16, right: 16 },
  enabled = true,
}) {
  const [savedPosition, setSavedPosition] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar posición guardada del localStorage al montar
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`floating-btn-${storageKey}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedPosition(parsed);
        } catch (e) {
          console.warn("Error parsing saved position:", e);
        }
      }
    }
    setIsInitialized(true);
  }, [storageKey]);

  // Función para resetear a posición original
  const resetToDefault = () => {
    if (storageKey) {
      localStorage.removeItem(`floating-btn-${storageKey}`);
      setSavedPosition(null);
    }
  };

  // Calcular estilos de posicionamiento
  const getPositionStyles = () => {
    const styles = {
      position: "fixed",
      zIndex: 9999,
    };

    // Si hay una posición guardada, usarla
    if (savedPosition && isInitialized) {
      styles.transform = `translate(${savedPosition.x}px, ${savedPosition.y}px)`;
    } else if (!savedPosition) {
      // Solo aplicar posición por defecto si no hay posición guardada
      if (defaultPosition.bottom !== undefined)
        styles.bottom = `${defaultPosition.bottom}px`;
      if (defaultPosition.top !== undefined)
        styles.top = `${defaultPosition.top}px`;
      if (defaultPosition.left !== undefined)
        styles.left = `${defaultPosition.left}px`;
      if (defaultPosition.right !== undefined)
        styles.right = `${defaultPosition.right}px`;
    }

    return styles;
  };

  // Combinar estilos
  const combinedStyles = {
    ...getPositionStyles(),
    transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
    cursor: enabled ? "grab" : "default",
    userSelect: "none",
  };

  // DEBUG: Log para ver qué está pasando
  console.log("DraggableFloatingButtonFixed render:", {
    storageKey,
    savedPosition,
    isInitialized,
    combinedStyles,
    children: !!children,
  });

  return (
    <div
      style={combinedStyles}
      onDoubleClick={resetToDefault}
      title={enabled ? "Doble click para resetear posición." : undefined}
    >
      {children}
    </div>
  );
}

export default DraggableFloatingButtonFixed;

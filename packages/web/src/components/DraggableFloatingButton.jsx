import React, { useEffect, useState } from "react";
import { useDraggable } from "@focus-locus/core";
// import "../styles/DraggableFloatingButtons.css"; // TEMPORALMENTE DESACTIVADO

/**
 * Wrapper para hacer botones flotantes arrastrables
 * @param {React.ReactNode} children - El contenido del botón flotante
 * @param {string} storageKey - Clave única para guardar la posición en localStorage
 * @param {Object} defaultPosition - Posición por defecto { bottom?: number, right?: number, left?: number, top?: number }
 * @param {boolean} enabled - Si el arrastre está habilitado
 */
function DraggableFloatingButton({
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

  const {
    elementRef,
    isDragging,
    position,
    resetPosition,
    dragHandlers,
    style: dragStyle,
  } = useDraggable({
    enabled,
    onDragStart: () => {
      document.body.classList.add("dragging-cursor");
    },
    onDragEnd: () => {
      // Guardar nueva posición en localStorage
      if (storageKey && (position.x !== 0 || position.y !== 0)) {
        const currentPosition = {
          x: position.x,
          y: position.y,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          `floating-btn-${storageKey}`,
          JSON.stringify(currentPosition)
        );
        setSavedPosition(currentPosition);
      }
      document.body.classList.remove("dragging-cursor");
    },
  });

  // Función para resetear a posición original
  const resetToDefault = () => {
    resetPosition();
    if (storageKey) {
      localStorage.removeItem(`floating-btn-${storageKey}`);
      setSavedPosition(null);
    }
  };

  // Calcular estilos de posicionamiento
  const getPositionStyles = () => {
    const styles = {
      position: "fixed",
      zIndex: 9999, // Cambiado de 50 a 9999 para asegurar visibilidad
    };

    // Si hay una posición guardada y no estamos arrastrando, usarla
    if (savedPosition && !isDragging && isInitialized) {
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

  // Combinar estilos: posición base + transform del drag
  const combinedStyles = {
    ...getPositionStyles(),
    ...(isDragging ? dragStyle : {}),
    transition: isDragging
      ? "none"
      : "transform 0.2s ease-out, box-shadow 0.2s ease-out",
  };

  // DEBUG: Log para ver qué está pasando
  console.log("DraggableFloatingButton render:", {
    storageKey,
    savedPosition,
    isInitialized,
    isDragging,
    combinedStyles,
    children: !!children,
  });

  // DEBUG ESPECÍFICO para sync-status
  if (storageKey === "sync-status") {
    console.log("🔍 SYNC-STATUS DEBUG:", {
      getPositionStyles: getPositionStyles(),
      dragStyle,
      defaultPosition,
      combinedStyles,
    });
  }

  return (
    <div
      ref={elementRef}
      style={{
        ...combinedStyles,
        // Forzar visibilidad
        display: "block !important",
        visibility: "visible !important",
        opacity: "1 !important",
      }}
      {...dragHandlers}
      onDoubleClick={resetToDefault}
      title={
        enabled ? "Arrastra para mover. Doble click para resetear." : undefined
      }
    >
      {/* Contenido del botón - SIN WRAPPER */}
      {children}
    </div>
  );
}

export default DraggableFloatingButton;

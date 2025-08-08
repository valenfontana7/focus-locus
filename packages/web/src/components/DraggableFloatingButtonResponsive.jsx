import React, { useEffect, useState, useCallback } from "react";

/**
 * Wrapper para hacer botones flotantes arrastrables - VERSIÓN RESPONSIVE
 * @param {React.ReactNode} children - El contenido del botón flotante
 * @param {string} storageKey - Clave única para guardar la posición en localStorage
 * @param {Object} defaultPosition - Posición por defecto { bottom?: number, right?: number, left?: number, top?: number }
 * @param {boolean} enabled - Si el arrastre está habilitado
 * @param {boolean} showDragHandle - Si mostrar un handle visible para drag (opcional)
 */
function DraggableFloatingButtonResponsive({
  children,
  storageKey,
  defaultPosition = { bottom: 16, right: 16 },
  enabled = true,
  showDragHandle = false,
}) {
  const [savedPosition, setSavedPosition] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentOffset, setCurrentOffset] = useState({ x: 0, y: 0 });

  // Función para validar y corregir posiciones fuera de pantalla
  const validateAndFixPosition = useCallback(
    (position, size) => {
      if (!position || !size.width || !size.height) return position;

      const elementSize = 100; // Reducido de 300px para ser menos restrictivo
      const margin = 10; // Reducido margen para más flexibilidad

      let { x, y } = position;

      // Calcular los límites de la pantalla
      const maxX = size.width - elementSize - margin;
      const maxY = size.height - elementSize - margin;
      const minX = margin;
      const minY = margin;

      // Ajustar si está fuera de los límites
      let needsUpdate = false;
      if (x > maxX) {
        x = maxX;
        needsUpdate = true;
      }
      if (x < minX) {
        x = minX;
        needsUpdate = true;
      }
      if (y > maxY) {
        y = maxY;
        needsUpdate = true;
      }
      if (y < minY) {
        y = minY;
        needsUpdate = true;
      }

      // Si la posición cambió, guardar la nueva posición
      if (needsUpdate) {
        const correctedPosition = { ...position, x, y };
        if (storageKey) {
          localStorage.setItem(
            `floating-btn-${storageKey}`,
            JSON.stringify(correctedPosition)
          );
        }
        console.log("Position corrected for screen size:", correctedPosition);
        return correctedPosition;
      }

      return position;
    },
    [storageKey] // Solo depende de storageKey, no de savedPosition
  );

  // Detectar cambios de resolución
  useEffect(() => {
    const updateWindowSize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setWindowSize(newSize);
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  // Validar posición solo cuando se carga desde localStorage
  // La validación en tiempo real se hará al hacer drag, no en resize

  // Cargar posición guardada del localStorage al montar
  useEffect(() => {
    if (storageKey && windowSize.width > 0) {
      const saved = localStorage.getItem(`floating-btn-${storageKey}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Validar que la posición guardada sigue siendo válida
          const validatedPosition = validateAndFixPosition(parsed, windowSize);
          setSavedPosition(validatedPosition);
        } catch (e) {
          console.warn("Error parsing saved position:", e);
        }
      }
    }
    setIsInitialized(true);
  }, [storageKey, windowSize, validateAndFixPosition]);

  // Event handlers para drag
  const handleMouseDown = useCallback(
    (e) => {
      if (!enabled) return;

      console.log("Mouse down on drag area", e.target);
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - currentOffset.x,
        y: e.clientY - currentOffset.y,
      });

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [enabled, currentOffset]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setCurrentOffset(newOffset);
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Guardar nueva posición
    if (storageKey && (currentOffset.x !== 0 || currentOffset.y !== 0)) {
      const newPosition = {
        x: currentOffset.x,
        y: currentOffset.y,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `floating-btn-${storageKey}`,
        JSON.stringify(newPosition)
      );
      setSavedPosition(newPosition);
    }
  }, [isDragging, currentOffset, storageKey]);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e) => {
      if (!enabled) return;

      console.log("Touch start on drag area", e.target);
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - currentOffset.x,
        y: touch.clientY - currentOffset.y,
      });
    },
    [enabled, currentOffset]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const touch = e.touches[0];
      const newOffset = {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      };
      setCurrentOffset(newOffset);
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Guardar nueva posición
    if (storageKey && (currentOffset.x !== 0 || currentOffset.y !== 0)) {
      const newPosition = {
        x: currentOffset.x,
        y: currentOffset.y,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `floating-btn-${storageKey}`,
        JSON.stringify(newPosition)
      );
      setSavedPosition(newPosition);
    }
  }, [isDragging, currentOffset, storageKey]);

  // Event listeners globales
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Sincronizar offset con posición guardada SOLO si realmente cambió
  useEffect(() => {
    if (
      savedPosition &&
      !isDragging &&
      (currentOffset.x !== savedPosition.x ||
        currentOffset.y !== savedPosition.y)
    ) {
      setCurrentOffset({ x: savedPosition.x, y: savedPosition.y });
    }
  }, [savedPosition, isDragging, currentOffset]);

  // Función para resetear a posición original
  const resetToDefault = () => {
    if (storageKey) {
      localStorage.removeItem(`floating-btn-${storageKey}`);
      setSavedPosition(null);
      setCurrentOffset({ x: 0, y: 0 });
    }
  };

  // Calcular estilos de posicionamiento
  const getPositionStyles = () => {
    const styles = {
      position: "fixed",
      zIndex: 9999,
    };

    // Si hay una posición guardada válida o currentOffset, usarla
    if (
      (savedPosition || currentOffset.x !== 0 || currentOffset.y !== 0) &&
      isInitialized &&
      windowSize.width > 0
    ) {
      const x = currentOffset.x || (savedPosition ? savedPosition.x : 0);
      const y = currentOffset.y || (savedPosition ? savedPosition.y : 0);
      styles.transform = `translate(${x}px, ${y}px)`;
      // Usar top/left como base para el transform
      styles.top = "0px";
      styles.left = "0px";
    } else {
      // Usar posición por defecto responsive
      if (defaultPosition.bottom !== undefined) {
        const responsiveBottom = Math.min(
          defaultPosition.bottom,
          windowSize.height * 0.1
        );
        styles.bottom = `${responsiveBottom}px`;
      }
      if (defaultPosition.top !== undefined) {
        const responsiveTop = Math.min(
          defaultPosition.top,
          windowSize.height * 0.1
        );
        styles.top = `${responsiveTop}px`;
      }
      if (defaultPosition.left !== undefined) {
        const responsiveLeft = Math.min(
          defaultPosition.left,
          windowSize.width * 0.1
        );
        styles.left = `${responsiveLeft}px`;
      }
      if (defaultPosition.right !== undefined) {
        const responsiveRight = Math.min(
          defaultPosition.right,
          windowSize.width * 0.1
        );
        styles.right = `${responsiveRight}px`;
      }
    }

    return styles;
  };

  // Combinar estilos
  const combinedStyles = {
    ...getPositionStyles(),
    transition: isDragging
      ? "none"
      : "transform 0.2s ease-out, box-shadow 0.2s ease-out",
    cursor: enabled ? (isDragging ? "grabbing" : "grab") : "default",
    userSelect: "none",
    // Asegurar visibilidad y responsive
    maxWidth: "min(350px, 90vw)",
    maxHeight: "min(400px, 80vh)",
    overflow: "hidden",
  };

  // DEBUG: Log para ver qué está pasando
  console.log("DraggableFloatingButtonResponsive render:", {
    storageKey,
    savedPosition,
    windowSize,
    isInitialized,
    defaultPosition,
    children: !!children,
  });

  return (
    <div
      style={combinedStyles}
      onDoubleClick={resetToDefault}
      title={enabled ? "Doble click para resetear posición." : undefined}
    >
      {children}

      {/* Handle de drag siempre visible cuando está habilitado */}
      {enabled && (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: "absolute",
            top: showDragHandle ? "-8px" : "2px",
            right: showDragHandle ? "-8px" : "2px",
            width: showDragHandle ? "20px" : "12px",
            height: showDragHandle ? "20px" : "12px",
            background: showDragHandle ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
            borderRadius: "50%",
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: showDragHandle ? "10px" : "8px",
            zIndex: 100,
            userSelect: "none",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
          title="Arrastra para mover"
        >
          {showDragHandle ? "⋮⋮" : "⋯"}
        </div>
      )}
    </div>
  );
}

export default DraggableFloatingButtonResponsive;

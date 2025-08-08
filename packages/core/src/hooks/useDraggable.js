import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook personalizado para hacer elementos arrastrables
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.enabled - Si el arrastre está habilitado
 * @param {function} options.onDragStart - Callback al iniciar arrastre
 * @param {function} options.onDragEnd - Callback al terminar arrastre
 */
export const useDraggable = (options = {}) => {
  const { enabled = true, onDragStart, onDragEnd } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const elementRef = useRef(null);
  const handleRef = useRef(null);

  // Resetear posición cuando se deshabilita
  useEffect(() => {
    if (!enabled) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [enabled]);

  const handleMouseDown = useCallback(
    (e) => {
      if (!enabled || !elementRef.current) return;

      // Solo permitir arrastre si se hace clic en el handle o no hay handle específico
      if (handleRef.current && !handleRef.current.contains(e.target)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = elementRef.current.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      setDragStart({ x: startX, y: startY });
      setIsDragging(true);

      onDragStart?.();
    },
    [enabled, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !elementRef.current) return;

      e.preventDefault();

      const newX =
        e.clientX -
        dragStart.x -
        (elementRef.current.offsetParent?.offsetLeft || 0);
      const newY =
        e.clientY -
        dragStart.y -
        (elementRef.current.offsetParent?.offsetTop || 0);

      // Obtener dimensiones del viewport y del elemento
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const elementRect = elementRef.current.getBoundingClientRect();

      // Limitar el movimiento dentro del viewport
      const maxX = viewportWidth - elementRect.width;
      const maxY = viewportHeight - elementRect.height;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  // Agregar event listeners globales
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // Prevenir selección de texto

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Soporte para touch (móvil)
  const handleTouchStart = useCallback(
    (e) => {
      if (!enabled || !elementRef.current) return;

      if (handleRef.current && !handleRef.current.contains(e.target)) {
        return;
      }

      const touch = e.touches[0];
      const rect = elementRef.current.getBoundingClientRect();
      const startX = touch.clientX - rect.left;
      const startY = touch.clientY - rect.top;

      setDragStart({ x: startX, y: startY });
      setIsDragging(true);

      onDragStart?.();
    },
    [enabled, onDragStart]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !elementRef.current) return;

      e.preventDefault();

      const touch = e.touches[0];
      const newX =
        touch.clientX -
        dragStart.x -
        (elementRef.current.offsetParent?.offsetLeft || 0);
      const newY =
        touch.clientY -
        dragStart.y -
        (elementRef.current.offsetParent?.offsetTop || 0);

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const elementRect = elementRef.current.getBoundingClientRect();

      const maxX = viewportWidth - elementRect.width;
      const maxY = viewportHeight - elementRect.height;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  // Event listeners para touch
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  // Función para resetear posición
  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    elementRef,
    handleRef,
    isDragging,
    position,
    resetPosition,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? "grabbing" : "grab",
    },
  };
};

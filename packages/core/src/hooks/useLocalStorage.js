import { useState, useEffect } from "react";

/**
 * Hook personalizado para manejar localStorage con persistencia de datos
 * Compatible con Safari iOS y acceso desde IP local
 * @param {string} key - Clave para almacenar en localStorage
 * @param {any|function} initialValue - Valor inicial o función que retorna el valor inicial
 * @returns {[any, function]} - Array con el valor actual y función para actualizarlo
 */
function useLocalStorage(key, initialValue) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Verificar si localStorage está disponible
      if (typeof window === "undefined" || !window.localStorage) {
        return typeof initialValue === "function"
          ? initialValue()
          : initialValue;
      }

      // Detectar Safari iOS
      const isSafariIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      // Para Safari iOS, intentar localStorage pero con fallback
      if (isSafariIOS) {
        try {
          const item = window.localStorage.getItem(key);
          if (item) {
            return JSON.parse(item);
          }
        } catch {
          // Safari iOS puede fallar silenciosamente
          console.warn("Safari iOS localStorage falló, usando estado local");
        }
      } else {
        // Para otros navegadores
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }

      return typeof initialValue === "function" ? initialValue() : initialValue;
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Actualizar el estado local primero (siempre funciona)
      setStoredValue(valueToStore);

      // Intentar guardar en localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        // Detectar Safari iOS
        const isSafariIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          /Safari/.test(navigator.userAgent) &&
          !/Chrome/.test(navigator.userAgent);

        if (isSafariIOS) {
          try {
            // Para Safari iOS, usar un try-catch específico
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch {
            // Safari iOS puede fallar silenciosamente, pero el estado local ya se actualizó
            console.warn(
              "Safari iOS localStorage falló al guardar, pero el estado se actualizó"
            );
          }
        } else {
          // Para otros navegadores
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch {
      // En caso de error, al menos actualizar el estado local
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    }
  };

  // Efecto para sincronizar con localStorage en tiempo real (solo para navegadores que lo soporten)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : null;
          setStoredValue(newValue);
        } catch {
          // Ignorar errores de parsing
        }
      }
    };

    // Solo agregar listener si no es Safari iOS
    const isSafariIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent);

    if (typeof window !== "undefined" && !isSafariIOS) {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;

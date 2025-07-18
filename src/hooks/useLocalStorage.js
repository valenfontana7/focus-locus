import { useState, useEffect } from "react";

/**
 * Hook personalizado para manejar localStorage con persistencia de datos
 * @param {string} key - Clave para almacenar en localStorage
 * @param {any|function} initialValue - Valor inicial o función que retorna el valor inicial
 * @returns {[any, function]} - Array con el valor actual y función para actualizarlo
 */
function useLocalStorage(key, initialValue) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) return JSON.parse(item);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    } catch (error) {
      console.error(`Error al leer localStorage key "${key}":`, error);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  // Efecto de sincronización con 'storage' para soporte multi-pestaña
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : null);
        } catch (error) {
          setStoredValue(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  // Función para actualizar el valor
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      const valueToStoreCloned =
        typeof valueToStore === "object" && valueToStore !== null
          ? JSON.parse(JSON.stringify(valueToStore))
          : valueToStore;
      setStoredValue(valueToStoreCloned);
      window.localStorage.setItem(key, JSON.stringify(valueToStoreCloned));
    } catch (error) {
      console.error(`Error al guardar localStorage key "${key}":`, error);
    }
  };

  // Si el valor es null (por storage event), usar el valor inicial
  const valueToReturn =
    storedValue === null
      ? typeof initialValue === "function"
        ? initialValue()
        : initialValue
      : storedValue;

  return [valueToReturn, setValue];
}

export default useLocalStorage;

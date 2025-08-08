import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Hook personalizado para manejar AsyncStorage en React Native
 * @param {string} key - Clave para almacenar en AsyncStorage
 * @param {any|function} initialValue - Valor inicial o función que retorna el valor inicial
 * @returns {[any, function]} - Array con el valor actual y función para actualizarlo
 */
function useAsyncStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar el valor desde AsyncStorage al inicializar
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          setStoredValue(parsedItem);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error(`Error loading ${key} from AsyncStorage:`, error);
        setIsLoaded(true);
      }
    };

    loadStoredValue();
  }, [key]);

  // Función para actualizar el valor
  const setValue = async (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Actualizar el estado local primero
      setStoredValue(valueToStore);

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to AsyncStorage:`, error);
      // En caso de error, revertir el estado local
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    }
  };

  return [storedValue, setValue, isLoaded];
}

export default useAsyncStorage;

import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import "react-native-url-polyfill/auto"; // Polyfill para URLs

// Configurar el WebBrowser para que funcione correctamente con OAuth
WebBrowser.maybeCompleteAuthSession();

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Usar URL de redirección específica que configuramos en Supabase
      const redirectUrl = "focuslocus://auth";

      // Iniciar OAuth con Google usando Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      // Abrir navegador para autenticación
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success") {
        // Extraer los parámetros de la URL de respuesta
        const url = result.url;
        const urlObj = new URL(url);
        const access_token = urlObj.searchParams.get("access_token");
        const refresh_token = urlObj.searchParams.get("refresh_token");

        if (access_token && refresh_token) {
          // Establecer la sesión con los tokens obtenidos
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

          if (sessionError) throw sessionError;
          return { data: sessionData, error: null };
        }
      }

      return {
        data: null,
        error: { message: "Autenticación cancelada o fallida" },
      };
    } catch (error) {
      console.error("Error en Google Sign-In:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
};

export default useAuth;

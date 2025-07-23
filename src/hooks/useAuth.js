import { useState, useEffect } from "react";
import {
  supabase,
  isSupabaseConfigured,
  logSupabaseOperation,
} from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Si Supabase no está configurado, trabajar en modo offline
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setIsOnline(false);
      return;
    }

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logSupabaseOperation("getSession", null, error);
      } else {
        setUser(session?.user ?? null);
        // Solo logear la primera vez que se autentica, no en cada check
        if (session?.user) {
          logSupabaseOperation("getSession", "Usuario autenticado");
        }
      }
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Solo logear eventos importantes, no cada check
      if (event === "SIGNED_IN") {
        logSupabaseOperation("authStateChange", "Usuario autenticado");
      } else if (event === "SIGNED_OUT") {
        logSupabaseOperation("authStateChange", "Usuario desconectado");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para iniciar sesión con email y contraseña
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado");
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      logSupabaseOperation("signIn", null, error);
      throw error;
    }

    logSupabaseOperation("signIn", "Inicio de sesión exitoso");
    return data;
  };

  // Función para registrarse con email y contraseña
  const signUp = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado");
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      logSupabaseOperation("signUp", null, error);
      throw error;
    }

    logSupabaseOperation("signUp", "Registro exitoso");
    return data;
  };

  // Función para cerrar sesión
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      logSupabaseOperation("signOut", null, error);
      throw error;
    }

    logSupabaseOperation("signOut", "Cierre de sesión exitoso");
  };

  // Función para iniciar sesión con Google (opcional)
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado");
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      logSupabaseOperation("signInWithGoogle", null, error);
      throw error;
    }

    logSupabaseOperation("signInWithGoogle", "Inicio con Google iniciado");
    return data;
  };

  return {
    user,
    loading,
    isOnline: isOnline && isSupabaseConfigured(),
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isSupabaseConfigured: isSupabaseConfigured(),
  };
}

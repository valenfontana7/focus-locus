import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno están configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Variables de entorno de Supabase no configuradas. Funcionando en modo localStorage."
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper para verificar si Supabase está disponible
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Helper para logs de debug
export const logSupabaseOperation = (operation, data, error = null) => {
  if (import.meta.env.DEV) {
    if (error) {
      console.error(`🔴 Supabase ${operation}:`, error);
    } else {
      console.log(`🟢 Supabase ${operation}:`, data);
    }
  }
};

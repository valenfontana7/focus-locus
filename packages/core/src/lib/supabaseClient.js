import { createClient } from "@supabase/supabase-js";

// Singleton para mantener una única instancia del cliente
let supabaseInstance = null;
let lastConfig = null;

// Helper para crear cliente de Supabase singleton
export const getSupabaseClient = (config) => {
  if (!config || !config.url || !config.anonKey) {
    return null;
  }

  // Si la configuración cambió o no hay instancia, crear nueva
  const configKey = `${config.url}-${config.anonKey}`;
  const lastConfigKey = lastConfig
    ? `${lastConfig.url}-${lastConfig.anonKey}`
    : null;

  if (!supabaseInstance || configKey !== lastConfigKey) {
    supabaseInstance = createClient(config.url, config.anonKey);
    lastConfig = config;
  }

  return supabaseInstance;
};

// Helper para verificar si Supabase está disponible
export const isSupabaseConfigured = (config) => {
  return config && config.url && config.anonKey;
};

// Helper para logging
export const logSupabaseOperation = (operation, result, error = null) => {
  if (error) {
    console.error(`❌ Supabase ${operation}:`, error);
  } else {
    console.log(`✅ Supabase ${operation}:`, result);
  }
};

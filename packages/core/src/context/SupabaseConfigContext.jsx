import { createContext, useContext } from "react";

const SupabaseConfigContext = createContext(null);

export function SupabaseConfigProvider({ children, config }) {
  return (
    <SupabaseConfigContext.Provider value={config}>
      {children}
    </SupabaseConfigContext.Provider>
  );
}

export function useSupabaseConfig() {
  return useContext(SupabaseConfigContext);
}

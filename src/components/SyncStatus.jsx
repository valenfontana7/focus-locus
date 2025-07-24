import { useProjectContext } from "../context/ProjectContext";
import { useAuthContext } from "../context/AuthContext";
import { useState, useEffect } from "react";
import DraggableFloatingButtonResponsive from "./DraggableFloatingButtonResponsive";

export default function SyncStatus() {
  const { syncStatus, isOnline, syncData, loading } = useProjectContext();
  const { user, signOut, isSupabaseConfigured } = useAuthContext();
  const [isMinimized, setIsMinimized] = useState(false); // Cambiar a false para que aparezca expandido
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px es el breakpoint 'sm' de Tailwind
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-minimizar después de éxito (más rápido en mobile)
  useEffect(() => {
    if (syncStatus === "success" && !isMinimized) {
      const timer = setTimeout(
        () => {
          setIsMinimized(true);
        },
        isMobile ? 2000 : 3000
      ); // 2s en mobile, 3s en desktop

      return () => clearTimeout(timer);
    }
  }, [syncStatus, isMinimized, isMobile]);

  // Expandir automáticamente cuando hay sincronización o error
  useEffect(() => {
    if (syncStatus === "syncing" || syncStatus === "error") {
      setIsMinimized(false);
    }
  }, [syncStatus]);

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return (
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
        );
      case "success":
        return <span className="text-green-600">✅</span>;
      case "error":
        return <span className="text-red-600">❌</span>;
      case "offline":
        return <span className="text-gray-500">📱</span>;
      default:
        return <span className="text-gray-400">⚪</span>;
    }
  };

  const getSyncText = () => {
    if (!isSupabaseConfigured) return "Modo offline";
    if (!isOnline) return "Sin conexión";

    switch (syncStatus) {
      case "syncing":
        return "Sincronizando...";
      case "success":
        return "Sincronizado";
      case "error":
        return "Error de sync";
      case "offline":
        return "Modo offline";
      default:
        return "Idle";
    }
  };

  return (
    <>
      <DraggableFloatingButtonResponsive
        storageKey="sync-status"
        defaultPosition={{ bottom: 80, right: 16 }}
        enabled={true}
        showDragHandle={false}
      >
        {isMinimized ? (
          // Versión minimizada - solo icono y estado
          <div
            className="bg-white rounded-full shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
            onClick={() => setIsMinimized(false)}
            title={`${getSyncText()}${user ? ` - ${user.email}` : ""}`}
          >
            <div className="flex items-center justify-center w-5 h-5">
              {getSyncIcon()}
            </div>
          </div>
        ) : (
          // Versión completa
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs sm:max-w-sm">
            {/* Header con botón minimizar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getSyncIcon()}
                <span className="text-sm font-medium text-gray-700 truncate">
                  {getSyncText()}
                </span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded ml-2 flex-shrink-0"
                title="Minimizar"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Información del usuario */}
            {user && (
              <div
                className="text-xs text-gray-500 mb-2 truncate"
                title={user.email}
              >
                👤 {user.email}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex space-x-1 sm:space-x-2">
              {isSupabaseConfigured && isOnline && (
                <button
                  onClick={syncData}
                  disabled={loading || syncStatus === "syncing"}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 flex-1 sm:flex-none"
                >
                  🔄 Sync
                </button>
              )}

              {user && (
                <button
                  onClick={signOut}
                  className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100 flex-1 sm:flex-none"
                >
                  Salir
                </button>
              )}
            </div>

            {/* Indicador de configuración */}
            {!isSupabaseConfigured && (
              <div className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded">
                💡 Configura Supabase para persistencia en la nube
              </div>
            )}
          </div>
        )}
      </DraggableFloatingButtonResponsive>
    </>
  );
}

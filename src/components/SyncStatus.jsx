import { useProjectContext } from "../context/ProjectContext";
import { useAuthContext } from "../context/AuthContext";

export default function SyncStatus() {
  const { syncStatus, isOnline, syncData, loading } = useProjectContext();
  const { user, signOut, isSupabaseConfigured } = useAuthContext();

  // No mostrar nada si no hay usuario y Supabase está configurado
  if (isSupabaseConfigured && !user) return null;

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
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        {/* Estado de sincronización */}
        <div className="flex items-center space-x-2 mb-2">
          {getSyncIcon()}
          <span className="text-sm font-medium text-gray-700">
            {getSyncText()}
          </span>
        </div>

        {/* Información del usuario */}
        {user && (
          <div className="text-xs text-gray-500 mb-2">👤 {user.email}</div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-2">
          {isSupabaseConfigured && isOnline && (
            <button
              onClick={syncData}
              disabled={loading || syncStatus === "syncing"}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              🔄 Sync
            </button>
          )}

          {user && (
            <button
              onClick={signOut}
              className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100"
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
    </div>
  );
}

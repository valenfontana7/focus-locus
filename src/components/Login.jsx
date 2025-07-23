import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import AuthDebug from "./AuthDebug";

export default function Login() {
  const { signIn, signUp, signInWithGoogle, loading, isSupabaseConfigured } =
    useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const pendingErrorRef = useRef(null);
  const wasLoadingRef = useRef(false);

  // Cargar error persistente al montar el componente
  useEffect(() => {
    const persistedError = localStorage.getItem("login-error");
    if (persistedError) {
      console.log("🔄 Cargando error persistente:", persistedError);
      setError(persistedError);
      localStorage.removeItem("login-error");
    }
  }, []);

  // Función para establecer error con persistencia
  const setErrorWithPersistence = (errorMessage) => {
    console.log("💾 Estableciendo error con persistencia:", errorMessage);
    setError(errorMessage);
    if (errorMessage) {
      localStorage.setItem("login-error", errorMessage);
    } else {
      localStorage.removeItem("login-error");
    }
  };

  // Debug: log del estado error en cada render (remover en producción)
  // console.log("🔄 Login render - Estado error:", {
  //   error,
  //   length: error?.length,
  // });

  // Efecto para detectar cambios en loading y establecer errores pendientes
  useEffect(() => {
    console.log("🔄 useEffect - loading cambió:", {
      loading,
      wasLoading: wasLoadingRef.current,
      pendingError: pendingErrorRef.current,
    });

    // Si loading cambió de true a false y hay un error pendiente
    if (wasLoadingRef.current && !loading && pendingErrorRef.current) {
      console.log(
        "✅ Loading terminó, estableciendo error pendiente:",
        pendingErrorRef.current
      );
      setErrorWithPersistence(pendingErrorRef.current);
      pendingErrorRef.current = null;
    }

    wasLoadingRef.current = loading;
  }, [loading]);

  // Si Supabase no está configurado, no mostrar login
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔧</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Modo Offline</h2>
          <p className="text-gray-600 mb-4">
            Supabase no está configurado. La aplicación funciona en modo offline
            usando localStorage.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            <p className="font-medium mb-1">
              Para habilitar persistencia en la nube:
            </p>
            <p>1. Crea un proyecto en Supabase</p>
            <p>2. Configura las variables en .env.local</p>
            <p>3. Ejecuta el schema.sql en tu base de datos</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🎬 handleSubmit iniciado - Estado error antes:", { error });
    setErrorWithPersistence("");
    console.log("🧹 Error limpiado al inicio de handleSubmit");

    if (!email || !password) {
      setErrorWithPersistence("Email y contraseña son requeridos");
      return;
    }

    console.log("🔐 Intentando autenticación:", { email, isRegistering });

    let errorToShow = null;

    try {
      if (isRegistering) {
        console.log("📝 Iniciando registro...");
        const result = await signUp(email, password);
        console.log("✅ Registro exitoso:", result);
        setErrorWithPersistence(
          "¡Cuenta creada! Revisa tu email para verificar la cuenta."
        );
      } else {
        console.log("🔑 Iniciando sesión...");
        const result = await signIn(email, password);
        console.log("✅ Inicio de sesión exitoso:", result);
        // Limpiar cualquier error previo en caso de éxito
        setErrorWithPersistence("");
      }
    } catch (error) {
      console.error("❌ Error de autenticación:", error);
      console.log("🔍 Debug error:", {
        message: error.message,
        toString: error.toString(),
        name: error.name,
        fullError: error,
      });

      // Mejorar los mensajes de error
      let errorMessage = "Error de autenticación";

      // Convertir el error a string para detectar el mensaje
      const errorString = error.toString() || error.message || "";
      console.log("🔍 Error string:", errorString);

      if (errorString.includes("Invalid login credentials")) {
        errorMessage = `Email o contraseña incorrectos. ¿Es tu primera vez? Puedes registrarte en su lugar.`;
      } else if (errorString.includes("Email not confirmed")) {
        errorMessage =
          "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
      } else if (errorString.includes("User already registered")) {
        errorMessage = `El email ${email} ya tiene una cuenta. Usa el botón de abajo para cambiar a modo login.`;
        console.log("✅ Mensaje establecido:", errorMessage);
      } else if (errorString.includes("Invalid email")) {
        errorMessage = "El formato del email no es válido.";
      } else if (errorString.includes("Password")) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      } else if (errorString.includes("weak password")) {
        errorMessage = "La contraseña es muy débil. Usa al menos 6 caracteres.";
      } else {
        errorMessage = error.message || error.toString() || "Error desconocido";
      }

      console.log("🎯 Preparando error para mostrar:", errorMessage);
      errorToShow = errorMessage;
    }

    // Establecer el error como pendiente para cuando el loading termine
    if (errorToShow) {
      console.log("🔄 Estableciendo error pendiente:", errorToShow);
      pendingErrorRef.current = errorToShow;

      // También intentar establecer inmediatamente si loading ya es false
      if (!loading) {
        console.log(
          "⚡ Loading ya es false, estableciendo error inmediatamente"
        );
        console.log("⚡ Estado actual antes de setError:", { error, loading });
        setErrorWithPersistence(errorToShow);
        console.log("⚡ setErrorWithPersistence llamado con:", errorToShow);
        pendingErrorRef.current = null;
      }
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      console.log("🔐 Iniciando autenticación con Google...");
      const result = await signInWithGoogle();
      console.log("✅ Google Sign In iniciado:", result);
    } catch (error) {
      console.error("❌ Error de autenticación con Google:", error);
      setErrorWithPersistence(
        error.message || "Error de autenticación con Google"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isRegistering ? "Únete a FocusLocus" : "Bienvenido de vuelta"}
          </p>
        </div>

        {/* Debug del mensaje de error (remover en producción) */}
        {/* {console.log("🔍 Evaluando error para mostrar:", {
          error,
          hasError: !!error,
          errorLength: error?.length,
          willShow: error && error.length > 0,
        })} */}

        {error && (
          <div
            className={`border rounded p-3 mb-4 ${
              error.includes("ya tiene una cuenta") ||
              error.includes("Cambiado a modo login")
                ? "bg-blue-50 border-blue-200"
                : error.includes("¡Cuenta creada!")
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {/* Mostrar mensaje personalizado para usuario existente */}
            {error.includes("ya tiene una cuenta") ? (
              <div>
                <p className="text-blue-800 text-sm">
                  {isRegistering
                    ? "Este email ya tiene una cuenta. Cambiando a modo login..."
                    : "Este email ya tiene una cuenta. Inicia sesión con tu método habitual (contraseña o Google)."}
                </p>

                {/* Botón para cambiar a login cuando el usuario ya existe */}
                {isRegistering && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setErrorWithPersistence("");
                    }}
                    className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
                  >
                    Ir a Iniciar Sesión
                  </button>
                )}
              </div>
            ) : (
              <p
                className={`text-sm ${
                  error.includes("Cambiado a modo login")
                    ? "text-blue-800"
                    : error.includes("¡Cuenta creada!")
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {error}
              </p>
            )}

            {/* Botón para cambiar a registro cuando las credenciales son incorrectas */}
            {error.includes("Email o contraseña incorrectos") &&
              !isRegistering && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setErrorWithPersistence("");
                  }}
                  className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-sm"
                >
                  Crear Cuenta Nueva
                </button>
              )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "Procesando..."
              : isRegistering
              ? "Crear Cuenta"
              : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-3 w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>

        {/* Botón de Debug */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            {showDebug ? "Ocultar Debug" : "Mostrar Debug"}
          </button>
        </div>

        {/* Componente de Debug */}
        {showDebug && (
          <div className="mt-6">
            <AuthDebug />
          </div>
        )}
      </div>
    </div>
  );
}

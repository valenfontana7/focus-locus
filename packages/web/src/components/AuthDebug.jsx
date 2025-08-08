import { useState } from "react";
import { getSupabaseClient, useSupabaseConfig } from "@focus-locus/core";

export default function AuthDebug() {
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);
  const supabaseConfig = useSupabaseConfig();
  const supabase = getSupabaseClient(supabaseConfig);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setTestResult("Probando conexión...");

    try {
      // Probar configuración
      if (!supabase) {
        setTestResult("❌ Supabase no está configurado correctamente");
        setLoading(false);
        return;
      }

      // Probar conexión básica
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setTestResult(`❌ Error al conectar con Supabase: ${error.message}`);
      } else {
        setTestResult(
          `✅ Conexión exitosa. Sesión actual: ${
            data.session ? "Autenticado" : "No autenticado"
          }`
        );
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error.message}`);
    }

    setLoading(false);
  };

  const testEmailSignIn = async () => {
    setLoading(true);
    setTestResult("Probando inicio de sesión...");

    try {
      // Usar credenciales de prueba conocidas
      const testEmail = "test@focuslocus.app";
      const testPassword = "testpassword123";

      console.log("🧪 Probando login con:", { email: testEmail });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        console.error("❌ Error en login:", error);

        let errorMsg = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMsg =
            "❌ Credenciales inválidas. ¿El usuario existe y está confirmado?";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg =
            "❌ Email no confirmado. Deshabilita email confirmations en Supabase.";
        }

        setTestResult(
          `${errorMsg}\n\n💡 Prueba crear el usuario de prueba primero.`
        );
      } else {
        console.log("✅ Login exitoso:", data);
        setTestResult(
          `✅ Login exitoso! Usuario: ${
            data.user?.email || "Email no disponible"
          }\n🎉 ¡Autenticación funcionando correctamente!`
        );
      }
    } catch (error) {
      console.error("❌ Error de login:", error);
      setTestResult(`❌ Error de login: ${error.message}`);
    }

    setLoading(false);
  };

  const createTestUser = async () => {
    setLoading(true);
    setTestResult("Creando usuario de prueba conocido...");

    try {
      const testEmail = "test@focuslocus.app";
      const testPassword = "testpassword123";

      console.log("🧪 Creando usuario de prueba:", { email: testEmail });

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        console.error("❌ Error creando usuario:", error);

        if (error.message.includes("User already registered")) {
          setTestResult(
            `✅ Usuario ya existe. Puedes usar:\n📧 Email: ${testEmail}\n🔐 Password: ${testPassword}`
          );
        } else {
          setTestResult(`❌ Error: ${error.message}`);
        }
      } else {
        console.log("✅ Usuario creado:", data);
        setTestResult(
          `✅ Usuario de prueba creado!\n📧 Email: ${testEmail}\n🔐 Password: ${testPassword}\n\n${
            data.session
              ? "🎉 Ya autenticado!"
              : "⚠️ Confirma email si es necesario"
          }`
        );
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setTestResult(`❌ Error: ${error.message}`);
    }

    setLoading(false);
  };

  const testEmailSignUp = async () => {
    setLoading(true);
    setTestResult("Probando registro de usuario...");

    try {
      // Usar un email único para evitar conflictos
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = "password123";

      console.log("🧪 Probando registro con:", { email: testEmail });

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        console.error("❌ Error en registro:", error);

        // Mensaje específico según el tipo de error
        let errorMsg = error.message;
        if (error.message.includes("User already registered")) {
          errorMsg =
            "❌ Usuario ya registrado. Intenta con otro email o usa login.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "❌ Email no confirmado. Verifica tu bandeja de entrada.";
        }

        setTestResult(errorMsg);
      } else {
        console.log("✅ Registro exitoso:", data);

        let successMsg = `✅ Registro exitoso! Usuario: ${
          data.user?.email || "Email no disponible"
        }`;

        // Verificar si necesita confirmación de email
        if (data.user && !data.session) {
          successMsg +=
            "\n⚠️ Necesitas confirmar tu email antes de hacer login.";
        } else if (data.session) {
          successMsg += "\n🎉 ¡Ya estás autenticado automáticamente!";
        }

        setTestResult(successMsg);
      }
    } catch (error) {
      console.error("❌ Error de registro:", error);
      setTestResult(`❌ Error de registro: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Debug de Autenticación</h2>

      <div className="space-y-4">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Probar Conexión
        </button>

        <button
          onClick={createTestUser}
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Crear Usuario de Prueba
        </button>

        <button
          onClick={testEmailSignUp}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Probar Registro (Random)
        </button>

        <button
          onClick={testEmailSignIn}
          disabled={loading}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Probar Login
        </button>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Variables de entorno:</h3>
          <div className="text-sm bg-gray-100 p-2 rounded">
            <p>
              URL:{" "}
              {import.meta.env.VITE_SUPABASE_URL
                ? "✅ Configurada"
                : "❌ No configurada"}
            </p>
            <p>
              Key:{" "}
              {import.meta.env.VITE_SUPABASE_ANON_KEY
                ? "✅ Configurada"
                : "❌ No configurada"}
            </p>
          </div>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

import "./App.css";
import Home from "./pages/Home";
import Login from "./components/Login";
import SyncStatus from "./components/SyncStatus";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import { AuthProvider, useAuthContext } from "./context/AuthContext";

// Componente que maneja la lógica de autenticación
function AppContent() {
  const { user, loading, isSupabaseConfigured } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-600">Cargando FocusLocus...</p>
        </div>
      </div>
    );
  }

  // Si Supabase está configurado pero no hay usuario, mostrar login
  if (isSupabaseConfigured && !user) {
    return <Login />;
  }

  // Si no hay Supabase configurado o hay usuario autenticado, mostrar app
  return (
    <ProjectProvider>
      <div style={{ height: "100%" }} className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
        </Routes>
        <SyncStatus />
      </div>
    </ProjectProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

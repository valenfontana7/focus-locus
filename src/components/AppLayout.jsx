import { useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HelpOutlineSharpIcon from "@mui/icons-material/HelpOutlineSharp";
import { Link } from "react-router-dom";
import Modal from "./Modal";

function AppLayout({ children }) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header className="header w-full flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-3 md:py-4 lg:py-6">
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-center">
          FocusLocus
        </h1>
        <nav className="flex items-center justify-center">
          <button
            type="button"
            className="mx-1 sm:mx-2 md:mx-3 lg:mx-4 text-black-500 hover:underline focus:outline-none"
            onClick={() => setAboutOpen(true)}
            title="¿Qué es FocusLocus?"
          >
            <HelpOutlineSharpIcon />
          </button>
          <Link
            to="#"
            className="mx-1 sm:mx-2 md:mx-3 lg:mx-4 text-black-500 hover:underline"
          >
            <AccountCircleIcon />
          </Link>
        </nav>
      </header>
      {children}
      <Modal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="¿Qué es FocusLocus?"
        actions={
          <button
            onClick={() => setAboutOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        }
      >
        <div className="space-y-2">
          <p>
            FocusLocus es una app de gestión de tareas y proyectos, diseñada
            para maximizar tu concentración y productividad.
          </p>
          <p>Desarrollado por Valen.</p>
          <a
            href="https://github.com/valenpm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-2 text-blue-600 hover:underline"
          >
            <img
              src="/avatar.jpg"
              alt="Valen"
              className="w-8 h-8 rounded-full"
            />
            GitHub
          </a>
        </div>
      </Modal>
      {/* Aquí podrías renderizar modales globales de edición/borrado si lo deseas */}
    </>
  );
}

export default AppLayout;

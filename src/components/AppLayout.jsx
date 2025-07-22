import { useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HelpOutlineSharpIcon from "@mui/icons-material/HelpOutlineSharp";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import Button from "./Button";

function AppLayout({ children }) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <header className="header w-full flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-3 md:py-4 lg:py-6 flex-shrink-0">
        <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-center">
          FocusLocus
        </h1>
        <nav className="flex items-center justify-center">
          <Button
            variant="secondary"
            className="mx-1 sm:mx-2 md:mx-3 lg:mx-4 p-1 sm:p-2 min-w-0 min-h-0 flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto"
            onClick={() => setAboutOpen(true)}
            title="¿Qué es FocusLocus?"
          >
            <HelpOutlineSharpIcon
              fontSize="small"
              className="!text-sm md:!text-base lg:!text-lg"
            />
          </Button>
          <Link
            to="#"
            className="mx-1 sm:mx-2 md:mx-3 lg:mx-4 text-black-500 hover:underline"
          >
            <AccountCircleIcon
              fontSize="small"
              className="!text-sm md:!text-base lg:!text-lg"
            />
          </Link>
        </nav>
      </header>
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      <Modal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="¿Qué es FocusLocus?"
        actions={
          <Button variant="cancel" onClick={() => setAboutOpen(false)}>
            Cerrar
          </Button>
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
    </div>
  );
}

export default AppLayout;

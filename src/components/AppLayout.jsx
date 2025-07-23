import { useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HelpOutlineSharpIcon from "@mui/icons-material/HelpOutlineSharp";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import Button from "./Button";
import "../styles/AppLayout.css";
import "../styles/Header.css";

function AppLayout({ children, onMenuClick }) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <header className="header w-full flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-1.5 sm:py-2 md:py-3 lg:py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Botón hamburguesa solo visible en mobile */}
          {onMenuClick && (
            <Button
              variant="secondary"
              onClick={onMenuClick}
              className="sm:hidden p-1 flex-shrink-0 min-w-0 min-h-0 w-8 h-8 flex items-center justify-center shadow-none"
              title="Menú"
            >
              <MenuIcon className="text-lg" />
            </Button>
          )}

          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold">
            FocusLocus
          </h1>
        </div>

        <nav className="flex items-center justify-center">
          <Button
            variant="secondary"
            className="mx-0.5 sm:mx-1 md:mx-2 lg:mx-3 p-0.5 sm:p-1 min-w-0 min-h-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-auto md:h-auto"
            onClick={() => setAboutOpen(true)}
            title="¿Qué es FocusLocus?"
          >
            <HelpOutlineSharpIcon
              fontSize="small"
              className="!text-xs sm:!text-sm md:!text-base lg:!text-lg"
            />
          </Button>
          <Link
            to="#"
            className="mx-0.5 sm:mx-1 md:mx-2 lg:mx-3 text-black-500 hover:underline"
          >
            <AccountCircleIcon
              fontSize="small"
              className="!text-xs sm:!text-sm md:!text-base lg:!text-lg"
            />
          </Link>
        </nav>
      </header>
      <div className="flex-1 flex flex-col overflow-hidden pt-16 sm:pt-[4.5rem] md:pt-20 lg:pt-[5.5rem] xl:pt-24">
        {children}
      </div>
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

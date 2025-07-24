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

        <nav className="flex items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="secondary"
            className="p-2 sm:p-2.5 md:p-3 min-w-0 min-h-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12"
            onClick={() => setAboutOpen(true)}
            title="¿Qué es FocusLocus?"
          >
            <HelpOutlineSharpIcon
              fontSize="medium"
              className="!text-lg sm:!text-xl md:!text-2xl lg:!text-2xl"
            />
          </Button>
          <Link
            to="#"
            className="p-2 sm:p-2.5 md:p-3 text-black-500 hover:underline flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded"
          >
            <AccountCircleIcon
              fontSize="medium"
              className="!text-lg sm:!text-xl md:!text-2xl lg:!text-2xl"
            />
          </Link>
        </nav>
      </header>
      <div
        className="app-main-content flex-1 flex flex-col"
        style={{
          overflow: "hidden",
          WebkitOverflowScrolling: "touch",
          position: "relative",
        }}
      >
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

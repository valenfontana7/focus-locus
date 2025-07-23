import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

function SearchBar({ search, setSearch }) {
  const { projects, activeProject, setActiveProject } = useProjectContext();
  const [isMobile, setIsMobile] = useState(false);
  const [changeTimeout, setChangeTimeout] = useState(null);

  // Detectar si estamos en mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Limpiar timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (changeTimeout) {
        clearTimeout(changeTimeout);
      }
    };
  }, [changeTimeout]);

  // Función para manejar el cambio de búsqueda
  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);

    // En mobile, cambiar automáticamente al proyecto que coincida con delay
    if (isMobile && newSearch.trim()) {
      // Limpiar timeout anterior si existe
      if (changeTimeout) {
        clearTimeout(changeTimeout);
      }

      // Usar setTimeout para dar tiempo al usuario a terminar de escribir
      const timeout = setTimeout(() => {
        const matchingProject = projects.find((project) =>
          project.toLowerCase().includes(newSearch.toLowerCase())
        );

        if (matchingProject && matchingProject !== activeProject) {
          setActiveProject(matchingProject);
        }
      }, 300); // 300ms de delay

      setChangeTimeout(timeout);
    }
  };

  return (
    <div className="search-bar relative flex-1 min-w-0">
      <SearchIcon className="absolute left-1.5 sm:left-2 md:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 text-sm sm:text-base" />
      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={search}
        onChange={handleSearchChange}
        className="w-full min-w-[100px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px] pl-7 sm:pl-8 md:pl-10 lg:pl-12 pr-2 sm:pr-3 md:pr-4 py-1 sm:py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm md:text-base"
      />
    </div>
  );
}

export default SearchBar;

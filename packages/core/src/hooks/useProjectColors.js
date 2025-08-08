import React from "react";
import useLocalStorage from "./useLocalStorage";

const COLORS = [
  "#F87171", // rojo
  "#FBBF24", // amarillo
  "#34D399", // verde
  "#60A5FA", // azul
  "#A78BFA", // violeta
  "#F472B6", // rosa
  "#FCD34D", // dorado
  "#38BDF8", // celeste
];

function getRandomColor(usedColors = []) {
  const available = COLORS.filter((c) => !usedColors.includes(c));
  if (available.length === 0)
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export default function useProjectColors(projects) {
  const [projectColors, setProjectColors] = useLocalStorage(
    "focusLocusProjectColors",
    {}
  );

  // Ref para rastrear renombramientos en proceso
  const renamingInProgress = React.useRef(new Set());

  // Ref para rastrear si se está cargando desde Supabase
  const supabaseLoading = React.useRef(false);

  // Escuchar evento de renombramiento de proyecto
  React.useEffect(() => {
    const handleProjectRenamed = (event) => {
      const { oldName, newName } = event.detail;

      // Marcar que está en proceso de renombramiento
      renamingInProgress.current.add(newName);

      setProjectColors((prev) => {
        const updated = { ...prev };

        // Si el proyecto anterior tenía un color, transferirlo al nuevo nombre
        if (prev[oldName]) {
          updated[newName] = prev[oldName];
          delete updated[oldName];
        }

        return updated;
      });

      // Limpiar la bandera después de un pequeño delay
      setTimeout(() => {
        renamingInProgress.current.delete(newName);
      }, 100);
    };

    window.addEventListener("project-renamed", handleProjectRenamed);
    return () => {
      window.removeEventListener("project-renamed", handleProjectRenamed);
    };
  }, [setProjectColors]);

  // Escuchar eventos de carga de Supabase
  React.useEffect(() => {
    const handleSupabaseLoadingStart = () => {
      supabaseLoading.current = true;
    };

    const handleSupabaseLoadingEnd = () => {
      supabaseLoading.current = false;
    };

    window.addEventListener(
      "supabase-loading-start",
      handleSupabaseLoadingStart
    );
    window.addEventListener("supabase-loading-end", handleSupabaseLoadingEnd);

    return () => {
      window.removeEventListener(
        "supabase-loading-start",
        handleSupabaseLoadingStart
      );
      window.removeEventListener(
        "supabase-loading-end",
        handleSupabaseLoadingEnd
      );
    };
  }, []);

  // Asignar color a proyectos nuevos y limpiar proyectos eliminados
  React.useEffect(() => {
    // Evitar múltiples ejecuciones usando un timeout
    const timeoutId = setTimeout(() => {
      setProjectColors((prev) => {
        let changed = false;
        const updated = { ...prev };

        // Asignar colores a proyectos nuevos (solo si no se está cargando desde Supabase)
        (projects || []).forEach((name) => {
          if (
            !updated[name] &&
            !renamingInProgress.current.has(name) &&
            !supabaseLoading.current
          ) {
            const newColor = getRandomColor(Object.values(updated));
            updated[name] = newColor;
            changed = true;
          }
        });

        // Limpiar proyectos eliminados
        Object.keys(updated).forEach((name) => {
          if (
            !(projects || []).includes(name) &&
            !renamingInProgress.current.has(name)
          ) {
            delete updated[name];
            changed = true;
          }
        });

        return changed ? updated : prev;
      });
    }, 50); // Pequeño delay para evitar múltiples ejecuciones

    return () => clearTimeout(timeoutId);
  }, [projects, setProjectColors]);

  // Obtener color de un proyecto
  const getColor = (projectName) => projectColors[projectName] || COLORS[0];

  return {
    getColor,
  };
}

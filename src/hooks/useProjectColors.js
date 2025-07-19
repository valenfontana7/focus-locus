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

  // Asignar color a proyectos nuevos
  React.useEffect(() => {
    setProjectColors((prev) => {
      let changed = false;
      const usedColors = Object.values(prev);
      const updated = { ...prev };
      (projects || []).forEach((name) => {
        if (!updated[name]) {
          updated[name] = getRandomColor(usedColors);
          usedColors.push(updated[name]);
          changed = true;
        }
      });
      // Eliminar colores de proyectos borrados
      Object.keys(updated).forEach((name) => {
        if (!(projects || []).includes(name)) {
          delete updated[name];
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
    // Solo depende de projects
  }, [projects]);

  // Obtener color de un proyecto
  const getColor = (projectName) => projectColors[projectName] || COLORS[0];

  return { getColor };
}

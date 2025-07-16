function getRandomColor() {
  const colors = [
    "#F87171", // rojo
    "#FBBF24", // amarillo
    "#34D399", // verde
    "#60A5FA", // azul
    "#A78BFA", // violeta
    "#F472B6", // rosa
    "#FCD34D", // dorado
    "#38BDF8", // celeste
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function ProjectItem({ projectName }) {
  const color = getRandomColor();
  return (
    <li className="sidebar__list-item mb-2 flex items-center">
      <span
        className="inline-block w-5 h-5 rounded-full mr-3"
        style={{ backgroundColor: color }}
      ></span>
      <span className="flex items-center">{projectName}</span>
    </li>
  );
}

export default ProjectItem;

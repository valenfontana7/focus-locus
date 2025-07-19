import { useState } from "react";

function ProjectItem({ projectName, onDelete, onClick, isActive, color }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className={`sidebar__list-item mb-2 flex items-center justify-between group cursor-pointer rounded-lg p-2 transition-colors ${
        isActive ? "bg-blue-100 font-bold" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span
          className="inline-block w-5 h-5 rounded-full mr-3"
          style={{ backgroundColor: color }}
        ></span>
        <span className="flex items-center">{projectName}</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 transition-opacity opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:visible visible lg:invisible"
          style={{ pointerEvents: "auto" }}
          title="Eliminar proyecto"
        >
          🗑️
        </button>
      )}
    </li>
  );
}

export default ProjectItem;

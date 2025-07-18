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
      {isHovered && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar proyecto"
        >
          🗑️
        </button>
      )}
    </li>
  );
}

export default ProjectItem;

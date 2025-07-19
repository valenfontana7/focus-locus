import React from "react";

/**
 * Componente de botón reutilizable con variantes 'primary' y 'secondary'.
 * @param {Object} props
 * @param {"primary"|"secondary"} [props.variant] - Tipo de botón.
 * @param {string} [props.className] - Clases adicionales.
 * @param {React.ReactNode} props.children - Contenido del botón.
 * @param {React.ReactNode} [props.icon] - Ícono a mostrar al inicio del botón.
 * @param {any} rest - Otros props del botón.
 */
const Button = ({
  variant = "primary",
  className = "",
  children,
  icon,
  ...rest
}) => {
  const base =
    "flex gap-x-4 align-center rounded-lg font-semibold transition-colors focus:outline-none text-lg shadow-md backdrop-blur-md";
  const variants = {
    primary:
      "bg-black/70 text-white hover:bg-black/80 border border-white/20 px-4 py-3",
    secondary:
      "bg-white/40 text-black hover:bg-white/60 border border-gray-200 px-4 py-3",
    danger:
      "bg-red-600/80 text-white hover:bg-red-600/90 border border-white/20 px-4 py-3",
    cancel:
      "bg-gray-200/60 text-black hover:bg-gray-200/80 border border-gray-300 px-4 py-3",
    transparent:
      "bg-transparent text-black hover:bg-black/5 cursor-pointer px-0 py-0",
  };
  return (
    <button
      className={`${base} ${
        variants[variant] || variants.primary
      } ${className}`}
      {...rest}
    >
      {icon && <span className={`mr-2 flex items-center`}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;

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
    "flex gap-x-4 align-center rounded-lg font-semibold transition-colors focus:outline-none text-lg";
  const variants = {
    primary: "bg-gray-600 text-white hover:bg-gray-700 px-4 py-3",
    transparent:
      "bg-transparent text-black hover:bg-transparent cursor-pointer px-0 py-0",
    gray: "bg-gray-300 text-black hover:bg-gray-300 px-4 py-3",
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

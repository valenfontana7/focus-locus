import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { TaskActionContext } from "./context/TaskActionContext";
import { initializeViewportFix } from "./utils/viewportFix.js";

// Detectar navegador y aplicar clase CSS correspondiente
const detectBrowser = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isIOS && isSafari) {
    document.body.classList.add("ios-safari");
  } else if (!isIOS) {
    document.body.classList.add("non-ios-mobile");
  }
};

// Ejecutar detección al cargar
detectBrowser();

// Inicializar el fix de viewport
initializeViewportFix();

const noop = () => {};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TaskActionContext.Provider
      value={{ triggerEdit: noop, triggerDelete: noop }}
    >
      <App />
    </TaskActionContext.Provider>
  </StrictMode>
);

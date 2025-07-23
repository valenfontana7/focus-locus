import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { TaskActionContext } from "./context/TaskActionContext";
// Importar el fix de viewport para iOS Safari
import "./utils/viewportFix.js";

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

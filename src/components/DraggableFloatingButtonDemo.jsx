import React, { useState } from "react";
import DraggableFloatingButton from "./DraggableFloatingButton";
import Button from "./Button";

/**
 * Componente demo para probar botones flotantes arrastrables
 * Opcional: Para testing - se puede eliminar
 */
function DraggableFloatingButtonDemo() {
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          onClick={() => setShowDemo(true)}
          className="text-xs"
        >
          🧪 Demo Drag
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Botón para cerrar demo */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="cancel"
          onClick={() => setShowDemo(false)}
          className="text-xs"
        >
          ✕ Cerrar Demo
        </Button>
      </div>

      {/* Demo Button 1 - Simple */}
      <DraggableFloatingButton
        storageKey="demo-btn-1"
        defaultPosition={{ bottom: 100, left: 100 }}
        enabled={true}
      >
        <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
          <span className="text-lg">🔵</span>
        </div>
      </DraggableFloatingButton>

      {/* Demo Button 2 - Complex */}
      <DraggableFloatingButton
        storageKey="demo-btn-2"
        defaultPosition={{ bottom: 100, right: 100 }}
        enabled={true}
      >
        <div className="bg-green-500 text-white p-3 rounded-lg shadow-lg min-w-20 text-center">
          <div className="text-sm font-bold">🟢</div>
          <div className="text-xs">Drag me</div>
        </div>
      </DraggableFloatingButton>

      {/* Demo Button 3 - Like action button */}
      <DraggableFloatingButton
        storageKey="demo-btn-3"
        defaultPosition={{ top: 100, left: 100 }}
        enabled={true}
      >
        <button className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors">
          <span className="text-xl font-bold">+</span>
        </button>
      </DraggableFloatingButton>

      {/* Instrucciones */}
      <div className="fixed top-20 left-4 bg-black/80 text-white p-3 rounded-lg text-sm max-w-xs">
        <div className="font-bold mb-2">🧪 Demo de Botones Arrastrables</div>
        <ul className="text-xs space-y-1">
          <li>• Arrastra los botones de colores</li>
          <li>• Doble click para resetear posición</li>
          <li>• Las posiciones se guardan automáticamente</li>
          <li>• Hover para ver indicadores de arrastre</li>
        </ul>
      </div>
    </>
  );
}

export default DraggableFloatingButtonDemo;

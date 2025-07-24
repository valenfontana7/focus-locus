import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Componente demo para probar modales arrastrables
 * Opcional: Eliminar este archivo si no se necesita
 */
function DraggableModalDemo() {
  const [modals, setModals] = useState({
    basic: false,
    withTitle: false,
    nonDraggable: false,
    longContent: false,
  });

  const openModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">
        Demo: Modales Arrastrables
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          onClick={() => openModal("basic")}
          className="text-sm"
        >
          Modal Básico
        </Button>

        <Button
          variant="secondary"
          onClick={() => openModal("withTitle")}
          className="text-sm"
        >
          Con Título
        </Button>

        <Button
          variant="cancel"
          onClick={() => openModal("nonDraggable")}
          className="text-sm"
        >
          No Arrastrable
        </Button>

        <Button
          variant="primary"
          onClick={() => openModal("longContent")}
          className="text-sm"
        >
          Contenido Largo
        </Button>
      </div>

      {/* Modal básico sin título */}
      <Modal
        open={modals.basic}
        onClose={() => closeModal("basic")}
        actions={
          <Button variant="primary" onClick={() => closeModal("basic")}>
            Entendido
          </Button>
        }
      >
        <p>
          Este es un modal básico sin título. Puedes arrastrarlo desde la barra
          superior.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Intenta arrastrar desde el área que dice "Arrastrar para mover".
        </p>
      </Modal>

      {/* Modal con título */}
      <Modal
        open={modals.withTitle}
        onClose={() => closeModal("withTitle")}
        title="Modal con Título"
        actions={
          <>
            <Button variant="cancel" onClick={() => closeModal("withTitle")}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => closeModal("withTitle")}>
              Aceptar
            </Button>
          </>
        }
      >
        <p>
          Este modal tiene título y se puede arrastrar desde la barra del
          header.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          El cursor cambia a "grab" cuando pasas el mouse sobre el área de
          arrastre.
        </p>
      </Modal>

      {/* Modal no arrastrable */}
      <Modal
        open={modals.nonDraggable}
        onClose={() => closeModal("nonDraggable")}
        title="Modal Fijo"
        draggable={false}
        actions={
          <Button variant="primary" onClick={() => closeModal("nonDraggable")}>
            Cerrar
          </Button>
        }
      >
        <p>
          Este modal no se puede arrastrar porque tiene{" "}
          <code>draggable=false</code>.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Es útil para modales críticos que no queremos que el usuario mueva.
        </p>
      </Modal>

      {/* Modal con contenido largo */}
      <Modal
        open={modals.longContent}
        onClose={() => closeModal("longContent")}
        title="Modal con Scroll"
        actions={
          <Button variant="primary" onClick={() => closeModal("longContent")}>
            Cerrar
          </Button>
        }
      >
        <div className="space-y-4">
          <p>Este modal tiene mucho contenido y scroll interno.</p>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Elemento {i + 1}</p>
              <p className="text-sm text-gray-600">
                Contenido de ejemplo para demostrar el scroll. El modal sigue
                siendo arrastrable desde el header.
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default DraggableModalDemo;

import React from "react";

/**
 * Versión super simple para debug - NO USA useDraggable
 */
function SimpleDraggableFloatingButton({
  children,
  storageKey,
  defaultPosition = { bottom: 16, right: 16 },
  enabled = true,
}) {
  const styles = {
    position: "fixed",
    zIndex: 9999,
    ...(defaultPosition.bottom !== undefined && {
      bottom: `${defaultPosition.bottom}px`,
    }),
    ...(defaultPosition.top !== undefined && {
      top: `${defaultPosition.top}px`,
    }),
    ...(defaultPosition.left !== undefined && {
      left: `${defaultPosition.left}px`,
    }),
    ...(defaultPosition.right !== undefined && {
      right: `${defaultPosition.right}px`,
    }),
    display: "block",
    visibility: "visible",
    opacity: "1",
  };

  console.log("SimpleDraggableFloatingButton render:", {
    storageKey,
    defaultPosition,
    styles,
    children: !!children,
  });

  return (
    <div style={styles} title="Versión simple sin dragging">
      {children}
    </div>
  );
}

export default SimpleDraggableFloatingButton;

# Modales Arrastrables - Guía de Uso

## 📋 Resumen

Se ha agregado funcionalidad de arrastre (drag and drop) a los modales del proyecto. Los usuarios ahora pueden mover los pop-ups flotantes cuando estos les molesten en su vista.

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **Arrastre con mouse**: Click y arrastra desde el header del modal
- **Soporte táctil**: Compatible con dispositivos móviles (touch)
- **Límites del viewport**: Los modales no se pueden arrastrar fuera de la pantalla
- **Reseteo automático**: La posición se resetea al abrir/cerrar el modal
- **Indicadores visuales**: Cursor y efectos que muestran que el modal es arrastrable
- **Accesibilidad**: Respeta las preferencias de movimiento reducido
- **Compatibilidad**: Funciona en todos los modales existentes sin cambios

### 🎯 Modales Afectados

- ✅ Modal base (`Modal.jsx`)
- ✅ Modal de edición de tareas (`TaskEditModal.jsx`)
- ✅ Modal de confirmación (Navbar)
- ✅ Modal de creación de proyectos (Sidebar)
- ✅ Modal de eliminación de proyectos (Sidebar)
- ✅ Todos los modales nuevos que usen el componente `Modal`

## 🛠️ Uso Básico

### Modal Arrastrable (por defecto)

```jsx
import Modal from "./components/Modal";

<Modal open={isOpen} onClose={handleClose} title="Mi Modal">
  <p>Este modal se puede arrastrar por defecto</p>
</Modal>;
```

### Modal NO Arrastrable

```jsx
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Modal Fijo"
  draggable={false} // Desactiva el arrastre
>
  <p>Este modal no se puede mover</p>
</Modal>
```

### Modal con Título Personalizado y Icono

```jsx
<Modal
  open={isOpen}
  onClose={handleClose}
  title={
    <div className="flex items-center">
      <span>Mi Título</span>
      <Icon className="ml-2" />
    </div>
  }
>
  <p>Contenido del modal</p>
</Modal>
```

## 🎨 Estilos y Personalización

### Archivos CSS

- `src/styles/DraggableModal.css` - Estilos específicos para arrastre
- Las clases CSS están optimizadas para mobile y desktop

### Clases CSS Principales

- `.draggable-modal` - Aplicada al contenedor del modal
- `.modal-drag-handle` - Aplicada al área de arrastre (header)
- `.is-dragging` - Aplicada cuando se está arrastrando
- `.drag-icon` - Para iconos de arrastre
- `.drag-help-text` - Para texto de ayuda

## 📱 Comportamiento en Dispositivos

### Desktop

- Cursor cambia a "grab" al hover sobre el header
- Cursor cambia a "grabbing" durante el arrastre
- Sombra más pronunciada durante el arrastre

### Mobile/Tablet

- Área de arrastre más grande para mejor usabilidad
- Soporte completo para gestos táctiles
- Feedback visual optimizado para pantallas táctiles

## 🔧 Hook Personalizado: `useDraggable`

### Ubicación

`src/hooks/useDraggable.js`

### Características

- Manejo de eventos de mouse y touch
- Límites del viewport automáticos
- Callbacks para inicio y fin de arrastre
- Reseteo de posición programático

### Uso Básico del Hook

```jsx
import { useDraggable } from "../hooks/useDraggable";

const {
  elementRef, // Ref para el elemento arrastrable
  handleRef, // Ref para el "handle" de arrastre
  isDragging, // Estado: está siendo arrastrado
  resetPosition, // Función para resetear posición
  dragHandlers, // Event handlers para mouse/touch
  style, // Estilos CSS con transform
} = useDraggable({
  enabled: true, // Si está habilitado
  onDragStart: () => console.log("Inicio"), // Callback inicio
  onDragEnd: () => console.log("Fin"), // Callback fin
});
```

## 🚨 Consideraciones Importantes

### Rendimiento

- Los cálculos de posición son eficientes
- Se evita re-renderizado innecesario
- Limpieza automática de event listeners

### Accesibilidad

- Respeta `prefers-reduced-motion`
- Navegación por teclado no afectada
- Screen readers funcionan normalmente

### Compatibilidad

- ✅ Chrome/Edge/Safari/Firefox
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Tablets y dispositivos táctiles

## 📝 Componente Demo

Se incluye un componente de demostración opcional:
`src/components/DraggableModalDemo.jsx`

Para probarlo, importarlo en cualquier página:

```jsx
import DraggableModalDemo from "./components/DraggableModalDemo";

// En tu componente
<DraggableModalDemo />;
```

## 🔄 Migración de Modales Existentes

### Sin Cambios Necesarios

Los modales existentes funcionarán automáticamente con arrastre habilitado.

### Para Deshabilitar Arrastre

Solo agregar `draggable={false}`:

```jsx
// Antes
<Modal open={isOpen} onClose={onClose} title="Mi Modal">

// Después (si no quieres arrastre)
<Modal open={isOpen} onClose={onClose} title="Mi Modal" draggable={false}>
```

## 🎯 Casos de Uso Recomendados

### ✅ Usar Arrastre Para:

- Modales de edición de tareas
- Formularios largos
- Modales informativos
- Cualquier modal que pueda obstaculizar la vista

### ❌ NO Usar Arrastre Para:

- Modales de confirmación críticos
- Alertas de seguridad
- Modales de autenticación
- Procesos que requieren atención fija

## 🐛 Solución de Problemas

### El Modal No Se Arrastra

1. Verificar que `draggable` no esté establecido en `false`
2. Verificar que el CSS está importado
3. Comprobar que no hay elementos interceptando el evento

### Problemas en Mobile

1. Verificar que touch-action está configurado correctamente
2. Comprobar que no hay conflictos con scroll
3. Verificar viewport meta tag

### Posición Incorrecta

1. Llamar `resetPosition()` después de cambios de tamaño
2. Verificar que el modal está dentro de un portal
3. Comprobar z-index y posicionamiento CSS

## 📚 Recursos Adicionales

- [React DnD Documentation](https://react-dnd.github.io/react-dnd/)
- [Touch Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [CSS Transform MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

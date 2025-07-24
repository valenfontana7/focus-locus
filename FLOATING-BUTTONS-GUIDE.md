# Botones Flotantes Arrastrables - Guía de Uso

## 📋 Resumen

Los botones flotantes (FABs) ahora se pueden arrastrar para reposicionarlos cuando molesten en la vista del usuario. Esta funcionalidad mejora significativamente la experiencia de usuario en dispositivos móviles.

## 🎯 Botones Afectados

### ✅ **Botón de Acciones (+)**

- **Ubicación**: Esquina inferior izquierda en móvil
- **Función**: Menú desplegable con "Agregar tarea" y "Limpiar tareas"
- **Arrastrable**: ✅ Sí
- **Clave de almacenamiento**: `actions-btn`

### ✅ **Botón de Sincronización**

- **Ubicación**: Esquina inferior derecha
- **Función**: Estado de sincronización con Supabase
- **Arrastrable**: ✅ Sí
- **Clave de almacenamiento**: `sync-status`

## 🚀 Características Implementadas

### 🎮 **Interacciones**

- **Arrastrar**: Click/touch y arrastra para mover
- **Doble click**: Resetea a posición original
- **Hover**: Muestra indicador visual de arrastre
- **Límites**: No se puede arrastrar fuera de la pantalla

### 💾 **Persistencia**

- Las posiciones se guardan automáticamente en `localStorage`
- Se restauran al recargar la página
- Cada botón tiene su propia clave de almacenamiento

### 🎨 **Indicadores Visuales**

- **Puntos animados** en la parte superior al hacer hover
- **Sombra aumentada** durante el arrastre
- **Escala ligeramente aumentada** cuando se arrastra
- **Punto verde** cuando está en posición personalizada

## 📱 Cómo Usar

### **Para Mover un Botón:**

1. Mantén presionado el botón flotante
2. Arrastra a la nueva posición deseada
3. Suelta para colocar
4. La posición se guarda automáticamente

### **Para Resetear Posición:**

1. Haz doble click en el botón
2. Volverá a su posición original
3. Se elimina la posición guardada

### **Indicadores Visuales:**

- **Puntos animados**: Aparecen al hacer hover, indican que es arrastrable
- **Cursor grab/grabbing**: Cambia para indicar el estado de arrastre
- **Sombra aumentada**: Durante el arrastre para dar sensación de elevación

## 🛠️ Implementación Técnica

### **Archivos Modificados/Creados:**

1. **`src/components/DraggableFloatingButton.jsx`** - Componente wrapper
2. **`src/styles/DraggableFloatingButtons.css`** - Estilos específicos
3. **`src/pages/Home.jsx`** - Integración del botón de acciones
4. **`src/components/SyncStatus.jsx`** - Integración del botón de sync

### **Hook Utilizado:**

- Reutiliza `useDraggable.js` creado anteriormente
- Añade funcionalidad de persistencia con localStorage
- Gestiona posiciones por defecto específicas

### **Características del Componente:**

```jsx
<DraggableFloatingButton
  storageKey="unique-key" // Clave para localStorage
  defaultPosition={{ bottom: 16, right: 16 }} // Posición inicial
  enabled={true} // Si está habilitado el arrastre
>
  {/* Contenido del botón */}
</DraggableFloatingButton>
```

## 📱 Comportamiento por Dispositivo

### **Desktop:**

- Indicadores visuales sutiles
- Hover states claramente definidos
- Drag & drop con mouse preciso

### **Mobile/Touch:**

- Área de arrastre optimizada
- Indicadores más prominentes
- Gestos táctiles nativos
- Prevención de scroll accidental

## 🎯 Casos de Uso

### **✅ Beneficios:**

- **Menos obstrucción visual**: Usuario puede mover botones que tapen contenido
- **Personalización**: Cada usuario puede configurar su layout preferido
- **Ergonomía**: Mover botones a zonas más cómodas para el pulgar
- **Accesibilidad**: Usuarios con limitaciones físicas pueden optimizar la interfaz

### **🎨 Ejemplos de Uso:**

- Mover el botón "+" si tapa una lista importante
- Reposicionar el sync status si interfiere con el scroll
- Agrupar ambos botones en un lado si el usuario prefiere

## 💡 Mejoras Futuras Posibles

### **Características Adicionales:**

- [ ] Botón para resetear todas las posiciones
- [ ] Modo "snap to grid" para alineación perfecta
- [ ] Guardar configuraciones por usuario en Supabase
- [ ] Más opciones de personalización visual
- [ ] Modo compacto que agrupe todos los FABs

### **Configuraciones Avanzadas:**

- [ ] Deshabilitar arrastre para ciertos usuarios/roles
- [ ] Límites personalizados de movimiento
- [ ] Animaciones de transición configurables

## 🔧 Configuración de Desarrollo

### **Para Agregar Nuevos Botones Flotantes:**

```jsx
import DraggableFloatingButton from "./DraggableFloatingButton";

<DraggableFloatingButton
  storageKey="mi-boton"
  defaultPosition={{ bottom: 80, right: 16 }}
>
  <button className="fab-button">Mi Botón</button>
</DraggableFloatingButton>;
```

### **Estilos CSS Personalizados:**

Los estilos están en `DraggableFloatingButtons.css` y son completamente personalizables.

## 🐛 Solución de Problemas

### **El botón no se arrastra:**

1. Verificar que `enabled={true}`
2. Comprobar que los estilos CSS están cargados
3. Revisar conflictos con otros event listeners

### **La posición no se guarda:**

1. Verificar que `storageKey` es único
2. Comprobar que localStorage está disponible
3. Revisar la consola por errores

### **Problemas visuales:**

1. Verificar z-index de elementos superpuestos
2. Comprobar que las transiciones CSS no interfieren
3. Revisar viewport y overflow settings

## 📊 Datos Técnicos

- **Tamaño agregado**: ~3KB CSS + ~5KB JS
- **Dependencias**: Solo React hooks internos
- **Compatibilidad**: Todos los navegadores modernos
- **Performance**: Optimizado para 60fps durante arrastre

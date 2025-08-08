# Focus Locus Mobile - Instrucciones para GitHub Copilot

## Contexto del Proyecto

Este es el paquete móvil de Focus Locus, una aplicación de gestión de proyectos y productividad construida con React Native y Expo. Forma parte de un monorepo que incluye:

- `@focus-locus/web`: Aplicación web (Vite + React)
- `@focus-locus/core`: Componentes y lógica compartida
- `@focus-locus/mobile`: Esta aplicación móvil (React Native + Expo)

## Tecnologías Principales

- **React Native**: Framework para desarrollo móvil multiplataforma
- **Expo**: Plataforma de desarrollo que simplifica React Native
- **React Navigation**: Navegación entre pantallas
- **Supabase**: Backend como servicio (BaaS) para autenticación y base de datos
- **@focus-locus/core**: Paquete compartido con hooks, contextos y utilidades

## Arquitectura y Patrones

### Estructura de Carpetas

```
src/
├── config/           # Configuraciones (Supabase, etc.)
├── screens/          # Pantallas principales
├── components/       # Componentes reutilizables (cuando se agreguen)
└── utils/           # Utilidades específicas de mobile (cuando se agreguen)
```

### Proveedores y Contexto

La aplicación utiliza varios proveedores de contexto del core package:

- `SupabaseConfigProvider`: Configuración de Supabase
- `AuthProvider`: Estado de autenticación
- `ProjectProvider`: Gestión de proyectos

### Navegación

Se usa React Navigation con Bottom Tabs:

- **Home**: Pantalla principal con lista de proyectos
- **Profile**: Pantalla de perfil del usuario

## Convenciones de Código

### Componentes

- Usar functional components con hooks
- Nombres en PascalCase para componentes
- Usar StyleSheet.create() para estilos
- Importar React explícitamente: `import React from 'react';`

### Estilos

- Usar StyleSheet en lugar de estilos inline cuando sea posible
- Seguir convenciones de naming: camelCase para propiedades
- Mantener consistencia con el tema de colores de la web app

### Variables de Ambiente

- Configurar en `app.json` bajo la sección `extra`
- Acceder vía `Constants.expoConfig?.extra?.variableName`
- Para desarrollo, usar configuración directa en `src/config/supabase.js`

## Integración con Core Package

### Hooks Disponibles

- `useAuth()`: Estado de autenticación del usuario
- `useProjects()`: Lista y gestión de proyectos
- `useSupabaseConfig()`: Configuración de Supabase

### Componentes Compartidos

Cuando sea necesario, usar componentes del core package que sean compatibles con React Native. Nota: algunos componentes web pueden necesitar adaptación.

## Comandos de Desarrollo

- `npm start`: Iniciar servidor de desarrollo
- `npm run android`: Ejecutar en emulador/dispositivo Android
- `npm run ios`: Ejecutar en simulador/dispositivo iOS (solo macOS)
- `npm run web`: Ejecutar versión web de Expo

## Consideraciones Específicas de React Native

### Performance

- Usar FlatList para listas largas, no ScrollView con múltiples elementos
- Implementar lazy loading para pantallas pesadas
- Usar useMemo/useCallback para optimizaciones cuando sea necesario

### Navegación

- Usar React Navigation v6 syntax
- Configurar deep linking si es necesario
- Mantener consistencia con la estructura de rutas de la web app

### UI/UX

- Seguir las pautas de cada plataforma (iOS/Android)
- Usar SafeAreaView para manejar áreas seguras
- Implementar loading states para operaciones asíncronas

## Estado Actual

- ✅ Configuración inicial de Expo
- ✅ Integración con @focus-locus/core
- ✅ Navegación básica con tabs
- ✅ Pantallas Home y Profile básicas
- ✅ Configuración de Supabase

## Próximas Funcionalidades a Implementar

1. Autenticación completa (login/register)
2. CRUD completo de proyectos
3. Pantallas de detalle de proyecto
4. Funcionalidad de tareas/subtareas
5. Sincronización offline
6. Notificaciones push
7. Tema oscuro/claro
8. Configuraciones de usuario

## Debugging

- Usar React Native Debugger o Flipper para debugging avanzado
- Expo Dev Tools para inspección en tiempo real
- Console.log funciona pero usar debugging tools cuando sea posible

## Notas Importantes

- Este proyecto comparte lógica con la aplicación web a través del core package
- Cualquier cambio en el core se refleja en ambas aplicaciones
- Mantener consistencia de UX entre web y mobile, adaptando a cada plataforma
- Las credenciales de Supabase deben configurarse en app.json para el entorno de producción

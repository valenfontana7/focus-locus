# Focus Locus Mobile

Aplicación móvil de Focus Locus construida con React Native y Expo.

## Configuración

### Requisitos previos

- Node.js (versión 18 o superior)
- Expo CLI: `npm install -g @expo/cli`
- Para iOS: Xcode (solo en macOS)
- Para Android: Android Studio

### Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar Supabase:

   - Edita `app.json` y actualiza las variables en `extra`:
     - `supabaseUrl`: Tu URL de Supabase
     - `supabaseAnonKey`: Tu clave anónima de Supabase

3. Ejecutar la aplicación:

```bash
npm start
```

### Comandos disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run android`: Ejecuta en Android
- `npm run ios`: Ejecuta en iOS (solo macOS)
- `npm run web`: Ejecuta la versión web

## Estructura del proyecto

```
src/
├── config/
│   └── supabase.js          # Configuración de Supabase
├── screens/
│   ├── HomeScreen.jsx       # Pantalla principal
│   └── ProfileScreen.jsx    # Pantalla de perfil
App.js                       # Componente principal
```

## Funcionalidades

- ✅ Navegación con tabs
- ✅ Integración con @focus-locus/core
- ✅ Configuración de Supabase
- ✅ Pantalla de proyectos
- ✅ Pantalla de perfil

## Próximos pasos

1. Configurar las credenciales reales de Supabase en `app.json`
2. Implementar autenticación
3. Agregar más pantallas y funcionalidades
4. Configurar íconos personalizados
5. Implementar notificaciones push

## Integración con el monorepo

Esta aplicación utiliza el paquete `@focus-locus/core` que contiene:

- Contextos de autenticación y proyectos
- Hooks compartidos
- Utilidades comunes
- Configuración de Supabase

Cualquier cambio en el core se reflejará automáticamente en la app móvil.

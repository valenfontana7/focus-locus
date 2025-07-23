# 🚀 Migración a Supabase - FocusLocus

Esta documentación te guiará para migrar FocusLocus desde localStorage a Supabase con autenticación y persistencia en la nube.

## 📋 Estado Actual

✅ **Completado:**

- Instalación de Supabase SDK
- Configuración híbrida (Supabase + localStorage fallback)
- Hooks de autenticación y manejo de datos
- Componentes de login y sincronización
- Integración en la aplicación principal

🔄 **Pendiente:**

- Configurar proyecto de Supabase
- Ejecutar esquema de base de datos
- Configurar variables de entorno

## 🛠️ Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Rellena los datos:
   - **Nombre**: `focuslocus-app` (o el que prefieras)
   - **Contraseña de BD**: Genera una segura
   - **Región**: Selecciona la más cercana a tus usuarios

### Paso 2: Obtener Credenciales

1. En tu proyecto de Supabase, ve a **Settings > API**
2. Copia estos valores:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

### Paso 3: Configurar Variables de Entorno

1. Edita el archivo `.env.local` en la raíz del proyecto:

```env
# Reemplaza con tus valores reales de Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Paso 4: Ejecutar Esquema de Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `schema.sql`
3. Haz clic en "Run" para ejecutar el esquema

### Paso 5: Configurar Autenticación

1. Ve a **Authentication > Settings**
2. En **Auth Providers**, habilita:
   - ✅ **Email**: Para login con email/contraseña
   - ✅ **Google** (opcional): Para login con Google
3. Si habilitas Google:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea credenciales OAuth 2.0
   - Agrega la URL de callback de Supabase

## 🎯 Funcionalidades Implementadas

### 🔐 Autenticación

- **Login/Registro** con email y contraseña
- **Login con Google** (opcional)
- **Persistencia de sesión**
- **Modo offline** cuando Supabase no está configurado

### 💾 Persistencia de Datos

- **Proyectos** sincronizados en tiempo real
- **Tareas** organizadas por estado (pendientes, en curso, terminadas)
- **Fallback automático** a localStorage si hay problemas de conexión
- **Sincronización bidireccional**

### 🔄 Sincronización

- **Indicador visual** de estado de sincronización
- **Botón de sincronización manual**
- **Manejo de errores** y reconexión automática

## 🚀 Cómo Usar

### Modo Online (con Supabase)

1. Configura las variables de entorno
2. La app mostrará login al iniciar
3. Crea cuenta o inicia sesión
4. Tus datos se sincronizan automáticamente
5. Puedes acceder desde cualquier dispositivo

### Modo Offline (sin Supabase)

1. No configures variables de entorno
2. La app funciona normalmente
3. Los datos se guardan solo en localStorage
4. Ideal para desarrollo o uso personal

## 🔧 Comandos Útiles

```bash
# Instalar dependencias (ya hecho)
npm install @supabase/supabase-js

# Iniciar desarrollo
npm run dev

# Verificar configuración
console.log('Supabase configurado:', !!window.supabase)
```

## 📂 Estructura de Archivos Nuevos

```
src/
├── lib/
│   └── supabase.js          # Configuración de Supabase
├── hooks/
│   ├── useAuth.js           # Hook de autenticación
│   └── useSupabaseProjects.js # Hook híbrido de proyectos
├── services/
│   └── database.js          # Servicio de base de datos
├── context/
│   └── AuthContext.jsx      # Contexto de autenticación
├── components/
│   ├── Login.jsx            # Componente de login
│   └── SyncStatus.jsx       # Indicador de sincronización
└── schema.sql               # Esquema de base de datos
```

## 🛡️ Seguridad

- **Row Level Security (RLS)** habilitado
- **Políticas de acceso** por usuario
- **Validación de datos** en frontend y backend
- **Claves API públicas** (seguras para frontend)

## 🌟 Próximos Pasos

1. **Configurar Supabase** siguiendo esta guía
2. **Probar autenticación** creando una cuenta
3. **Verificar sincronización** creando proyectos y tareas
4. **Opcional**: Configurar Google OAuth
5. **Opcional**: Configurar notificaciones push
6. **Opcional**: Compartir proyectos entre usuarios

## 🐛 Troubleshooting

### La app no carga

- Verifica las variables de entorno en `.env.local`
- Asegúrate de que las URLs no tengan espacios o caracteres extra

### Error de autenticación

- Verifica que el esquema SQL se ejecutó correctamente
- Comprueba que la autenticación esté habilitada en Supabase

### Datos no sincronizando

- Verifica la conexión a internet
- Revisa la consola del navegador para errores
- Intenta el botón de sincronización manual

### Problemas con Google OAuth

- Verifica las URLs de callback en Google Cloud Console
- Asegúrate de que el dominio esté autorizado

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador para errores
2. Verifica la configuración en Supabase
3. Prueba en modo offline para aislar el problema

---

¡Tu app FocusLocus ahora tiene persistencia en la nube y autenticación! 🎉

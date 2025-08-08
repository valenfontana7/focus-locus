# Configuración de Google Sign-In para Focus Locus Mobile

## Pasos para configurar Google OAuth

### 1. Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services** → **Credentials**

### 2. Crear credenciales para Android

1. Clic en **Create Credentials** → **OAuth client ID**
2. Selecciona **Android**
3. Ingresa:
   - **Name**: Focus Locus Mobile Android
   - **Package name**: `com.focuslocus.mobile` (o el que uses en app.json)
   - **SHA-1 certificate fingerprint**: (ver instrucciones abajo)

**Para obtener el SHA-1:**

```bash
# En el directorio del proyecto móvil
npx expo credentials:manager -p android
# O para debug keystore:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 3. Crear credenciales para iOS

1. Clic en **Create Credentials** → **OAuth client ID**
2. Selecciona **iOS**
3. Ingresa:
   - **Name**: Focus Locus Mobile iOS
   - **Bundle ID**: `com.focuslocus.mobile` (debe coincidir con app.json)

### 4. Crear credenciales Web (para Supabase)

1. Clic en **Create Credentials** → **OAuth client ID**
2. Selecciona **Web application**
3. Agrega en **Authorized redirect URIs**:
   - `https://ljvkuvdejbvkycfizsfo.supabase.co/auth/v1/callback`

### 5. Actualizar configuración

Después de crear las credenciales, actualiza el archivo:
`src/config/googleSignIn.js`

```javascript
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  // ID de cliente para Android (desde Google Cloud Console)
  androidClientId: "TU_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  // ID de cliente para iOS (desde Google Cloud Console)
  iosClientId: "TU_IOS_CLIENT_ID.apps.googleusercontent.com",
  // ID de cliente web (desde Google Cloud Console)
  webClientId: "TU_WEB_CLIENT_ID.apps.googleusercontent.com",
});
```

### 6. Configurar Supabase

1. Ve a tu dashboard de Supabase
2. **Authentication** → **Providers** → **Google**
3. Habilita el proveedor
4. Ingresa:
   - **Client ID**: El Web Client ID de Google Cloud Console
   - **Client Secret**: El Client Secret de Google Cloud Console

### 7. Actualizar app.json (si es necesario)

Si cambias el package name o bundle ID:

```json
{
  "expo": {
    "android": {
      "package": "com.focuslocus.mobile"
    },
    "ios": {
      "bundleIdentifier": "com.focuslocus.mobile"
    }
  }
}
```

## Notas importantes

- Los Client IDs deben coincidir exactamente entre Google Cloud Console y la configuración
- Para desarrollo, puedes usar el debug keystore de Android
- Para producción, necesitarás generar un keystore de producción
- Asegúrate de que el Bundle ID/Package name coincida en todos los lugares

## Comandos útiles

```bash
# Instalar dependencias
npm install @react-native-google-signin/google-signin

# Regenerar proyecto nativo (si es necesario)
npx expo run:android
npx expo run:ios

# Ver configuración actual
npx expo config --type public
```

## Troubleshooting

- **Error "DEVELOPER_ERROR"**: Verifica que el SHA-1 fingerprint sea correcto
- **Error "SIGN_IN_CANCELLED"**: Usuario canceló el proceso (normal)
- **Error "SIGN_IN_REQUIRED"**: Credenciales expiradas o inválidas
- **Error "Network error"**: Problemas de conectividad

## Testing

1. Ejecuta la app: `npm start`
2. Presiona el botón "Continuar con Google"
3. Debería abrir el navegador/webview para autenticación
4. Después de autorizar, debería redirigir de vuelta a la app

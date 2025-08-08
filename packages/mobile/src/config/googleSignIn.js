import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Configuración de Google Sign-In
GoogleSignin.configure({
  // ID de cliente para Android desde Google Cloud Console
  androidClientId: "TU_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  // ID de cliente para iOS desde Google Cloud Console
  iosClientId:
    "933797719230-4lggkp35ek8lhsqln1e8jlphqfe5krnv.apps.googleusercontent.com",
  // ID de cliente web desde Google Cloud Console (el mismo que usas en web)
  webClientId:
    "933797719230-69gbtso5hc0a2sgheskdsu81luenib8e.apps.googleusercontent.com",
});

export default GoogleSignin;

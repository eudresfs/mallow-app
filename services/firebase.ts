// services/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
};

// Only initialize Firebase if API key is configured
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let auth: Auth | null = null;

if (isFirebaseConfigured) {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  console.warn('Firebase is not configured. Auth features will not be available.');
  console.warn('To enable Firebase, add your configuration to app.config.js');
}

export { auth };

// TODO: Implement Google Sign-In properly with @react-native-google-signin/google-signin
// For now, export a placeholder
export const GoogleSignin = {
  hasPlayServices: async () => true,
  signIn: async () => ({ idToken: '' }),
  signOut: async () => {},
};
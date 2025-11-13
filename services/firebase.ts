// services/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Note: Firebase Web SDK v9+ uses web-compatible persistence by default
// For React Native, persistence is handled automatically
export const auth = getAuth(app);

// TODO: Implement Google Sign-In properly with @react-native-google-signin/google-signin
// For now, export a placeholder
export const GoogleSignin = {
  hasPlayServices: async () => true,
  signIn: async () => ({ idToken: '' }),
  signOut: async () => {},
};
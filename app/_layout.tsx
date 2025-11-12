
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { ProductFormProvider } from '@/context/ProductFormContext';
import { useUser, UserProvider } from '@/hooks/useUser';
import { useEffect } from 'react';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Impede que a tela de splash seja ocultada automaticamente
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { loading: userLoading } = useUser();

  useEffect(() => {
    // Quando os dados do usuário estiverem carregados, oculte a tela de splash
    if (!userLoading) {
      SplashScreen.hideAsync();
    }
  }, [userLoading]);

  // Se o usuário ainda estiver carregando, não renderize nada.
  // A tela de splash permanecerá visível.
  if (userLoading) {
    return null;
  }

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ProductFormProvider>
        <ThemeProvider value={DefaultTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </ThemeProvider>
      </ProductFormProvider>
    </UserProvider>
  );
}

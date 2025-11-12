// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

import { UserProvider } from '@/hooks/useUser';
import { ProductFormProvider } from '@/context/ProductFormContext';

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ProductFormProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ProductFormProvider>
    </UserProvider>
  );
}
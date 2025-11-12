
import { Stack } from 'expo-router';
import { ProductFormProvider } from '@/context/ProductFormContext';

export default function ProdutosLayout() {
  return (
    <ProductFormProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="novo" />
        <Stack.Screen name="novo-step2" />
        <Stack.Screen name="editar/[id]" />
      </Stack>
    </ProductFormProvider>
  );
}

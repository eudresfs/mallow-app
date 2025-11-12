
import { Stack } from 'expo-router';

export default function InsumosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="novo" />
      <Stack.Screen name="editar/[id]" />
    </Stack>
  );
}

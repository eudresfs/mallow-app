
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold">Tela de Perfil</Text>
      <Text className="text-muted-foreground mt-2">Em construção...</Text>
    </SafeAreaView>
  );
}


import { Tabs } from 'expo-router';
import { Home, Box, ShoppingBag, DollarSign, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8A2BE2', // Cor primária
        tabBarInactiveTintColor: '#6b7280', // Cor de texto 'muted-foreground'
        tabBarStyle: {
          backgroundColor: '#ffffff', // Cor 'card'
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb', // Cor da borda
          height: 60, // Altura da barra de abas
          paddingBottom: 5, // Espaçamento inferior para os ícones
        },
        headerShown: false, // O cabeçalho é customizado em cada tela
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="produtos"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, size }) => <Box size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insumos"
        options={{
          title: 'Insumos',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="custos"
        options={{
          title: 'Custos',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

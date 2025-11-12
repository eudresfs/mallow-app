
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Box, User, ShoppingBag, Lightbulb, ChevronRight } from 'lucide-react-native';

import { useUser } from '@/hooks/useUser';
import { ProdutoCompleto } from '@/services/database';
import { formatCurrency } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const { loading: userLoading } = useUser();
  // Apenas para demonstração, vamos usar dados estáticos
  const produtos: ProdutoCompleto[] = []; // Mantenha vazio para ver o estado de dica

  const loading = userLoading; // Simula carregamento

  const renderRecentActivity = () => (
    <View className="px-4 mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Atividade recente</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/produtos')}>
          <Text className="text-primary-DEFAULT font-semibold">Ver tudo</Text>
        </TouchableOpacity>
      </View>

      {produtos.length === 0 ? (
        <View className="bg-card p-4 rounded-lg shadow-sm flex-row items-center">
            <Lightbulb size={24} color="#8A2BE2" />
            <View className="ml-4">
                <Text className="font-bold text-gray-700">Dica do dia</Text>
                <Text className="text-muted-foreground">Mantenha os preços dos seus insumos atualizados para um cálculo preciso.</Text>
            </View>
        </View>
      ) : (
        produtos.slice(0, 3).map(item => (
          <TouchableOpacity key={item.id} className="bg-card p-4 rounded-lg shadow-sm flex-row items-center mb-3">
            <View className="bg-secondary-DEFAULT p-3 rounded-lg">
              <Box size={24} color="#8A2BE2" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="font-bold text-gray-800">{item.nome}</Text>
              <Text className="text-sm text-muted-foreground">há 2 horas</Text>
            </View>
            <View className="items-end">
                <Text className="font-bold text-lg text-green-600">{formatCurrency(item.preco_final_sugerido)}</Text>
                <Text className="text-sm text-muted-foreground">{item.margem_lucro}%</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" className="ml-2"/>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-4 pt-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Olá! 👋</Text>
            <Text className="text-base text-muted-foreground">Bem-vindo(a) ao Mallow</Text>
          </View>
          <TouchableOpacity className="bg-card p-3 rounded-full shadow-sm">
            <User size={24} color="#8A2BE2" />
          </TouchableOpacity>
        </View>

        {/* Comece por aqui */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Comece por aqui</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-secondary-DEFAULT p-4 rounded-lg items-center justify-center w-[48%] shadow-sm" onPress={() => router.push('/insumos/novo')}>
              <ShoppingBag size={32} color="#8A2BE2" />
              <Text className="font-bold mt-2 text-primary-DEFAULT">Adicionar Insumo</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-secondary-DEFAULT p-4 rounded-lg items-center justify-center w-[48%] shadow-sm" onPress={() => router.push('/produtos/novo')}>
              <Box size={32} color="#8A2BE2" />
              <Text className="font-bold mt-2 text-primary-DEFAULT">Adicionar Produto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderRecentActivity()}

      </ScrollView>
    </SafeAreaView>
  );
}


import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Plus, Search, ShoppingBag, Trash2 } from 'lucide-react-native';

import { getProdutosCompletos, deleteProduto, ProdutoCompleto } from '@/services/database';
import { formatCurrency } from '@/utils/format';
import { useUser } from '@/hooks/useUser';

// Tipos para os props dos componentes
interface ProdutoCardProps {
  item: ProdutoCompleto;
  onEdit: () => void;
  onDelete: () => void;
}

interface EmptyStateProps {
  onAdd: () => void;
}

// Componente de Item da Lista
const ProdutoCard: React.FC<ProdutoCardProps> = ({ item, onEdit, onDelete }) => (
  <TouchableOpacity 
    onPress={onEdit}
    className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm border border-gray-200 flex-row items-center"
  >
    <View className="flex-1">
      <Text className="text-lg font-bold text-gray-800">{item.nome}</Text>
      <View className="flex-row items-baseline mt-1">
        <Text className="text-lg font-semibold text-purple-700">{formatCurrency(item.preco_final_sugerido)}</Text>
        <Text className="text-sm text-gray-500 ml-2">{item.margem_lucro}% de margem</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onDelete} className="p-3">
      <Trash2 size={20} color="#ef4444" />
    </TouchableOpacity>
  </TouchableOpacity>
);

// Componente de Estado Vazio
const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => (
  <View className="flex-1 justify-center items-center px-6">
    <ShoppingBag size={48} color="#d1d5db" />
    <Text className="text-2xl font-bold text-gray-800 mt-4">Sem produtos por aqui!</Text>
    <Text className="text-base text-gray-500 text-center mt-2 mb-6">Que tal cadastrar seu primeiro produto para ver a mágica acontecer?</Text>
    <TouchableOpacity 
      onPress={onAdd}
      className="bg-purple-600 rounded-lg px-8 py-4 shadow-md"
    >
      <Text className="text-white font-bold text-lg">Cadastrar Primeiro Produto</Text>
    </TouchableOpacity>
  </View>
);

export default function ProdutosScreen() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [produtos, setProdutos] = useState<ProdutoCompleto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  const loadProdutos = useCallback(() => {
    if (!user?.id) return;
    setDataLoading(true);
    getProdutosCompletos(user.id)
      .then(setProdutos)
      .catch(() => {
        Alert.alert("Erro", "Não foi possível carregar seus produtos.");
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  useFocusEffect(loadProdutos);

  const handleDelete = (id: number) => {
    if (!user?.id) return;
    Alert.alert(
      'Excluir Produto',
      'Você tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduto(user.id!, id);
              loadProdutos(); // Recarrega a lista
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o produto.');
            }
          },
        },
      ]
    );
  };

  const navigateToNovoProduto = () => router.push('/produtos/novo');

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 bg-white pb-3 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Meus Produtos</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pt-3">
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3">
            <Search size={20} color="#9ca3af" />
            <TextInput
            className="flex-1 p-3 text-base text-gray-900"
            placeholder="Buscar por nome..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            />
        </View>
      </View>

      {dataLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : filteredProdutos.length === 0 ? (
        <EmptyState onAdd={navigateToNovoProduto} />
      ) : (
        <FlatList<ProdutoCompleto>
          data={filteredProdutos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProdutoCard 
              item={item} 
              onEdit={() => router.push(`/produtos/editar/${item.id}`)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }} // Padding for FAB
        />
      )}

      {/* Floating Action Button */}
      {!dataLoading &&
        <TouchableOpacity 
          className="absolute bottom-6 right-6 bg-purple-600 rounded-full h-16 w-16 justify-center items-center shadow-lg"
          onPress={navigateToNovoProduto}
        >
          <Plus size={32} color="#fff" />
        </TouchableOpacity>
      }
    </SafeAreaView>
  );
}


import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Plus, Search, Package, Trash2 } from 'lucide-react-native';

import { getInsumos, deleteInsumo, Insumo } from '@/services/database';
import { formatCurrency } from '@/utils/format';
import { useUser } from '@/hooks/useUser';

// Tipos para os props dos componentes
interface InsumoCardProps {
  item: Insumo;
  onEdit: () => void;
  onDelete: () => void;
}

interface EmptyStateProps {
  onAdd: () => void;
}

// Componente de Item da Lista
const InsumoCard: React.FC<InsumoCardProps> = ({ item, onEdit, onDelete }) => {
  // Calcula o custo por unidade
  const custoPorUnidade = item.preco_compra / item.quantidade_compra;

  return (
    <TouchableOpacity 
      onPress={onEdit}
      className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm border border-gray-200 flex-row items-center"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.nome}</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {/* Exibe o custo por unidade de forma clara */}
          {formatCurrency(custoPorUnidade)} / {item.unidade_compra}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} className="p-3">
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Componente de Estado Vazio
const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => (
  <View className="flex-1 justify-center items-center px-6">
    <Package size={48} color="#d1d5db" />
    <Text className="text-2xl font-bold text-gray-800 mt-4">Adicione seus insumos</Text>
    <Text className="text-base text-gray-500 text-center mt-2 mb-6">Insumos são os ingredientes e materiais que você usa para fazer seus produtos. Vamos começar?</Text>
    <TouchableOpacity 
      onPress={onAdd}
      className="bg-purple-600 rounded-lg px-8 py-4 shadow-md"
    >
      <Text className="text-white font-bold text-lg">Cadastrar Primeiro Insumo</Text>
    </TouchableOpacity>
  </View>
);

export default function InsumosScreen() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  const loadInsumos = useCallback(() => {
    if (!user?.id) return;
    setDataLoading(true);
    getInsumos(user.id)
      .then(setInsumos)
      .catch(() => {
        Alert.alert("Erro", "Não foi possível carregar seus insumos.");
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  useFocusEffect(loadInsumos);

  const handleDelete = (id: number) => {
    if (!user?.id) return;
    Alert.alert(
      'Excluir Insumo',
      'Excluir este insumo também o removerá das receitas dos seus produtos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInsumo(user.id!, id);
              loadInsumos();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o insumo.');
            }
          },
        },
      ]
    );
  };

  const navigateToNovoInsumo = () => router.push('/insumos/novo');

  const filteredInsumos = insumos.filter(i =>
    i.nome.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Text className="text-2xl font-bold text-gray-800">Meus Insumos</Text>
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
      ) : filteredInsumos.length === 0 ? (
        <EmptyState onAdd={navigateToNovoInsumo} />
      ) : (
        <FlatList<Insumo>
          data={filteredInsumos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <InsumoCard 
              item={item} 
              onEdit={() => router.push(`/insumos/editar/${item.id}`)}
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
          onPress={navigateToNovoInsumo}
        >
          <Plus size={32} color="#fff" />
        </TouchableOpacity>
      }
    </SafeAreaView>
  );
}

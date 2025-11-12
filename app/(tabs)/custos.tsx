
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Plus, DollarSign, Trash2 } from 'lucide-react-native';

import { getCustosGlobais, CustoGlobal, updateCustoGlobal, deleteCustoGlobal } from '@/services/database';
import { formatCurrency } from '@/utils/format';
import { useUser } from '@/hooks/useUser';

// Tipos para os props dos componentes
interface CustoCardProps {
  item: CustoGlobal;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

interface EmptyStateProps {
  onAdd: () => void;
}

// Componente de Item da Lista
const CustoCard: React.FC<CustoCardProps> = ({ item, onEdit, onDelete, onToggle }) => (
  <TouchableOpacity 
    onPress={onEdit}
    className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm border border-gray-200"
  >
    <View className="flex-row justify-between items-center">
        {/* Informações do Custo */}
        <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{item.nome}</Text>
            <Text className="text-lg font-semibold text-purple-700 mt-1">{formatCurrency(item.valor)}</Text>
        </View>

        {/* Ações */}
        <View className="flex-row items-center">
            <Switch
                value={item.ativo}
                onValueChange={onToggle}
                trackColor={{ false: "#e5e7eb", true: "#8b5cf6" }}
                thumbColor={"#f9fafb"}
                ios_backgroundColor="#e5e7eb"
            />
            <TouchableOpacity onPress={onDelete} className="p-2 ml-2">
                <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    </View>
  </TouchableOpacity>
);

// Componente de Estado Vazio
const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => (
  <View className="flex-1 justify-center items-center px-6">
    <DollarSign size={48} color="#d1d5db" />
    <Text className="text-2xl font-bold text-gray-800 mt-4">Monitore seus custos</Text>
    <Text className="text-base text-gray-500 text-center mt-2 mb-6">Cadastre seus custos fixos, como aluguel e salários, para calcular o preço ideal dos seus produtos.</Text>
    <TouchableOpacity 
      onPress={onAdd}
      className="bg-purple-600 rounded-lg px-8 py-4 shadow-md"
    >
      <Text className="text-white font-bold text-lg">Cadastrar Primeiro Custo</Text>
    </TouchableOpacity>
  </View>
);

export default function CustosScreen() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [custos, setCustos] = useState<CustoGlobal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadCustos = useCallback(() => {
    if (!user?.id) return;
    setDataLoading(true);
    getCustosGlobais(user.id)
      .then(allCustos => {
        const fixos = allCustos.filter(c => c.tipo === 'Fixo');
        setCustos(fixos);
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível carregar os custos.');
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  useFocusEffect(loadCustos);

  const handleToggleAtivo = (custo: CustoGlobal) => {
    if (!user?.id) return;
    const originalState = [...custos];
    const newState = custos.map(c => c.id === custo.id ? { ...c, ativo: !c.ativo } : c);
    setCustos(newState);

    const updatedCusto = newState.find(c => c.id === custo.id)!;
    const { id, user_id, ...custoData } = updatedCusto;

    updateCustoGlobal(user.id, custo.id, custoData).catch(() => {
      Alert.alert('Erro', 'Falha ao atualizar. Tente novamente.');
      setCustos(originalState); // Reverte em caso de erro
    });
  };

  const handleDelete = (id: number) => {
    if (!user?.id) return;
    Alert.alert(
      'Excluir Custo',
      'Tem certeza que deseja excluir este custo fixo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
            try {
              await deleteCustoGlobal(user.id!, id);
              loadCustos();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o custo.');
            }
        }}
      ]
    );
  };

  const navigateToNovoCusto = () => router.push('/custos/novo');

  if (userLoading) {
    return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#8A2BE2" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 bg-white pb-3 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Custos Fixos</Text>
      </View>

      {dataLoading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : custos.length === 0 ? (
        <EmptyState onAdd={navigateToNovoCusto} />
      ) : (
        <FlatList<CustoGlobal>
          data={custos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CustoCard 
              item={item} 
              onEdit={() => router.push(`/custos/editar/${item.id}`)}
              onDelete={() => handleDelete(item.id)}
              onToggle={() => handleToggleAtivo(item)}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }} // Padding for FAB
        />
      )}

      {/* Floating Action Button */}
      {!dataLoading &&
        <TouchableOpacity 
          className="absolute bottom-6 right-6 bg-purple-600 rounded-full h-16 w-16 justify-center items-center shadow-lg"
          onPress={navigateToNovoCusto}
        >
          <Plus size={32} color="#fff" />
        </TouchableOpacity>
      }
    </SafeAreaView>
  );
}

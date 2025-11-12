
import { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, X, PlusCircle, Trash2, Search } from 'lucide-react-native';

import { useProductForm } from '@/context/ProductFormContext';
import { getInsumos, Insumo, InsumoProduto } from '@/services/database';
import { useUser } from '@/hooks/useUser';

// Tipos
interface InsumoProdutoDetalhado extends InsumoProduto {
  nome: string;
  unidade_compra: string;
}

interface FormButtonProps {
    text: string;
    onPress: () => void;
    disabled?: boolean;
}

// Componentes de UI
const FormButton: React.FC<FormButtonProps> = ({ text, onPress, disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`h-14 rounded-lg justify-center items-center shadow-sm ${disabled ? 'bg-gray-400' : 'bg-primary-DEFAULT'}`}>
    <Text className="text-white font-bold text-lg">{text}</Text>
  </TouchableOpacity>
);

export default function NovoProdutoStep2Screen() {
  const router = useRouter();
  const { user } = useUser();
  const { productData, addInsumo, removeInsumo, updateInsumoQuantity } = useProductForm();

  const [todosInsumos, setTodosInsumos] = useState<Insumo[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoadingInsumos(true);
      getInsumos(user.id)
        .then(setTodosInsumos)
        .catch(err => {
          console.error('Falha ao buscar insumos:', err);
          Alert.alert("Erro", "Não foi possível carregar os insumos.");
        })
        .finally(() => setLoadingInsumos(false));
    }, [user])
  );

  const handleAddInsumo = (insumo: Insumo) => {
    const novoInsumo: InsumoProdutoDetalhado = {
        insumo_id: insumo.id,
        quantidade_usada: 0,
        nome: insumo.nome,
        unidade_compra: insumo.unidade_compra,
        produto_id: 0
    };
    addInsumo(novoInsumo);
  };
  
  const handleQuantityChange = (insumoId: number, quantity: string) => {
    const num = parseFloat(quantity.replace(',', '.'));
    updateInsumoQuantity(insumoId, isNaN(num) ? 0 : num)
  }

  const handleNext = () => {
    const hasInvalidQuantity = productData.insumos?.some(i => i.quantidade_usada <= 0);
    if (productData.insumos?.length === 0 || !productData.insumos) {
        Alert.alert("Atenção", "Adicione pelo menos um insumo à receita.");
        return;
    }
    if (hasInvalidQuantity) {
      Alert.alert("Atenção", "Todos os insumos adicionados devem ter uma quantidade maior que zero.");
      return;
    }
    router.push('/produtos/novo-step3');
  };

  const availableInsumos = useMemo(() => {
    const selectedIds = new Set(productData.insumos?.map(i => i.insumo_id));
    return todosInsumos
      .filter(insumo => !selectedIds.has(insumo.id))
      .filter(insumo => insumo.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [todosInsumos, productData.insumos, searchQuery]);

  if (loadingInsumos) {
    return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#8A2BE2" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
                <ArrowLeft size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-700">Passo 2 de 3</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/produtos')} className="p-2">
                <X size={24} color="#4A5568" />
            </TouchableOpacity>
        </View>
        <View className="px-4 mt-2">
            <View className="h-1.5 bg-gray-200 rounded-full w-full">
                <View className="h-1.5 bg-primary-DEFAULT rounded-full" style={{ width: '66%' }} />
            </View>
        </View>

        <View className="flex-1 p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Insumos da Receita</Text>
          
          {/* Insumos Adicionados */}
          <FlatList
            data={productData.insumos as InsumoProdutoDetalhado[]}
            keyExtractor={(item) => item.insumo_id.toString()}
            ListHeaderComponent={() => (
                <Text className="text-lg font-semibold text-gray-700 mb-2">Insumos Adicionados</Text>
            )}
            renderItem={({ item }) => (
              <View className="bg-white p-3 rounded-lg border border-gray-200 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">{item.nome}</Text>
                  <View className="flex-row items-center mt-1">
                    <TextInput
                      className="border-b border-gray-400 w-20 text-base"
                      placeholder="Qtd."
                      keyboardType="numeric"
                      value={item.quantidade_usada > 0 ? item.quantidade_usada.toString().replace('.', ',') : ''}
                      onChangeText={(text) => handleQuantityChange(item.insumo_id, text)}
                    />
                    <Text className="text-gray-600 ml-2">{item.unidade_compra}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeInsumo(item.insumo_id)} className="p-2">
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => <Text className="text-gray-500 text-center py-4">Nenhum insumo adicionado ainda.</Text>}
          />

          {/* Adicionar Insumos */}
          <View className="flex-1 mt-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Adicionar Insumos</Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 py-2 mb-3">
              <Search size={20} color="#9ca3af" />
              <TextInput className="flex-1 ml-2 text-base" placeholder="Buscar insumo..." onChangeText={setSearchQuery} />
            </View>
            <FlatList
              data={availableInsumos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAddInsumo(item)} className="bg-white p-3 rounded-lg border border-gray-200 mb-2 flex-row justify-between items-center">
                  <Text className="font-semibold text-gray-800">{item.nome}</Text>
                  <PlusCircle size={22} color="#34D399" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => <Text className="text-gray-500 text-center py-4">Nenhum insumo disponível.</Text>}
            />
          </View>
        </View>
        
        <View className="p-4">
            <FormButton text="Próximo" onPress={handleNext} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

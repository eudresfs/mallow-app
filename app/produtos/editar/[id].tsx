
import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, KeyboardTypeOptions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Save, PlusCircle, Trash2, Search } from 'lucide-react-native';

import { getProdutoById, getInsumos, Insumo, updateProduto, Produto, InsumoProduto } from '@/services/database';
import { useUser } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/format';

// Tipos
interface InsumoProdutoDetalhado extends InsumoProduto {
  nome: string;
  unidade_compra: string;
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  unit?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChangeText, placeholder, keyboardType = 'default', unit = '' }) => (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-700 mb-2">{label}</Text>
      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg">
          <TextInput
              className="flex-1 p-4 text-base text-gray-900"
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              keyboardType={keyboardType}
              placeholderTextColor="#A0AEC0"
          />
          {unit && <Text className="pr-4 text-base text-gray-500">{unit}</Text>}
      </View>
    </View>
);

export default function EditarProdutoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const produtoId = parseInt(id, 10);

  const [form, setForm] = useState<Partial<Produto>>({});
  const [selectedInsumos, setSelectedInsumos] = useState<InsumoProdutoDetalhado[]>([]);
  const [todosInsumos, setTodosInsumos] = useState<Insumo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      getProdutoById(user.id, produtoId),
      getInsumos(user.id),
    ]).then(([produtoData, insumosData]) => {
      if (produtoData) {
        setForm(produtoData.produto);
        const insumosDetalhados = produtoData.insumos.map(i => {
            const insumoPai = insumosData.find(ins => ins.id === i.insumo_id);
            return {
                ...i,
                nome: insumoPai?.nome || '',
                unidade_compra: insumoPai?.unidade_compra || ''
            };
        });
        setSelectedInsumos(insumosDetalhados);
      } else {
        Alert.alert('Erro', 'Produto não encontrado.');
        router.back();
      }
      setTodosInsumos(insumosData);
    }).catch(err => {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }).finally(() => setLoading(false));
  }, [user, produtoId, router]);

  const handleFieldChange = (name: keyof Produto, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInsumo = (insumo: Insumo) => {
    const novoInsumo: InsumoProdutoDetalhado = {
        produto_id: produtoId,
        insumo_id: insumo.id,
        quantidade_usada: 0,
        nome: insumo.nome,
        unidade_compra: insumo.unidade_compra
    };
    setSelectedInsumos(prev => [...prev, novoInsumo]);
  };

  const handleRemoveInsumo = (insumoId: number) => {
    setSelectedInsumos(prev => prev.filter(i => i.insumo_id !== insumoId));
  };

  const handleQuantityChange = (insumoId: number, quantity: string) => {
    const num = parseFloat(quantity.replace(',', '.'));
    setSelectedInsumos(prev => prev.map(i => i.insumo_id === insumoId ? { ...i, quantidade_usada: isNaN(num) ? 0 : num } : i));
  };

  const { custoTotal, custoUnitario, precoSugerido } = useMemo(() => {
    const insumosMap = new Map(todosInsumos.map(i => [i.id, i]));
    const custoTotal = selectedInsumos.reduce((acc, item) => {
        const insumoInfo = insumosMap.get(item.insumo_id);
        if (!insumoInfo || !insumoInfo.preco_compra || !insumoInfo.quantidade_compra) return acc;
        const custoPorUnidade = insumoInfo.preco_compra / insumoInfo.quantidade_compra;
        return acc + (custoPorUnidade * item.quantidade_usada);
    }, 0);
    const rendimento = Number(form.rendimento) || 1;
    const custoUnitario = custoTotal / rendimento;
    const margem = Number(form.margem_lucro) || 0;
    const precoSugerido = custoUnitario * (1 + margem / 100);
    return { custoTotal, custoUnitario, precoSugerido };
  }, [selectedInsumos, form, todosInsumos]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!form.nome || !form.rendimento || !form.margem_lucro) {
        Alert.alert('Atenção', 'Preencha todos os detalhes do produto.');
        return;
    }
    if (selectedInsumos.length === 0 || selectedInsumos.some(i => i.quantidade_usada <= 0)){
        Alert.alert('Atenção', 'Adicione insumos e verifique se as quantidades são maiores que zero.');
        return;
    }
    setIsSubmitting(true);
    try {
        const finalForm = {
          ...form,
          rendimento: Number(form.rendimento),
          margem_lucro: Number(form.margem_lucro),
        } as Produto;

        const { id, user_id, ...produtoData } = finalForm;
        
        const insumosParaAtualizar = selectedInsumos.map(({ nome, unidade_compra, ...insumoProduto }) => insumoProduto as InsumoProduto);

        await updateProduto(user.id, produtoId, produtoData, insumosParaAtualizar);
        Alert.alert('Sucesso', 'Produto atualizado!');
        router.back();
    } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível atualizar o produto.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const availableInsumos = useMemo(() => {
    const selectedIds = new Set(selectedInsumos.map(i => i.insumo_id));
    return todosInsumos
      .filter(insumo => !selectedIds.has(insumo.id))
      .filter(insumo => insumo.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [todosInsumos, selectedInsumos, searchQuery]);

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 flex-row justify-between items-center bg-white pb-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
                <X size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Editar Produto</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="p-2">
                {isSubmitting ? <ActivityIndicator size="small" /> : <Save size={24} color="#8A2BE2" />}
            </TouchableOpacity>
        </View>

        <ScrollView>
            {/* Detalhes do Produto */}
            <View className="p-4">
                <Text className="text-xl font-bold text-gray-800 mb-4">Detalhes do Produto</Text>
                <FormField label="Nome do Produto" value={form.nome || ''} onChangeText={(t) => handleFieldChange('nome', t)} />
                <FormField label="Rendimento" value={form.rendimento?.toString() || ''} onChangeText={(t) => handleFieldChange('rendimento', t)} keyboardType="numeric" unit="unidades" />
                <FormField label="Margem de Lucro" value={form.margem_lucro?.toString() || ''} onChangeText={(t) => handleFieldChange('margem_lucro', t)} keyboardType="numeric" unit="%" />
            </View>

            {/* Insumos */}
            <View className="p-4 border-t border-gray-200">
                <Text className="text-xl font-bold text-gray-800 mb-4">Insumos da Receita</Text>
                {selectedInsumos.map(item => (
                  <View key={item.insumo_id} className="bg-white p-3 rounded-lg border border-gray-200 mb-3 flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">{item.nome}</Text>
                      <View className="flex-row items-center mt-1">
                        <TextInput className="border-b border-gray-400 w-20 text-base" placeholder="Qtd." keyboardType="numeric" value={item.quantidade_usada > 0 ? String(item.quantidade_usada).replace('.', ',') : ''} onChangeText={(t) => handleQuantityChange(item.insumo_id, t)} />
                        <Text className="text-gray-600 ml-2">{item.unidade_compra}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveInsumo(item.insumo_id)} className="p-2"><Trash2 size={20} color="#EF4444" /></TouchableOpacity>
                  </View>
                ))}
                 <Text className="text-lg font-semibold text-gray-700 my-2">Adicionar Insumos</Text>
                <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 py-2 mb-3">
                  <Search size={20} color="#9ca3af" />
                  <TextInput className="flex-1 ml-2 text-base" placeholder="Buscar insumo..." onChangeText={setSearchQuery} />
                </View>
                {availableInsumos.map(item => (
                    <TouchableOpacity key={item.id} onPress={() => handleAddInsumo(item)} className="bg-white p-3 rounded-lg border border-gray-200 mb-2 flex-row justify-between items-center">
                        <Text className="font-semibold text-gray-800">{item.nome}</Text>
                        <PlusCircle size={22} color="#34D399" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Cálculo de Preço */}
            <View className="p-4 border-t border-gray-200">
                <Text className="text-xl font-bold text-gray-800 mb-2">Cálculo de Preço</Text>
                <View className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <View className="flex-row justify-between py-2 border-b border-gray-200"><Text>Custo Total</Text><Text className="font-bold">{formatCurrency(custoTotal)}</Text></View>
                    <View className="flex-row justify-between py-2 border-b border-gray-200"><Text>Custo por Unidade</Text><Text className="font-bold">{formatCurrency(custoUnitario)}</Text></View>
                    <View className="flex-row justify-between py-2"><Text>Preço de Venda</Text><Text className="font-bold text-primary-DEFAULT">{formatCurrency(precoSugerido)}</Text></View>
                </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

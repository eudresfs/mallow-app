
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, KeyboardTypeOptions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getInsumoById, updateInsumo, Insumo } from '@/services/database';
import { useUser } from '@/hooks/useUser';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  unit?: string;
}

// Reusable UI Components
const FormField: React.FC<FormFieldProps> = ({ label, value, onChangeText, placeholder, keyboardType = 'default', unit = '' }) => (
    <View className="mb-6">
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

export default function EditarInsumoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insumoId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [originalInsumo, setOriginalInsumo] = useState<Insumo | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getInsumoById(user.id, insumoId)
      .then(data => {
        if (data) {
          setOriginalInsumo(data);
          setNome(data.nome);
          setPreco(data.preco_compra.toString().replace('.', ','));
          setQuantidade(data.quantidade_compra.toString().replace('.', ','));
          setUnidade(data.unidade_compra);
        } else {
          Alert.alert('Erro', 'Insumo não encontrado.');
          router.back();
        }
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Erro', 'Não foi possível carregar o insumo.');
      })
      .finally(() => setLoading(false));
  }, [user, insumoId, router]);

  const handleSubmit = async () => {
    if (!user?.id || !originalInsumo) {
        Alert.alert('Erro', 'Dados do insumo não carregados. Tente novamente.');
        return;
    }

    const precoNum = parseFloat(preco.replace(',', '.'));
    const quantidadeNum = parseFloat(quantidade.replace(',', '.'));

    if (!nome || !unidade || isNaN(precoNum) || precoNum <= 0 || isNaN(quantidadeNum) || quantidadeNum <= 0) {
        Alert.alert('Campos Inválidos', 'Por favor, preencha todos os campos com valores válidos.');
        return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...originalInsumo,
        nome,
        preco_compra: precoNum,
        quantidade_compra: quantidadeNum,
        unidade_compra: unidade,
      };

      const { id, user_id, ...insumoData } = updatedData;

      await updateInsumo(user.id, insumoId, insumoData);
      Alert.alert('Sucesso', 'Insumo atualizado!');
      router.back();
    } catch (error) {
      console.error('Erro ao atualizar insumo:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o insumo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#8A2BE2" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 flex-row justify-between items-center bg-white pb-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
                <X size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Editar Insumo</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="p-2">
                {isSubmitting ? <ActivityIndicator size="small" color="#8A2BE2" /> : <Save size={24} color="#8A2BE2" />}
            </TouchableOpacity>
        </View>

        <ScrollView className="p-4">
          <FormField
            label="Nome do Insumo"
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Leite condensado"
          />
          <FormField
            label="Preço de Compra"
            value={preco}
            onChangeText={setPreco}
            placeholder="Ex: 5,50"
            keyboardType="numeric"
            unit="R$"
          />
          <FormField
            label="Quantidade Comprada"
            value={quantidade}
            onChangeText={setQuantidade}
            placeholder="Ex: 395"
            keyboardType="numeric"
          />
          <FormField
            label="Unidade de Compra"
            value={unidade}
            onChangeText={setUnidade}
            placeholder="g, kg, L, ml, un"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, KeyboardTypeOptions } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Save } from 'lucide-react-native';

import { createInsumo } from '@/services/database';
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

export default function NovoInsumoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Sessão de usuário inválida. Por favor, reinicie o aplicativo.');
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
      await createInsumo(user.id, {
        nome,
        preco_compra: precoNum,
        quantidade_compra: quantidadeNum,
        unidade_compra: unidade,
        categoria: null,
        data_compra: new Date().toISOString().split('T')[0], // Define a data atual
        quantidade_por_embalagem: null,
        fornecedor: null,
        observacoes: null,
      });
      Alert.alert('Sucesso', 'Insumo cadastrado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao criar insumo:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o insumo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 flex-row justify-between items-center bg-white pb-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
                <X size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Novo Insumo</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="p-2">
                {isSubmitting ? <ActivityIndicator size="small" color="#8A2BE2" /> : <Save size={24} color="#8A2BE2" />}
            </TouchableOpacity>
        </View>

        <ScrollView className="p-4">
          <View className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <Text className="text-blue-800 text-center">Dica: Cadastre o insumo com a unidade de medida que você o compra. Ex: Leite Condensado, 395g.</Text>
          </View>

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

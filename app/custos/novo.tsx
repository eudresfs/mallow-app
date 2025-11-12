
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, KeyboardTypeOptions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Save } from 'lucide-react-native';

import { createCustoGlobal } from '@/services/database';
import { useUser } from '@/hooks/useUser';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  unit?: string;
}

// Reusable UI Component
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

export default function NovoCustoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Sessão de usuário inválida.');
      return;
    }

    const valorNum = parseFloat(valor.replace(',', '.'));

    if (!descricao || isNaN(valorNum) || valorNum <= 0) {
      Alert.alert('Campos Inválidos', 'Preencha a descrição e um valor válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCustoGlobal(user.id, {
        nome: descricao,
        valor: valorNum,
        tipo: 'Fixo', // Simplificado: todos os custos são Fixos por padrão
        ativo: true, // Simplificado: todos os custos são Ativos por padrão
      });
      Alert.alert('Sucesso', 'Custo Fixo cadastrado!');
      router.back();
    } catch (error) {
      console.error('Erro ao criar custo:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o custo. Tente novamente.');
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
            <Text className="text-lg font-bold text-gray-800">Novo Custo Fixo</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="p-2">
                {isSubmitting ? <ActivityIndicator size="small" color="#8A2BE2" /> : <Save size={24} color="#8A2BE2" />}
            </TouchableOpacity>
        </View>

        <ScrollView className="p-4">
          <FormField
            label="Descrição do Custo"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ex: Aluguel do ateliê"
          />
          <FormField
            label="Valor Mensal"
            value={valor}
            onChangeText={setValor}
            placeholder="Ex: 800,00"
            keyboardType="numeric"
            unit="R$"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, KeyboardTypeOptions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Save } from 'lucide-react-native';

import { getCustoGlobalById, updateCustoGlobal, CustoGlobal } from '@/services/database';
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

export default function EditarCustoScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const custoId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [originalCusto, setOriginalCusto] = useState<CustoGlobal | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getCustoGlobalById(user.id, custoId)
      .then(data => {
        if (data) {
          setOriginalCusto(data);
          setDescricao(data.nome);
          setValor(data.valor.toString().replace('.', ','));
        } else {
          Alert.alert('Erro', 'Custo não encontrado.');
          router.back();
        }
      })
      .catch(err => {
        console.error('Erro ao carregar custo:', err);
        Alert.alert('Erro', 'Não foi possível carregar o custo.');
      })
      .finally(() => setLoading(false));
  }, [user, custoId, router]);

  const handleSubmit = async () => {
    if (!user?.id || !originalCusto) {
      Alert.alert('Erro', 'Dados do custo não carregados.');
      return;
    }

    const valorNum = parseFloat(valor.replace(',', '.'));

    if (!descricao || isNaN(valorNum) || valorNum <= 0) {
      Alert.alert('Campos Inválidos', 'Preencha a descrição e um valor válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...originalCusto,
        nome: descricao,
        valor: valorNum,
      };
      const { id, user_id, ...custoData } = updatedData;

      await updateCustoGlobal(user.id, custoId, custoData);
      Alert.alert('Sucesso', 'Custo Fixo atualizado!');
      router.back();
    } catch (error) {
      console.error('Erro ao atualizar custo:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o custo.');
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
            <Text className="text-lg font-bold text-gray-800">Editar Custo Fixo</Text>
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

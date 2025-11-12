
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, KeyboardTypeOptions } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProductForm } from '@/context/ProductFormContext';
import { useUser } from '@/hooks/useUser';

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    unit?: string;
}

interface FormButtonProps {
    text: string;
    onPress: () => void;
    disabled?: boolean;
}

// Componentes de UI reutilizáveis
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

const FormButton: React.FC<FormButtonProps> = ({ text, onPress, disabled = false }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`h-14 rounded-lg justify-center items-center shadow-sm ${disabled ? 'bg-gray-400' : 'bg-primary-DEFAULT'}`}>
      <Text className="text-white font-bold text-lg">{text}</Text>
    </TouchableOpacity>
  );

export default function NovoProdutoStep1Screen() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { productData, setProductData } = useProductForm();

  const [nome, setNome] = useState(productData.nome || '');
  const [rendimento, setRendimento] = useState(productData.rendimento?.toString() || '');
  const [margemLucro, setMargemLucro] = useState(productData.margem_lucro?.toString() || '');

  const handleNext = () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não está disponível. Por favor, reinicie o app.');
      return;
    }

    const rendimentoNum = parseFloat(rendimento.replace(',', '.'));
    const margemNum = parseFloat(margemLucro.replace(',', '.'));

    if (!nome || isNaN(rendimentoNum) || rendimentoNum <= 0 || isNaN(margemNum)) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos com valores válidos.');
      return;
    }

    setProductData({
        ...productData,
      user_id: user.id,
      nome,
      rendimento: rendimentoNum,
      margem_lucro: margemNum,
    });

    router.push('/produtos/novo-step2');
  };

  if (userLoading) {
      return (
          <View className="flex-1 justify-center items-center bg-gray-50">
              <ActivityIndicator size="large" color="#8A2BE2" />
          </View>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            {/* Cabeçalho */}
            <View className="px-4 pt-4 flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-700">Passo 1 de 3</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/produtos')} className="p-2">
                    <X size={24} color="#4A5568" />
                </TouchableOpacity>
            </View>

            {/* Barra de Progresso */}
            <View className="px-4 mt-2">
                <View className="h-1.5 bg-gray-200 rounded-full w-full">
                    <View className="h-1.5 bg-primary-DEFAULT rounded-full" style={{ width: '33%' }} />
                </View>
            </View>

            <View className="flex-1 p-4 justify-between">
                <View>
                    <Text className="text-2xl font-bold text-gray-800 mb-6">Detalhes do Produto</Text>
                    <FormField
                        label="Nome do Produto"
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Ex: Bolo de Chocolate"
                    />
                    <FormField
                        label="Rendimento da Receita"
                        value={rendimento}
                        onChangeText={setRendimento}
                        keyboardType="numeric"
                        placeholder="Ex: 12"
                        unit="unidades"
                    />
                    <FormField
                        label="Margem de Lucro Desejada"
                        value={margemLucro}
                        onChangeText={setMargemLucro}
                        keyboardType="numeric"
                        placeholder="Ex: 100"
                        unit="%"
                    />
                </View>

                <View className="mb-4">
                    <FormButton text="Próximo" onPress={handleNext} />
                </View>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

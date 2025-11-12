
import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X, CheckCircle } from 'lucide-react-native';

import { useProductForm } from '@/context/ProductFormContext';
import { useUser } from '@/hooks/useUser';
import { Insumo, getInsumos, createProduto, InsumoProduto, ProdutoData } from '@/services/database';
import { formatCurrency } from '@/utils/format';

// Tipos
interface InsumoProdutoDetalhado extends InsumoProduto {
    nome: string;
    unidade_compra: string;
}

interface FormButtonProps {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

interface InfoRowProps {
    label: string;
    value: string;
    valueClassName?: string;
}

// Componentes de UI
const FormButton: React.FC<FormButtonProps> = ({ text, onPress, disabled = false, loading = false }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-14 rounded-lg justify-center items-center shadow-sm flex-row ${disabled || loading ? 'bg-gray-400' : 'bg-primary-DEFAULT'}`}>
      {loading ? <ActivityIndicator color="#fff" /> : <CheckCircle size={20} color="#fff" />}
      <Text className="text-white font-bold text-lg ml-2">{text}</Text>
    </TouchableOpacity>
  );

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClassName = 'text-gray-900' }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
        <Text className="text-base text-gray-600">{label}</Text>
        <Text className={`text-base font-semibold ${valueClassName}`}>{value}</Text>
    </View>
)

export default function NovoProdutoStep3Screen() {
  const router = useRouter();
  const { user } = useUser();
  const { productData, clearForm } = useProductForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allInsumos, setAllInsumos] = useState<Insumo[]>([]);

  // Carrega todos os insumos para ter os dados de preço para o cálculo
  useState(() => {
    if (user?.id) {
        getInsumos(user.id).then(setAllInsumos);
    }
  });

  const { custoTotal, custoUnitario, precoSugerido } = useMemo(() => {
    const insumosMap = new Map(allInsumos.map(i => [i.id, i]));
    const custoTotal = productData.insumos?.reduce((acc, item) => {
        const insumoInfo = insumosMap.get(item.insumo_id);
        if (!insumoInfo) return acc;
        const custoPorUnidadeDeCompra = insumoInfo.preco_compra / insumoInfo.quantidade_compra;
        return acc + (custoPorUnidadeDeCompra * item.quantidade_usada);
    }, 0) || 0;

    const rendimento = productData.rendimento || 1;
    const custoUnitario = custoTotal / rendimento;
    const margem = productData.margem_lucro || 0;
    const precoSugerido = custoUnitario * (1 + margem / 100);

    return { custoTotal, custoUnitario, precoSugerido };
  }, [productData, allInsumos]);

  const handleSubmit = async () => {
    if (!user?.id || !productData.nome || !productData.rendimento || !productData.margem_lucro || !productData.insumos) {
        Alert.alert('Erro', 'Dados do produto incompletos. Por favor, revise os passos anteriores.');
        return;
    }
    setIsSubmitting(true);
    try {
        const { nome, rendimento, margem_lucro } = productData;
        const insumosParaSalvar = productData.insumos.map(({ insumo_id, quantidade_usada }) => ({ insumo_id, quantidade_usada }));
        
        const produtoParaSalvar: ProdutoData = {
            nome,
            rendimento,
            margem_lucro,
            preco_manual: null,
            tempo_producao: null,
        }

        await createProduto(user.id, produtoParaSalvar, insumosParaSalvar);
        
        Alert.alert('Sucesso!', 'Produto criado e preço calculado!');
        clearForm();
        router.replace('/(tabs)/produtos');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível criar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
                <ArrowLeft size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-700">Passo 3 de 3</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/produtos')} className="p-2">
                <X size={24} color="#4A5568" />
            </TouchableOpacity>
        </View>
        <View className="px-4 mt-2">
            <View className="h-1.5 bg-gray-200 rounded-full w-full">
                <View className="h-1.5 bg-primary-DEFAULT rounded-full" style={{ width: '100%' }} />
            </View>
        </View>

        <ScrollView className="flex-1">
            <View className="p-4">
                <Text className="text-2xl font-bold text-gray-800 mb-4">Revisão e Finalização</Text>
                
                <View className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <InfoRow label="Nome do Produto" value={productData.nome || ''} />
                    <InfoRow label="Rendimento" value={`${productData.rendimento} unidades`} />
                    <InfoRow label="Margem de Lucro" value={`${productData.margem_lucro}%`} />
                </View>

                <Text className="text-xl font-bold text-gray-800 mt-6 mb-2">Insumos</Text>
                <View className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {(productData.insumos as InsumoProdutoDetalhado[])?.map(insumo => (
                        <InfoRow key={insumo.insumo_id} label={insumo.nome || 'Insumo não encontrado'} value={`${insumo.quantidade_usada.toString().replace('.', ',')} ${insumo.unidade_compra || ''}`} />
                    ))}
                </View>

                <Text className="text-xl font-bold text-gray-800 mt-6 mb-2">Cálculo de Preço</Text>
                <View className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <InfoRow label="Custo Total da Receita" value={formatCurrency(custoTotal)} />
                    <InfoRow label="Custo por Unidade" value={formatCurrency(custoUnitario)} />
                    <InfoRow label="Preço de Venda Sugerido" value={formatCurrency(precoSugerido)} valueClassName="text-primary-DEFAULT text-lg" />
                </View>
            </View>
        </ScrollView>
        
        <View className="p-4 border-t border-gray-200 bg-white">
            <FormButton text="Salvar Produto e Calcular Preço" onPress={handleSubmit} loading={isSubmitting} />
        </View>
    </SafeAreaView>
  );
}

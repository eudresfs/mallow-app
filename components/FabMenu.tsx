
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, SharedValue } from 'react-native-reanimated';
import { Plus, X, Box, ShoppingBag, DollarSign } from 'lucide-react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Definição do tipo para os itens de ação
interface ActionItem {
  label: string;
  icon: React.ElementType;
  color: string;
  screen: '/produtos/novo' | '/insumos/novo' | '/custos/novo';
}

// Props para o novo componente ActionButton
interface ActionButtonProps {
  index: number;
  animation: SharedValue<number>;
  item: ActionItem;
  onPress: () => void;
}

// Componente para cada botão de ação, que usa o hook de animação corretamente.
const ActionButton: React.FC<ActionButtonProps> = ({ index, animation, item, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: animation.value },
      { translateY: interpolate(animation.value, [0, 1], [0, -(index * 60 + 70)]) },
    ],
    opacity: animation.value,
  }));

  return (
    <AnimatedTouchable
      style={[styles.actionButtonContainer, animatedStyle]}
      onPress={onPress}
    >
      <View className="flex-row items-center">
          <View className="bg-card p-3 rounded-full shadow-lg">
              <Text className="text-gray-800 font-bold mr-4">{item.label}</Text>
          </View>
          {/* Corrigido: O TouchableOpacity interno foi substituído por uma View */}
          <View
              style={{ backgroundColor: item.color }}
              className="w-14 h-14 rounded-full justify-center items-center shadow-lg"
          >
              <item.icon size={24} color="#fff" />
          </View>
      </View>
    </AnimatedTouchable>
  );
};

const FabMenu = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useSharedValue(0);

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    animation.value = withSpring(toValue, { damping: 15, stiffness: 120 });
    setIsOpen(!isOpen);
  };

  const mainIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 45])}deg` }],
  }));

  const actionItems: ActionItem[] = [
    { label: 'Adicionar Produto', icon: Box, color: '#8A2BE2', screen: '/produtos/novo' },
    { label: 'Adicionar Insumo', icon: ShoppingBag, color: '#E11D48', screen: '/insumos/novo' },
    { label: 'Adicionar Custo', icon: DollarSign, color: '#FF8C00', screen: '/custos/novo' },
  ];

  return (
    <>
      {isOpen && (
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={toggleMenu}>
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
      )}
      <View className="absolute bottom-5 right-5 items-center">
        {actionItems.map((item, index) => (
          <ActionButton
            key={item.label}
            index={index}
            animation={animation}
            item={item}
            onPress={() => {
              toggleMenu();
              router.push(item.screen);
            }}
          />
        ))}
        <AnimatedTouchable
          onPress={toggleMenu}
          className="w-16 h-16 rounded-full justify-center items-center shadow-lg"
          style={{ backgroundColor: isOpen ? 'transparent' : '#8A2BE2' }}
        >
          <Animated.View style={mainIconStyle}>
            {isOpen ? <X size={30} color="#4A5568" /> : <Plus size={30} color="#fff" />}
          </Animated.View>
        </AnimatedTouchable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});

export default FabMenu;


import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

// Mock Google Logo
const GoogleLogo = 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg';

export default function SignUpScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { signInWithGoogle, loading } = useAuth();

  const handleSignUp = () => {
    // TODO: Implement email/password sign-up
    console.log('Attempting to sign up...');
  };

  return (
    <SafeAreaView className="flex-1 bg-fuchsia-50">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow justify-center p-8">
        {loading ? (
          <ActivityIndicator size="large" color="#E73587" />
        ) : (
          <View className="items-center">
            {/* Logo */}
            <View className="w-24 h-24 bg-fuchsia-200 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">??</Text>
            </View>

            {/* Títulos */}
            <Text className="text-3xl font-bold text-gray-800">Criar conta</Text>
            <Text className="text-base text-muted-foreground mb-8">Cadastre-se e comece a calcular seus preços</Text>

            {/* Social Auth */}
            <TouchableOpacity
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row items-center justify-center mb-6"
              onPress={signInWithGoogle}
              disabled={loading}
            >
              <Image source={{ uri: GoogleLogo }} className="w-6 h-6 mr-3" />
              <Text className="text-base font-semibold text-gray-700">Continuar com Google</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View className="flex-row items-center w-full mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-sm text-muted-foreground">ou</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Formulário */}
            <View className="w-full gap-y-4">
              {/* Input Nome */}
              <View className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row items-center">
                <User size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Ex.: Maria Silva"
                  autoCapitalize="words"
                  className="flex-1 text-base text-gray-800"
                />
              </View>

              {/* Input E-mail */}
              <View className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row items-center">
                <Mail size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-base text-gray-800"
                />
              </View>

              {/* Input Senha */}
              <View className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row items-center">
                <Lock size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="••••••••"
                  secureTextEntry={!passwordVisible}
                  className="flex-1 text-base text-gray-800"
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  {passwordVisible ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Principal */}
            <TouchableOpacity
              className="w-full bg-fuchsia-500 rounded-lg p-4 mt-8"
              onPress={handleSignUp}
            >
              <Text className="text-white text-center font-bold text-base">Criar conta</Text>
            </TouchableOpacity>

            {/* Link para Login */}
            <View className="flex-row mt-8">
              <Text className="text-muted-foreground">Já tem conta? </Text>
              <Link href="/(auth)/sign-in">
                <Text className="font-semibold text-fuchsia-500">Entrar</Text>
              </Link>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

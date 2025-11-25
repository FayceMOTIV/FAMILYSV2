import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Produit' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: true, title: 'Connexion' }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: true, title: 'Inscription' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Commande' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

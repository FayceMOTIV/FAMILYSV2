import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCartStore } from '../stores/cartStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useAuthStore } from '../stores/authStore';
import PopupModal from '../components/PopupModal';

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Initialize stores
    useCartStore.getState().initCart();
    useFavoritesStore.getState().initFavorites();

    // Setup push notifications (only on real device)
    setupNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const setupNotifications = async () => {
    try {
      const { registerForPushNotificationsAsync, savePushToken, addNotificationListener, addNotificationResponseListener } = require('../services/notificationService');
      
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        const user = useAuthStore.getState().user;
        if (user?.email) {
          await savePushToken(user.email, token);
        }
      }

      notificationListener.current = addNotificationListener(notification => {
        console.log('Notification received:', notification);
      });

      responseListener.current = addNotificationResponseListener(response => {
        const data = response.notification.request.content.data;
        if (data?.order_id || data?.type?.includes('order')) {
          router.push('/(tabs)/orders');
        }
      });
    } catch (e) {
      // Notifications not available in Expo Go
      console.log('Notifications not available');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/index" />
        <Stack.Screen name="product-detail/index" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="games/index" />
        <Stack.Screen name="surprise-du-jour/index" />
      </Stack>
      <PopupModal />
    </View>
  );
}

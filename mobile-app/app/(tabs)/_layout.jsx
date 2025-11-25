import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TabBarIcon from '../../components/TabBarIcon';
import useCartStore from '../../stores/cartStore';
import useNotificationStore from '../../stores/notificationStore';

export default function TabLayout() {
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#C62828',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="restaurant" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="cart" color={color} size={size} badge={cartItemCount} />
          )
        }}
      />
      <Tabs.Screen
        name="loyalty"
        options={{
          title: 'Fidélité',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="star" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} badge={unreadCount} />
          )
        }}
      />
    </Tabs>
  );
}

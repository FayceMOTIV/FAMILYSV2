import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import useAuthStore from '../../stores/authStore';
import useLoyaltyStore from '../../stores/loyaltyStore';
import useOrderStore from '../../stores/orderStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { balance, loyaltyPercentage, fetchBalance } = useLoyaltyStore();
  const { orders, fetchMyOrders } = useOrderStore();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBalance(user.id || user.email);
      fetchMyOrders();
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            console.log('👋 User logged out');
          }
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={styles.title}>Mon Profil</Text>
            <Text style={styles.subtitle}>Connectez-vous pour accéder à votre compte</Text>
          </View>
          
          <Button
            title="Se connecter"
            onPress={() => router.push('/auth/login')}
            fullWidth
          />

          <Button
            title="Créer un compte"
            onPress={() => router.push('/auth/signup')}
            variant="outline"
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.white} />
          </View>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Loyalty Card */}
        <Pressable 
          style={styles.loyaltyCard}
          onPress={() => router.push('/(tabs)/loyalty')}
        >
          <View style={styles.loyaltyHeader}>
            <View>
              <Text style={styles.loyaltyLabel}>Solde Fidélité</Text>
              <Text style={styles.loyaltyBalance}>{balance.toFixed(2)} €</Text>
            </View>
            <Badge text={`${loyaltyPercentage}% cashback`} variant="cashback" />
          </View>
          <View style={styles.loyaltyFooter}>
            <Text style={styles.loyaltyFooterText}>Voir l'historique</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.white} />
          </View>
        </Pressable>

        {/* Orders History */}
        {orders.length > 0 && (
          <View style={styles.ordersSection}>
            <Text style={styles.ordersTitle}>Mes dernières commandes</Text>
            {orders.slice(0, 3).map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>#{order.id}</Text>
                  <Badge 
                    text={order.status} 
                    variant={
                      order.status === 'delivered' ? 'success' : 
                      order.status === 'cancelled' ? 'error' : 'warning'
                    }
                    size="small"
                  />
                </View>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.orderTotal}>{order.total?.toFixed(2) || '0.00'}€</Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem}>
            <Ionicons name="receipt" size={24} color={Colors.gray700} />
            <Text style={styles.menuItemText}>Toutes mes commandes</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Ionicons name="heart" size={24} color={Colors.gray700} />
            <Text style={styles.menuItemText}>Favoris</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Ionicons name="location" size={24} color={Colors.gray700} />
            <Text style={styles.menuItemText}>Adresses</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Ionicons name="settings" size={24} color={Colors.gray700} />
            <Text style={styles.menuItemText}>Paramètres</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </Pressable>
        </View>

        {/* Logout */}
        <Button
          title="Déconnexion"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          icon={<Ionicons name="log-out" size={20} color={Colors.primary} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  userName: {
    ...Typography.h2,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.gray600,
  },
  loyaltyCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  loyaltyLabel: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  loyaltyBalance: {
    ...Typography.h1,
    color: Colors.white,
    fontWeight: 'bold',
  },
  loyaltyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loyaltyFooterText: {
    ...Typography.body,
    color: Colors.white,
    opacity: 0.9,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  menuItemText: {
    ...Typography.body,
    color: Colors.gray900,
    flex: 1,
    marginLeft: Spacing.md,
  },
});

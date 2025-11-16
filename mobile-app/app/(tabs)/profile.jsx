import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import useAuthStore from '../../stores/authStore';
import useLoyaltyStore from '../../stores/loyaltyStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { balance, loyaltyPercentage } = useLoyaltyStore();

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

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem}>
            <Ionicons name="receipt" size={24} color={Colors.gray700} />
            <Text style={styles.menuItemText}>Mes commandes</Text>
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
    backgroundColor: '#FFFFFF'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#C62828',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C62828'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonTextSecondary: {
    color: '#C62828'
  },
  placeholder: {
    marginTop: 24,
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4
  }
});

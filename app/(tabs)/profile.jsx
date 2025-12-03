import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    cashbackBalance: 0,
    rewardsCount: 0,
  });
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    if (user) {
      setStats({
        totalOrders: user?.total_orders || 0,
        totalSpent: user?.total_spent || 0,
        loyaltyPoints: user?.loyalty_points || 0,
        cashbackBalance: user?.cashback_balance || 0,
        rewardsCount: user?.rewards_count || 0,
      });
    }
  }, [user]);

  // Ne rien afficher si non connecté (pendant la redirection)
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirection...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userPhone = user?.phone || 'Non renseigné';
  const userCity = user?.city || 'Non renseignée';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName[0].toUpperCase()}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>⭐</Text>
            </View>
          </Animated.View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

          <View style={styles.vipBadge}>
            <Text style={styles.vipBadgeText}>👑 Membre VIP</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🍽️</Text>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💶</Text>
            <Text style={styles.statValue}>{stats.totalSpent.toFixed(0)}€</Text>
            <Text style={styles.statLabel}>Dépensés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💳</Text>
            <Text style={styles.statValue}>{stats.loyaltyPoints.toFixed(2)}€</Text>
            <Text style={styles.statLabel}>Carte de fidélité</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎁</Text>
            <Text style={styles.statValue}>{stats.rewardsCount}</Text>
            <Text style={styles.statLabel}>Récompenses</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Mes Informations</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✉️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userEmail}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📱</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{userPhone}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ville</Text>
                <Text style={styles.infoValue}>{userCity}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions Rapides</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Text style={styles.actionIcon}>🍽️</Text>
            <Text style={styles.actionLabel}>Mes Commandes</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/favorites')}
          >
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionLabel}>Mes Favoris</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/surprise-du-jour/rewards')}
          >
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionLabel}>Mes Récompenses</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Préférences</Text>
          
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceIcon}>🔔</Text>
              <Text style={styles.preferenceTitle}>Notifications</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Notifications push</Text>
              <Switch
                value={preferences.pushNotifications}
                onValueChange={() => togglePreference('pushNotifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={preferences.pushNotifications ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Mises à jour commandes</Text>
              <Switch
                value={preferences.orderUpdates}
                onValueChange={() => togglePreference('orderUpdates')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={preferences.orderUpdates ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Offres promotionnelles</Text>
              <Switch
                value={preferences.promotions}
                onValueChange={() => togglePreference('promotions')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={preferences.promotions ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceIcon}>📧</Text>
              <Text style={styles.preferenceTitle}>Communications</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Email</Text>
              <Switch
                value={preferences.emailNotifications}
                onValueChange={() => togglePreference('emailNotifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={preferences.emailNotifications ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>SMS</Text>
              <Switch
                value={preferences.smsNotifications}
                onValueChange={() => togglePreference('smsNotifications')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={preferences.smsNotifications ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Newsletter</Text>
              <Switch
                value={preferences.newsletter}
                onValueChange={() => togglePreference('newsletter')}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={preferences.newsletter ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/about')}
          >
            <Text style={styles.actionIcon}>ℹ️</Text>
            <Text style={styles.actionLabel}>À propos</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  header: { backgroundColor: '#4F46E5', paddingTop: 60, paddingBottom: 40, position: 'relative', overflow: 'hidden' },
  backButton: { position: 'absolute', top: 60, left: 16, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  backButtonText: { fontSize: 20, color: '#4F46E5', fontWeight: 'bold' },
  headerContent: { alignItems: 'center', zIndex: 1 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.3)' },
  avatarText: { fontSize: 42, fontWeight: 'bold', color: '#4F46E5' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FCD34D', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#4F46E5' },
  avatarBadgeText: { fontSize: 16 },
  userName: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  userEmail: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 12 },
  vipBadge: { backgroundColor: 'rgba(252, 211, 77, 0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FCD34D' },
  vipBadgeText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 24, gap: 12, marginBottom: 16 },
  statCard: { width: (width - 44) / 2, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statEmoji: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoIcon: { fontSize: 24, marginRight: 16, width: 32, textAlign: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  infoValue: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
  infoDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  actionIcon: { fontSize: 24, marginRight: 16, width: 32, textAlign: 'center' },
  actionLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  actionArrow: { fontSize: 20, color: '#9CA3AF' },
  preferenceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  preferenceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  preferenceIcon: { fontSize: 24, marginRight: 12 },
  preferenceTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  preferenceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  preferenceLabel: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', borderRadius: 16, padding: 18, marginHorizontal: 16, marginBottom: 16, borderWidth: 2, borderColor: '#FECACA' },
  logoutIcon: { fontSize: 24, marginRight: 12 },
  logoutText: { fontSize: 18, fontWeight: 'bold', color: '#DC2626' },
  bottomSpacer: { height: 40 },
});

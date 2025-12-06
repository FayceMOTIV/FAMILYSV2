import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const { width, height } = Dimensions.get('window');

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#F59E0B' },
  confirmed: { label: 'Confirmée', color: '#3B82F6' },
  in_preparation: { label: 'En préparation', color: '#8B5CF6' },
  ready: { label: 'Prête', color: '#10B981' },
  out_for_delivery: { label: 'En livraison', color: '#06B6D4' },
  completed: { label: 'Terminée', color: '#22C55E' },
  cancelled: { label: 'Annulée', color: '#EF4444' }
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadOrders();
      
      // Polling automatique toutes les 30 secondes pour les commandes en cours
      const pollInterval = setInterval(() => {
        // Vérifier si on a des commandes en cours
        const hasActiveOrders = orders.some(o => 
          ['pending', 'confirmed', 'in_preparation', 'ready', 'out_for_delivery'].includes(o.status)
        );
        
        if (hasActiveOrders) {
          loadOrders(true); // true = silent (pas de loading indicator)
        }
      }, 30000); // 30 secondes
      
      return () => clearInterval(pollInterval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, orders.length]);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders/customer/${user.email}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      if (!silent) Alert.alert('Erreur', 'Impossible de charger vos commandes');
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatPrice = (price) => {
    return `${parseFloat(price).toFixed(2)} €`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { label: status, color: '#6B7280' };
  };

  const renderLoginPrompt = () => (
    <View style={styles.container}>
      <View style={styles.loginHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.Text style={[styles.burgerIcon, { transform: [{ translateY: floatAnim }] }]}>🍔</Animated.Text>
        </View>
        <Text style={styles.oopsTitle}>Oups ! 👀</Text>
        <Text style={styles.oopsSubtitle}>
          Impossible de trouver tes commandes...{'\n'}On dirait que tu n'es pas connecté !
        </Text>
        <View style={styles.funnyBoxLogin}>
          <Text style={styles.funnyEmoji}>🤔</Text>
          <Text style={styles.funnyTextLogin}>Tes burgers se cachent peut-être{'\n'}derrière un mot de passe ? 😏</Text>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)')}>
          <Text style={styles.loginEmoji}>🔐</Text>
          <Text style={styles.loginButtonText}>Me connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupLink} onPress={() => router.push('/(auth)')}>
          <Text style={styles.signupText}>
            Pas encore de compte ? <Text style={styles.signupBold}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.infoBadge}>
          <Text style={styles.infoBadgeEmoji}>💡</Text>
          <Text style={styles.infoBadgeText}>Une fois connecté, tu pourras revoir{'\n'}toutes tes commandes passées !</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.emptyHeaderTitle}>Mes Commandes</Text>
      </View>
      <ScrollView contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pizzaContainer}>
          <Animated.Text style={[styles.pizzaIcon, { transform: [{ translateY: floatAnim }] }]}>🍕</Animated.Text>
          <Text style={styles.sparkles}>✨</Text>
        </View>
        <Text style={styles.emptyTitle}>C'est le calme plat ! 🏖️</Text>
        <Text style={styles.emptySubtitle}>Tu n'as pas encore passé de commande.{'\n'}Qu'est-ce qu'on attend ? 😋</Text>
        <View style={styles.funnyBox}>
          <Text style={styles.funnyEmoji}>🤷</Text>
          <Text style={styles.funnyText}>Ton historique est plus vide{'\n'}que mon frigo le dimanche ! 😅</Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={() => router.push('/order')}>
          <Text style={styles.orderButtonEmoji}>🛒</Text>
          <Text style={styles.orderButtonText}>Passer ma 1ère commande</Text>
        </TouchableOpacity>
        <View style={styles.advantagesList}>
          <View style={styles.advantageItem}>
            <Text style={styles.advantageEmoji}>⚡</Text>
            <Text style={styles.advantageText}>Commande rapide et facile</Text>
          </View>
          <View style={styles.advantageItem}>
            <Text style={styles.advantageEmoji}>🎁</Text>
            <Text style={styles.advantageText}>Gagne des points fidélité</Text>
          </View>
          <View style={styles.advantageItem}>
            <Text style={styles.advantageEmoji}>📍</Text>
            <Text style={styles.advantageText}>Livraison ou à emporter</Text>
          </View>
          <View style={styles.advantageItem}>
            <Text style={styles.advantageEmoji}>💳</Text>
            <Text style={styles.advantageText}>Paiement 100% sécurisé</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderOrder = (order) => {
    const statusConfig = getStatusConfig(order.status);
    const hasActiveStatus = ['pending', 'confirmed', 'in_preparation', 'ready', 'out_for_delivery'].includes(order.status);
    const freeItems = order.items?.filter(item => item.price === 0 || item.fromReward === true) || [];
    
    return (
      <View key={order.order_id || order.id} style={[styles.orderCard, hasActiveStatus && styles.orderCardActive]}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>#{order.order_number || (order.order_id || order.id)?.slice(0, 8)}</Text>
            <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>
        
        {/* Indicateur de mise à jour en temps réel */}
        {hasActiveStatus && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Mise à jour en temps réel</Text>
          </View>
        )}
        
        <View style={styles.itemsSection}>
          {order.items?.slice(0, 2).map((item, index) => {
            const isFree = item.price === 0 || item.fromReward === true;
            return (
              <Text key={index} style={[styles.itemText, isFree && styles.itemTextFree]}>
                {isFree ? '🎁 ' : '• '}{item.name} x{item.quantity}
                {isFree && ' (OFFERT)'}
              </Text>
            );
          })}
          {order.items?.length > 2 && (
            <Text style={styles.moreItems}>+{order.items.length - 2} autre(s) article(s)</Text>
          )}
        </View>
        
        {/* Promos appliquées */}
        {order.promotions_applied && order.promotions_applied.length > 0 && (
          <View style={styles.promosSection}>
            {order.promotions_applied.map((promo, idx) => (
              <View key={idx} style={styles.promoBadge}>
                <Text style={styles.promoText}>
                  🏷️ {promo.promo_name || promo.name} (-{(promo.discount_amount || promo.discount || 0).toFixed(2)}€)
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Économies totales */}
        {(order.promotions_discount > 0 || order.cashback_used > 0) && (
          <View style={styles.savingsSection}>
            {order.promotions_discount > 0 && (
              <Text style={styles.savingsText}>💰 Économies promos: -{order.promotions_discount.toFixed(2)}€</Text>
            )}
            {order.cashback_used > 0 && (
              <Text style={styles.savingsText}>💜 Fidélité utilisée: -{order.cashback_used.toFixed(2)}€</Text>
            )}
          </View>
        )}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total payé</Text>
          <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
        </View>
        
        {order.cashback_earned > 0 && (
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackText}>⭐ +{formatPrice(order.cashback_earned)} de cashback gagné</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement de vos commandes...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return renderLoginPrompt();
  }

  if (orders.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>📋</Text>
          <View>
            <Text style={styles.headerTitle}>Mes Commandes</Text>
            <Text style={styles.headerSubtitle}>{orders.length} commande(s)</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.ordersContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />}>
        {orders.map(renderOrder)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6B7280', marginTop: 16, fontSize: 14 },
  loginHeader: { backgroundColor: '#F8F9FA', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  loginContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 60 },
  iconContainer: { position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  pulseCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#FF6B6B', opacity: 0.2 },
  burgerIcon: { fontSize: 80 },
  oopsTitle: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  oopsSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  funnyBoxLogin: { width: '100%', backgroundColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#F59E0B', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 32 },
  funnyEmoji: { fontSize: 32, marginBottom: 12 },
  funnyTextLogin: { fontSize: 15, color: '#92400E', fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  loginButton: { flexDirection: 'row', backgroundColor: '#4F46E5', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  loginEmoji: { fontSize: 20, marginRight: 12 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  signupLink: { paddingVertical: 12, marginBottom: 32 },
  signupText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  signupBold: { color: '#4F46E5', fontWeight: 'bold' },
  infoBadge: { width: '100%', backgroundColor: '#DBEAFE', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  infoBadgeEmoji: { fontSize: 20, marginRight: 12 },
  infoBadgeText: { flex: 1, fontSize: 13, color: '#1E40AF', fontWeight: '600', lineHeight: 20 },
  emptyContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  emptyHeader: { backgroundColor: '#C62828', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
  emptyHeaderTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  emptyContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 40, paddingBottom: 40 },
  pizzaContainer: { position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  pizzaIcon: { fontSize: 100 },
  sparkles: { position: 'absolute', top: 0, right: 10, fontSize: 30 },
  emptyTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  funnyBox: { width: '100%', backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#FCD34D', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 32 },
  funnyText: { fontSize: 15, color: '#92400E', fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  orderButton: { flexDirection: 'row', width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 40, backgroundColor: '#FF6B6B', shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  orderButtonEmoji: { fontSize: 24, marginRight: 12 },
  orderButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  advantagesList: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 16 },
  advantageItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  advantageEmoji: { fontSize: 24 },
  advantageText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
  header: { backgroundColor: '#C62828', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerEmoji: { fontSize: 40 },
  backBtn: { position: 'absolute', top: 50, left: 16, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, zIndex: 10 },
  backBtnText: { color: '#C62828', fontWeight: '600', fontSize: 14 },
  backBtn: { position: 'absolute', top: 50, left: 16, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, zIndex: 10 },
  backBtnText: { color: '#C62828', fontWeight: '600', fontSize: 14 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB', marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  backButtonText: { fontSize: 16, color: '#4F46E5', fontWeight: '600', marginLeft: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, marginTop: 4 },
  scrollView: { flex: 1 },
  ordersContent: { padding: 16 },
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  orderCardActive: { borderWidth: 2, borderColor: '#10B981' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  orderId: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ECFDF5', borderRadius: 20, alignSelf: 'flex-start' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  liveText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  itemsSection: { marginBottom: 16 },
  itemText: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  itemTextFree: { color: '#10B981', fontWeight: '600' },
  moreItems: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 },
  promosSection: { marginBottom: 12 },
  promoBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 4, alignSelf: 'flex-start' },
  promoText: { fontSize: 12, color: '#92400E', fontWeight: '600' },
  savingsSection: { backgroundColor: '#F0FDF4', borderRadius: 8, padding: 10, marginBottom: 12 },
  savingsText: { fontSize: 12, color: '#166534', fontWeight: '500', marginBottom: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#6B7280' },
  totalAmount: { fontSize: 22, fontWeight: 'bold', color: '#C62828' },
  cashbackBadge: { marginTop: 12, backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  cashbackText: { fontSize: 12, color: '#059669', fontWeight: '600' },
});
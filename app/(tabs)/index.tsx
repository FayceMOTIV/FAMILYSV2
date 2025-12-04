import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { API_BASE_URL } from '../../constants/config';
import axios from 'axios';

const { width, height } = Dimensions.get('window');


export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const favorites = useFavoritesStore((state) => state.favorites);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [recentWinners, setRecentWinners] = useState([]);
  const [surpriseStatus, setSurpriseStatus] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);

  const userData = { firstName: user?.name?.split(' ')[0] || "Gourmand", loyaltyBalance: user?.loyalty_points || 0, loyaltyPercentage: 5 };

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    ]));
    pulse.start();
    const bounce = Animated.loop(Animated.sequence([
      Animated.timing(bounceAnim, { toValue: -10, duration: 800, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]));
    bounce.start();
    loadData();
    return () => { pulse.stop(); bounce.stop(); };
  }, []);

  useEffect(() => {
    if (surpriseStatus && !surpriseStatus.can_play && surpriseStatus.next_play_time) {
      const interval = setInterval(() => {
        const now = new Date();
        const next = new Date(surpriseStatus.next_play_time);
        const diff = next - now;
        if (diff <= 0) { setCountdown('Disponible !'); setSurpriseStatus({ ...surpriseStatus, can_play: true }); }
        else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [surpriseStatus]);

  const loadData = async () => {
    try { const r = await axios.get(`${API_BASE_URL}/admin/surprise-du-jour/recent-winners?limit=5`); setRecentWinners(r.data || []); } catch (e) {}
    if (user?.id) { try { const r = await axios.get(`${API_BASE_URL}/surprise-du-jour/status?user_id=${user.id}`); setSurpriseStatus(r.data); } catch (e) {} }
    try {
      const r = await axios.get(`${API_BASE_URL}/products`);
      const all = r.data.products || r.data || [];
      setPromoProducts(all.filter(p => p.active_promotions && p.active_promotions.length > 0).slice(0, 5));
    } catch (e) {}
    if (favorites && favorites.length > 0) {
      try {
        const r = await axios.get(`${API_BASE_URL}/products`);
        const all = r.data.products || r.data || [];
        setFavoriteProducts(all.filter(p => favorites.includes(p.id)).slice(0, 4));
      } catch (e) {}
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = userData.firstName;
    if (hour < 12) return `Bonjour ${firstName} ! ☀️`;
    if (hour < 18) return `Hey ${firstName} ! 🍔`;
    return `Bonsoir ${firstName} ! 🌙`;
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>Prêt(e) à te régaler ?</Text>
        </View>

        <Animated.View style={[styles.loyaltyCard, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.loyaltyDecoCircle1} />
          <View style={styles.loyaltyDecoCircle2} />
          <View style={styles.loyaltyContent}>
            <View style={styles.loyaltyLeft}>
              <View style={styles.loyaltyIconContainer}><Text style={styles.loyaltyIcon}>💎</Text></View>
              <Text style={styles.loyaltyLabel}>Ma Carte Fidélité</Text>
            </View>
            <View style={styles.loyaltyRight}>
              <Text style={styles.loyaltyAmount}>{userData.loyaltyBalance.toFixed(2)}€</Text>
              <Text style={styles.loyaltySubtext}>+{userData.loyaltyPercentage}% à chaque achat</Text>
            </View>
          </View>
          <View style={styles.loyaltyStars}><Text style={styles.starEmoji}>⭐</Text><Text style={styles.starEmoji}>⭐</Text><Text style={styles.starEmoji}>⭐</Text></View>
        </Animated.View>

        <TouchableOpacity style={styles.gameCard} onPress={() => router.push('/surprise-du-jour')}>
          <View style={styles.gameBackground}><Text style={styles.gameBgEmoji}>🎰</Text></View>
          <Animated.View style={[styles.gameIconContainer, { transform: [{ translateY: bounceAnim }] }]}><Text style={styles.gameMainIcon}>🎁</Text></Animated.View>
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>🎮 Jouer & Gagner 🎯</Text>
            <Text style={styles.gameDesc}>Tente ta chance et gagne des récompenses !</Text>
            {surpriseStatus && !surpriseStatus.can_play && countdown ? (
              <View style={styles.countdownContainer}><Text style={styles.countdownLabel}>⏰ Prochain jeu dans</Text><Text style={styles.countdownValue}>{countdown}</Text></View>
            ) : (<View style={styles.playNowBadge}><Text style={styles.playNowText}>🚀 JOUER MAINTENANT</Text></View>)}
          </View>
          <View style={styles.gameDecorations}><Text style={styles.decoEmoji}>🎲</Text><Text style={styles.decoEmoji}>🎪</Text><Text style={styles.decoEmoji}>✨</Text></View>
        </TouchableOpacity>

        {favoriteProducts.length > 0 && (
          <TouchableOpacity style={styles.favoritesButton} onPress={() => router.push('/favorites')}>
            <View style={styles.favoritesButtonContent}>
              <View style={styles.favoritesButtonLeft}>
                <View style={styles.favoritesIconContainer}><Text style={styles.favoritesIcon}>❤️</Text></View>
                <View>
                  <Text style={styles.favoritesButtonTitle}>Mes Favoris</Text>
                  <Text style={styles.favoritesButtonSubtitle}>{favoriteProducts.length} produit{favoriteProducts.length > 1 ? 's' : ''} sauvegardé{favoriteProducts.length > 1 ? 's' : ''}</Text>
                </View>
              </View>
              <View style={styles.favoritesArrow}><Text style={styles.arrowText}>→</Text></View>
            </View>
            <View style={styles.favoritesPreview}>
              {favoriteProducts.slice(0, 3).map((product, index) => (
                <View key={product.id} style={[styles.miniProductCircle, { marginLeft: index > 0 ? -10 : 0, zIndex: 3 - index }]}>
                  {product.image_url ? <Image source={{ uri: product.image_url }} style={styles.miniProductImage} /> : <Text style={styles.miniProductEmoji}>{product.emoji || '🍔'}</Text>}
                </View>
              ))}
              {favoriteProducts.length > 3 && <View style={[styles.miniProductCircle, styles.moreCircle, { marginLeft: -10 }]}><Text style={styles.moreText}>+{favoriteProducts.length - 3}</Text></View>}
            </View>
          </TouchableOpacity>
        )}

        {promoProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.promoHeader}>
              <View style={styles.promoTitleContainer}><Text style={styles.promoFireEmoji}>🔥</Text><Text style={styles.promoSectionTitle}>PROMOS DU MOMENT</Text><Text style={styles.promoFireEmoji}>🔥</Text></View>
              <TouchableOpacity onPress={() => router.push('/order')}><Text style={styles.seeAllPromo}>Voir tout →</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promosScroll}>
              {promoProducts.map((product) => {
                const promo = product.active_promotions?.[0];
                const originalPrice = product.base_price || 0;
                const promoPrice = product.promo_price || originalPrice;
                const discount = promo?.discount_percent || Math.round((1 - promoPrice / originalPrice) * 100);
                return (
                  <TouchableOpacity key={product.id} style={styles.promoCard} onPress={() => router.push(`/product/${product.id}`)}>
                    <View style={styles.promoTagContainer}><Text style={styles.promoTag}>-{discount}%</Text></View>
                    {product.image_url ? <Image source={{ uri: product.image_url }} style={styles.promoImage} resizeMode="cover" /> : <View style={styles.promoImagePlaceholder}><Text style={styles.promoEmoji}>{product.emoji || '🍔'}</Text></View>}
                    <Text style={styles.promoName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.promoPriceRow}><Text style={styles.promoPrice}>{promoPrice.toFixed(2)}€</Text><Text style={styles.promoOldPrice}>{originalPrice.toFixed(2)}€</Text></View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {recentWinners.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Derniers Gagnants</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winnersScroll}>
              {recentWinners.map((winner, index) => (
                <View key={index} style={styles.winnerCard}>
                  <View style={styles.winnerHeader}>
                    <View style={styles.winnerAvatar}><Text style={styles.winnerInitial}>{winner.name ? winner.name[0].toUpperCase() : '?'}</Text></View>
                    <View><Text style={styles.winnerName}>{winner.name || 'Joueur'}</Text><Text style={styles.winnerTime}>{winner.time}</Text></View>
                  </View>
                  <Text style={styles.winnerReward}>✨ {winner.reward}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions Rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/order')}><Text style={styles.actionEmoji}>🍽️</Text><Text style={styles.actionText}>Commander</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/orders')}><Text style={styles.actionEmoji}>📜</Text><Text style={styles.actionText}>Historique</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/about')}><Text style={styles.actionEmoji}>ℹ️</Text><Text style={styles.actionText}>Le Resto</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/profile')}><Text style={styles.actionEmoji}>👤</Text><Text style={styles.actionText}>Mon Profil</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFF', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logo: { width: 180, height: 60, marginBottom: 16 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  loyaltyCard: { margin: 16, padding: 20, backgroundColor: '#4F46E5', borderRadius: 24, overflow: 'hidden', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  loyaltyDecoCircle1: { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  loyaltyDecoCircle2: { position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  loyaltyContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
  loyaltyLeft: { flexDirection: 'row', alignItems: 'center' },
  loyaltyIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  loyaltyIcon: { fontSize: 28 },
  loyaltyLabel: { fontSize: 14, color: '#E0E7FF', fontWeight: '600' },
  loyaltyRight: { alignItems: 'flex-end' },
  loyaltyAmount: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  loyaltySubtext: { fontSize: 12, color: '#C7D2FE' },
  loyaltyStars: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 },
  starEmoji: { fontSize: 16, opacity: 0.7 },
  gameCard: { margin: 16, marginTop: 0, padding: 20, backgroundColor: '#10B981', borderRadius: 24, overflow: 'hidden', shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  gameBackground: { position: 'absolute', top: -20, right: -20, opacity: 0.15 },
  gameBgEmoji: { fontSize: 120 },
  gameIconContainer: { position: 'absolute', top: 15, right: 20 },
  gameMainIcon: { fontSize: 50 },
  gameContent: { zIndex: 1 },
  gameTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  gameDesc: { fontSize: 14, color: '#D1FAE5', marginBottom: 12 },
  countdownContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, alignItems: 'center' },
  countdownLabel: { fontSize: 12, color: '#D1FAE5', marginBottom: 4 },
  countdownValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  playNowBadge: { backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' },
  playNowText: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  gameDecorations: { position: 'absolute', bottom: 10, right: 15, flexDirection: 'row', gap: 8 },
  decoEmoji: { fontSize: 20, opacity: 0.6 },
  favoritesButton: { margin: 16, marginTop: 0, padding: 16, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 2, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  favoritesButtonContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  favoritesButtonLeft: { flexDirection: 'row', alignItems: 'center' },
  favoritesIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  favoritesIcon: { fontSize: 24 },
  favoritesButtonTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  favoritesButtonSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  favoritesArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  arrowText: { fontSize: 18, color: '#EF4444', fontWeight: 'bold' },
  favoritesPreview: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#FEE2E2' },
  miniProductCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  miniProductImage: { width: 40, height: 40, borderRadius: 20 },
  miniProductEmoji: { fontSize: 18 },
  moreCircle: { backgroundColor: '#EF4444' },
  moreText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', paddingHorizontal: 16, marginBottom: 12 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  promoTitleContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  promoFireEmoji: { fontSize: 18 },
  promoSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginHorizontal: 8 },
  seeAllPromo: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  promosScroll: { paddingHorizontal: 16, gap: 12 },
  promoCard: { width: 160, backgroundColor: '#FFF', borderRadius: 16, padding: 12, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#FEE2E2' },
  promoTagContainer: { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, zIndex: 10 },
  promoTag: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  promoImage: { width: '100%', height: 90, borderRadius: 12, marginBottom: 8 },
  promoImagePlaceholder: { width: '100%', height: 90, borderRadius: 12, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  promoEmoji: { fontSize: 40 },
  promoName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  promoPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoPrice: { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
  promoOldPrice: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  winnersScroll: { paddingHorizontal: 16, gap: 12 },
  winnerCard: { width: 200, backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#F59E0B', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  winnerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  winnerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  winnerInitial: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B' },
  winnerName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  winnerTime: { fontSize: 12, color: '#6B7280' },
  winnerReward: { fontSize: 14, color: '#059669', fontWeight: '600' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  actionButton: { width: (width - 44) / 2, backgroundColor: '#FFF', paddingVertical: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  actionEmoji: { fontSize: 36, marginBottom: 8 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
});

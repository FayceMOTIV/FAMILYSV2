import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { promotionsService } from '../../services/promotions';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getSubtotal,
    getTotal, 
    getProductPromoSavings,
    getAppliedPromotions,
    getSuggestions,
    recalculatePromotions,
    isCalculating
  } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoCodeDiscount, setPromoCodeDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [useCashback, setUseCashback] = useState(false);
  const [consumptionMode, setConsumptionMode] = useState('takeaway');
  const [paymentMethod, setPaymentMethod] = useState('on_site');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  
  // Nouveaux états pour settings dynamiques
  const [appConfig, setAppConfig] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const subtotal = getSubtotal() || 0;
  const productPromoSavings = getProductPromoSavings() || 0;
  const appliedPromotions = getAppliedPromotions() || [];
  const suggestions = getSuggestions() || [];
  const cartPromoDiscount = appliedPromotions.reduce((sum, p) => sum + (p.discount || 0), 0);
  const cashbackUsed = useCashback ? Math.min(cashbackBalance, subtotal - cartPromoDiscount - promoCodeDiscount) : 0;
  const total = Math.max(0, subtotal - cartPromoDiscount - promoCodeDiscount - cashbackUsed);

  const rewardItems = items.filter(item => item.fromReward === true || item.price === 0);
  const hasRewards = rewardItems.length > 0;

  useEffect(() => {
    loadAppConfig();
    if (isAuthenticated && user?.email) {
      loadCashbackBalance();
      recalculatePromotions(user.email);
    } else {
      recalculatePromotions();
    }
    const today = new Date();
    setPickupDate(today.toISOString().split('T')[0]);
  }, [isAuthenticated, user, items.length]);

  // Charger les créneaux quand la date change
  useEffect(() => {
    if (pickupDate) {
      loadTimeSlots(pickupDate);
    }
  }, [pickupDate]);

  const loadAppConfig = async () => {
    try {
      setLoadingConfig(true);
      const response = await axios.get(`${API_BASE_URL}/settings/app-config`, { timeout: 5000 });
      setAppConfig(response.data);
      // Définir le mode par défaut selon ce qui est activé
      if (response.data.enable_takeaway) {
        setConsumptionMode('takeaway');
      } else if (response.data.enable_onsite) {
        setConsumptionMode('on_site');
      } else if (response.data.enable_delivery) {
        setConsumptionMode('delivery');
      }
    } catch (error) {
      console.error('Error loading app config:', error);
      // Valeurs par défaut
      setAppConfig({
        enable_delivery: false,
        enable_takeaway: true,
        enable_onsite: true,
        enable_reservations: false,
        time_slot_interval: 15
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadTimeSlots = async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/time-slots?date=${date}`, { timeout: 5000 });
      setTimeSlots(response.data.slots || []);
      // Sélectionner le premier créneau disponible
      if (response.data.slots && response.data.slots.length > 0 && !pickupTime) {
        setPickupTime(response.data.slots[0]);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      // Créneaux par défaut
      setTimeSlots(['12:00', '12:30', '13:00', '19:00', '19:30', '20:00']);
      if (!pickupTime) setPickupTime('12:00');
    }
  };

  const loadCashbackBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cashback/balance/${user.email}`, { timeout: 5000 });
      setCashbackBalance(response.data.balance || 0);
    } catch (error) {
      setCashbackBalance(0);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code promo');
      return;
    }
    try {
      setLoading(true);
      const result = await promotionsService.validatePromoCode(promoCode, subtotal);
      if (result.valid) {
        setAppliedPromoCode(result.promo);
        setPromoCodeDiscount(result.discount_amount || 0);
        Alert.alert('✅ Code appliqué !', `Vous économisez ${(result.discount_amount || 0).toFixed(2)}€`);
        setPromoCode('');
      } else {
        Alert.alert('❌ Code invalide', result.error || 'Ce code promo n\'est pas valide');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider le code promo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (paymentMethod === 'card' || paymentMethod === 'apple_pay') {
      Alert.alert('🚧 Bientôt disponible', 'Le paiement en ligne sera disponible très prochainement !');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour passer commande', [
        { text: 'Se connecter', onPress: () => router.push('/(auth)') },
        { text: 'Annuler', style: 'cancel' }
      ]);
      return;
    }

    if (!pickupDate || !pickupTime) {
      Alert.alert('Erreur', 'Veuillez choisir une date et heure de retrait');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customer_email: user?.email,
        customer_name: user?.name || user?.email,
        customer_phone: user?.phone || '',
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity || 1,
          base_price: item.original_price || item.base_price || item.price,
          total_price: (item.price || 0) * (item.quantity || 1),
          options: item.options || [],
          from_reward: item.fromReward || false,
        })),
        subtotal: subtotal,
        vat_amount: subtotal * 0.1,
        promotions_applied: appliedPromotions,
        promo_code: appliedPromoCode?.promo_code || null,
        promo_code_discount: promoCodeDiscount,
        cart_promo_discount: cartPromoDiscount,
        total: total,
        use_cashback: useCashback,
        cashback_used: cashbackUsed,
        payment_method: paymentMethod,
        consumption_mode: consumptionMode,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        notes: orderNotes,
        status: 'new'
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      if (response.data) {
        clearCart();
        router.push({
          pathname: '/order-confirmation',
          params: { orderNumber: response.data.order_number, total: total.toFixed(2) }
        });
      }
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de créer la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Panier</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Panier vide</Text>
          <Text style={styles.emptySubtitle}>Ajoutez des produits pour commencer !</Text>
          <TouchableOpacity onPress={() => router.push('/order')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Découvrir le menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Modes dynamiques selon config backend
  const getAvailableModes = () => {
    const modes = [];
    if (appConfig?.enable_takeaway) {
      modes.push({ id: 'takeaway', label: 'À emporter', icon: '🥡' });
    }
    if (appConfig?.enable_onsite) {
      modes.push({ id: 'on_site', label: 'Sur place', icon: '🍽️' });
    }
    if (appConfig?.enable_delivery) {
      modes.push({ id: 'delivery', label: 'Livraison', icon: '🛵' });
    }
    // Fallback si aucun mode
    if (modes.length === 0) {
      modes.push({ id: 'takeaway', label: 'À emporter', icon: '🥡' });
      modes.push({ id: 'on_site', label: 'Sur place', icon: '🍽️' });
    }
    return modes;
  };

  const availableModes = getAvailableModes();

  const paymentMethods = [
    { id: 'card', label: 'Carte bancaire', icon: '💳', disabled: true },
    { id: 'apple_pay', label: 'Apple Pay', icon: 'apple', disabled: true },
    { id: 'on_site', label: 'Paiement sur place', icon: '🏪', disabled: false },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Panier</Text>
          <Text style={styles.headerSubtitle}>{items.length} article(s)</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Mes articles</Text>
          {items.map((item, index) => {
            const itemId = item.id || `item-${index}`;
            const isReward = item.fromReward === true || item.price === 0;
            const hasPromo = item.promo_badge || (item.promo_price && item.promo_price < item.base_price);
            
            return (
              <View key={`${itemId}-${index}`} style={styles.cartItem}>
                <View style={styles.itemImageContainer}>
                  <View style={styles.itemImagePlaceholder}>
                    {item.image_url && !isReward ? (
                      <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.itemImageEmoji}>{isReward ? '🎁' : (item.emoji || '🍔')}</Text>
                    )}
                  </View>
                  {/* Badge promo sur l'image */}
                  {hasPromo && !isReward && (
                    <View style={[styles.itemPromoBadge, { backgroundColor: item.promo_badge_color || '#EF4444' }]}>
                      <Text style={styles.itemPromoBadgeText}>{item.promo_badge || '🔥 PROMO'}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemNameRow}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {isReward && <View style={styles.rewardBadge}><Text style={styles.rewardBadgeText}>GRATUIT 🎁</Text></View>}
                  </View>
                  
                  {/* Afficher les options sélectionnées */}
                  {item.options && item.options.length > 0 && (
                    <View style={styles.itemOptionsContainer}>
                      {item.options.map((opt, optIndex) => (
                        <Text key={optIndex} style={styles.itemOptionText}>
                          • {typeof opt === 'string' ? opt : (opt.choiceName || opt.name || '')}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {/* Prix avec prix barré si promo */}
                  <View style={styles.itemPriceRow}>
                    <Text style={[styles.itemPrice, isReward && styles.itemPriceFree]}>
                      {isReward ? 'OFFERT !' : `${(item.price || 0).toFixed(2)}€`}
                    </Text>
                    {hasPromo && !isReward && item.base_price && item.base_price > item.price && (
                      <Text style={styles.itemOriginalPrice}>{item.base_price.toFixed(2)}€</Text>
                    )}
                  </View>
                  <View style={styles.itemActions}>
                    {isReward ? (
                      <View style={styles.rewardQuantityFixed}>
                        <Text style={styles.rewardQuantityText}>Qté: {item.quantity || 1}</Text>
                      </View>
                    ) : (
                      <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={() => updateQuantity(itemId, (item.quantity || 1) - 1)} style={styles.quantityButton}>
                          <Text style={styles.quantityButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity || 1}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(itemId, (item.quantity || 1) + 1)} style={styles.quantityButton}>
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => removeItem(itemId)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Promotions appliquées automatiquement */}
        {appliedPromotions.length > 0 && (
          <View style={styles.promosAppliedSection}>
            <Text style={styles.promosAppliedTitle}>🎉 Promotions appliquées</Text>
            {appliedPromotions.map((promo, idx) => (
              <View key={idx} style={styles.promoAppliedItem}>
                <View style={[styles.promoBadge, { backgroundColor: promo.badge_color || '#10B981' }]}>
                  <Text style={styles.promoBadgeText}>{promo.badge || '🏷️'}</Text>
                </View>
                <Text style={styles.promoAppliedName}>{promo.name}</Text>
                <Text style={styles.promoAppliedDiscount}>-{(promo.discount || 0).toFixed(2)}€</Text>
              </View>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>💡 Bonnes affaires</Text>
            {suggestions.map((suggestion, idx) => (
              <View key={idx} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Récompenses */}
        {hasRewards && (
          <View style={styles.rewardNotice}>
            <Text style={styles.rewardNoticeIcon}>🎉</Text>
            <Text style={styles.rewardNoticeText}>
              {rewardItems.length} récompense(s) gratuite(s) dans votre panier !
            </Text>
          </View>
        )}

        {/* Mode de retrait */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Mode de retrait</Text>
          <View style={styles.modesGrid}>
            {availableModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                onPress={() => setConsumptionMode(mode.id)}
                style={[styles.modeCard, consumptionMode === mode.id && styles.modeCardActive]}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <Text style={[styles.modeLabel, consumptionMode === mode.id && styles.modeLabelActive]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date/Heure avec créneaux dynamiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Date et heure</Text>
          <View style={styles.dateTimeRow}>
            <TextInput 
              style={[styles.input, styles.dateInput]} 
              placeholder="YYYY-MM-DD" 
              value={pickupDate} 
              onChangeText={setPickupDate} 
            />
          </View>
          {/* Créneaux horaires en grille */}
          <Text style={styles.timeSlotsLabel}>Choisissez un créneau :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotsContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setPickupTime(slot)}
                style={[styles.timeSlot, pickupTime === slot && styles.timeSlotActive]}
              >
                <Text style={[styles.timeSlotText, pickupTime === slot && styles.timeSlotTextActive]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Paiement</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => !method.disabled && setPaymentMethod(method.id)}
              style={[styles.paymentMethod, paymentMethod === method.id && styles.paymentMethodActive, method.disabled && styles.paymentMethodDisabled]}
            >
              {method.id === 'apple_pay' ? (
                <View style={styles.applePayIconContainer}>
                  <Ionicons name="logo-apple" size={24} color="#000" />
                  <Text style={styles.applePayLabel}>Pay</Text>
                </View>
              ) : (
                <Text style={styles.paymentIcon}>{method.icon}</Text>
              )}
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, paymentMethod === method.id && styles.paymentLabelActive, method.disabled && styles.paymentLabelDisabled]}>
                  {method.id === 'apple_pay' ? '' : method.label}
                </Text>
                {method.disabled && <Text style={styles.paymentSoonLabel}>Bientôt disponible</Text>}
              </View>
              {paymentMethod === method.id && !method.disabled && (
                <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Cashback */}
        {cashbackBalance > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Cashback</Text>
            <TouchableOpacity onPress={() => setUseCashback(!useCashback)} style={[styles.cashbackCard, useCashback && styles.cashbackCardActive]}>
              <View>
                <Text style={styles.cashbackTitle}>Utiliser mon cashback</Text>
                <Text style={styles.cashbackBalance}>Solde : {cashbackBalance.toFixed(2)}€</Text>
              </View>
              <View style={[styles.checkbox, useCashback && styles.checkboxActive]}>
                {useCashback && <Text style={styles.checkboxText}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Code promo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Code promo</Text>
          {appliedPromoCode ? (
            <View style={styles.promoCodeApplied}>
              <View>
                <Text style={styles.promoCodeAppliedTitle}>{appliedPromoCode.name}</Text>
                <Text style={styles.promoCodeAppliedDiscount}>-{promoCodeDiscount.toFixed(2)}€</Text>
              </View>
              <TouchableOpacity onPress={() => { setAppliedPromoCode(null); setPromoCodeDiscount(0); }}>
                <Text style={styles.promoRemove}>✕ Retirer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoInput}>
              <TextInput style={styles.promoField} placeholder="Entrez votre code" value={promoCode} onChangeText={setPromoCode} autoCapitalize="characters" />
              <TouchableOpacity onPress={handleApplyPromoCode} disabled={loading} style={styles.promoButton}>
                {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.promoButtonText}>Appliquer</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notes</Text>
          <TextInput style={styles.notesInput} placeholder="Allergies, préférences..." value={orderNotes} onChangeText={setOrderNotes} multiline numberOfLines={3} />
        </View>

        {/* Récapitulatif */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>💰 Récapitulatif</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)}€</Text>
          </View>

          {productPromoSavings > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelGreen}>🔥 Promos produits</Text>
              <Text style={styles.summaryValueGreen}>-{productPromoSavings.toFixed(2)}€</Text>
            </View>
          )}

          {appliedPromotions.map((promo, idx) => (
            <View key={idx} style={styles.summaryRow}>
              <Text style={styles.summaryLabelGreen}>{promo.badge || '🏷️'} {promo.name}</Text>
              <Text style={styles.summaryValueGreen}>-{(promo.discount || 0).toFixed(2)}€</Text>
            </View>
          ))}

          {promoCodeDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelGreen}>🏷️ Code promo</Text>
              <Text style={styles.summaryValueGreen}>-{promoCodeDiscount.toFixed(2)}€</Text>
            </View>
          )}

          {hasRewards && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelGreen}>🎁 Récompenses</Text>
              <Text style={styles.summaryValueGreen}>x{rewardItems.length} offert(s)</Text>
            </View>
          )}

          {cashbackUsed > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelPurple}>💜 Cashback</Text>
              <Text style={styles.summaryValuePurple}>-{cashbackUsed.toFixed(2)}€</Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryLabelTotal}>Total à payer</Text>
            <Text style={styles.summaryTotal}>{total.toFixed(2)}€</Text>
          </View>

          {(cartPromoDiscount + promoCodeDiscount + productPromoSavings) > 0 && (
            <View style={styles.totalSavings}>
              <Text style={styles.totalSavingsText}>🎉 Vous économisez {(cartPromoDiscount + promoCodeDiscount + productPromoSavings).toFixed(2)}€ !</Text>
            </View>
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleCreateOrder} disabled={loading || isCalculating} style={[styles.orderButton, (loading || isCalculating) && styles.orderButtonDisabled]}>
          {loading || isCalculating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.orderButtonText}>Commander • {total.toFixed(2)}€</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Vider le panier</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#C62828', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backButtonText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  content: { flex: 1 },
  section: { backgroundColor: '#FFF', marginTop: 12, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },

  // Cart items avec badge promo
  cartItem: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, marginBottom: 12 },
  itemImageContainer: { position: 'relative' },
  itemImagePlaceholder: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemImageEmoji: { fontSize: 36 },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemPromoBadge: { position: 'absolute', top: -4, left: -4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  itemPromoBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  itemInfo: { flex: 1 },
  itemNameRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, flexWrap: 'wrap' },
  itemName: { flex: 1, fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  itemOptionsContainer: { marginTop: 4, marginBottom: 4 },
  itemOptionText: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  rewardBadge: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rewardBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFF' },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  itemOriginalPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  itemPriceFree: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
  itemActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 8 },
  quantityButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { fontSize: 20, fontWeight: 'bold', color: '#4F46E5' },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginHorizontal: 12 },
  rewardQuantityFixed: { backgroundColor: '#D1FAE5', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  rewardQuantityText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  deleteButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { fontSize: 18 },

  // Promos applied section
  promosAppliedSection: { backgroundColor: '#ECFDF5', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#10B981' },
  promosAppliedTitle: { fontSize: 16, fontWeight: 'bold', color: '#059669', marginBottom: 12 },
  promoAppliedItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  promoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  promoBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  promoAppliedName: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  promoAppliedDiscount: { fontSize: 14, fontWeight: 'bold', color: '#059669' },

  // Suggestions
  suggestionsSection: { backgroundColor: '#FEF3C7', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#F59E0B' },
  suggestionsTitle: { fontSize: 16, fontWeight: 'bold', color: '#B45309', marginBottom: 10 },
  suggestionItem: { marginBottom: 6 },
  suggestionText: { fontSize: 14, color: '#92400E' },

  // Reward notice
  rewardNotice: { backgroundColor: '#ECFDF5', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#10B981' },
  rewardNoticeIcon: { fontSize: 24, marginRight: 12 },
  rewardNoticeText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#059669' },

  // Modes
  modesGrid: { flexDirection: 'row', gap: 12 },
  modeCard: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
  modeCardActive: { backgroundColor: '#FEF2F2', borderColor: '#C62828' },
  modeIcon: { fontSize: 28, marginBottom: 8 },
  modeLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  modeLabelActive: { color: '#C62828' },

  // Date/time avec créneaux
  dateTimeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  dateInput: { flex: 1 },
  timeSlotsLabel: { fontSize: 14, color: '#6B7280', marginBottom: 10 },
  timeSlotsContainer: { flexDirection: 'row' },
  timeSlot: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginRight: 10, borderWidth: 2, borderColor: '#E5E7EB' },
  timeSlotActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  timeSlotText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  timeSlotTextActive: { color: '#FFF' },

  // Payment avec Apple Pay
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: '#E5E7EB' },
  paymentMethodActive: { backgroundColor: '#FEF2F2', borderColor: '#C62828' },
  paymentMethodDisabled: { opacity: 0.5 },
  paymentIcon: { fontSize: 22, marginRight: 12 },
  applePayIconContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  applePayIcon: { fontSize: 22, color: '#000' },
  applePayLabel: { fontSize: 18, fontWeight: '600', color: '#000', marginLeft: 2 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  paymentLabelActive: { color: '#C62828' },
  paymentLabelDisabled: { color: '#9CA3AF' },
  paymentSoonLabel: { fontSize: 11, color: '#F59E0B', marginTop: 2 },
  checkmark: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#C62828', justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  // Cashback
  cashbackCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#E5E7EB' },
  cashbackCardActive: { backgroundColor: '#F5F3FF', borderColor: '#8B5CF6' },
  cashbackTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  cashbackBalance: { fontSize: 13, color: '#6B7280' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  checkboxText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  // Promo code
  promoCodeApplied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  promoCodeAppliedTitle: { fontSize: 15, fontWeight: '600', color: '#059669', marginBottom: 4 },
  promoCodeAppliedDiscount: { fontSize: 14, color: '#059669' },
  promoRemove: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
  promoInput: { flexDirection: 'row', gap: 12 },
  promoField: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  promoButton: { backgroundColor: '#C62828', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'center' },
  promoButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  // Notes
  notesInput: { backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 70, textAlignVertical: 'top' },

  // Summary
  summarySection: { backgroundColor: '#FFF', marginTop: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { fontSize: 15, color: '#6B7280' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  summaryLabelGreen: { fontSize: 14, color: '#059669' },
  summaryValueGreen: { fontSize: 14, fontWeight: '600', color: '#059669' },
  summaryLabelPurple: { fontSize: 14, color: '#8B5CF6' },
  summaryValuePurple: { fontSize: 14, fontWeight: '600', color: '#8B5CF6' },
  summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabelTotal: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  summaryTotal: { fontSize: 28, fontWeight: 'bold', color: '#C62828' },
  totalSavings: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  totalSavingsText: { fontSize: 15, fontWeight: 'bold', color: '#DC2626' },

  // Footer
  footer: { backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  orderButton: { backgroundColor: '#C62828', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  orderButtonDisabled: { backgroundColor: '#9CA3AF' },
  orderButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  clearButton: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  clearButtonText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 80, marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  emptyButton: { backgroundColor: '#C62828', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  emptyButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

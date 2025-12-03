import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet
} from 'react-native';
import { Phone, MapPin, Mail, Facebook, Instagram } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getRestaurantInfo } from '../../services/restaurantService';

const DAYS_FR = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

// URLs des réseaux sociaux - À MODIFIER avec tes vrais liens
const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/familys_restaurant',
  facebook: 'https://facebook.com/familys.restaurant'
};

export default function RestaurantScreen() {
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurantInfo();
  }, []);

  const loadRestaurantInfo = async () => {
    try {
      const data = await getRestaurantInfo();
      setInfo(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les informations');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (info?.phone) {
      const phoneNumber = info.phone.replace(/\s/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleOpenMap = () => {
    if (info?.latitude && info?.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${info.latitude},${info.longitude}`,
        android: `geo:0,0?q=${info.latitude},${info.longitude}(${info.name})`
      });
      Linking.openURL(url);
    } else if (info?.address) {
      const address = encodeURIComponent(`${info.address}, ${info.city || ''} ${info.postal_code || ''}`);
      const url = Platform.select({
        ios: `maps:0,0?q=${address}`,
        android: `geo:0,0?q=${address}`
      });
      Linking.openURL(url);
    }
  };

  const handleEmail = () => {
    if (info?.email) {
      Linking.openURL(`mailto:${info.email}`);
    }
  };

  const openSocialMedia = (platform, url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', `Impossible d'ouvrir ${platform}`);
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Utilise les liens du backend si disponibles, sinon utilise les liens en dur
  const instagramUrl = info?.social_media?.instagram || SOCIAL_LINKS.instagram;
  const facebookUrl = info?.social_media?.facebook || SOCIAL_LINKS.facebook;

  return (
    <View style={styles.container}>
      {/* Header avec logo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        {info?.logo_url ? (
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={{ uri: info.logo_url }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : (
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoEmoji}>🍔</Text>
            </View>
          </View>
        )}
        <Text style={styles.headerTitle}>Infos du Resto</Text>
        <Text style={styles.headerSubtitle}>Toutes nos infos pratiques</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Actions rapides */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.greenButton]} onPress={handleCall}>
            <Phone color="white" size={28} />
            <Text style={styles.actionText}>Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.blueButton]} onPress={handleOpenMap}>
            <MapPin color="white" size={28} />
            <Text style={styles.actionText}>Y aller</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.purpleButton]} onPress={handleEmail}>
            <Mail color="white" size={28} />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Coordonnées détaillées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{info?.phone}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Adresse</Text>
            <Text style={styles.infoValue}>{info?.address}</Text>
            {info?.city && (
              <Text style={styles.infoSubValue}>{info.postal_code} {info.city}</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{info?.email}</Text>
          </View>
        </View>

        {/* Horaires d'ouverture */}
        {info?.opening_hours && Object.keys(info.opening_hours).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕐 Horaires</Text>
            <View style={styles.hoursCard}>
              {Object.entries(info.opening_hours).map(([day, hours], index, array) => (
                <View key={day} style={[styles.hourRow, index < array.length - 1 && styles.hourRowBorder]}>
                  <Text style={styles.dayText}>{DAYS_FR[day]}</Text>
                  {hours.closed ? (
                    <Text style={styles.closedText}>Fermé</Text>
                  ) : (
                    <Text style={styles.hoursText}>
                      {hours.open} - {hours.close}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Réseaux sociaux - TOUJOURS AFFICHÉS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Suivez-nous</Text>
          
          {/* Instagram */}
          <TouchableOpacity
            onPress={() => openSocialMedia('Instagram', instagramUrl)}
            style={[styles.socialButton, styles.instagramButton]}
          >
            <Instagram color="white" size={28} strokeWidth={2.5} />
            <Text style={styles.socialText}>Instagram</Text>
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity
            onPress={() => openSocialMedia('Facebook', facebookUrl)}
            style={[styles.socialButton, styles.facebookButton]}
          >
            <Facebook color="white" size={28} strokeWidth={2.5} />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBadge}>
          <Text style={styles.infoBadgeTitle}>💡 Bon à savoir</Text>
          <Text style={styles.infoBadgeText}>
            Vous pouvez nous appeler pendant les horaires d'ouverture pour toute question !
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: '#4F46E5', paddingTop: 64, paddingBottom: 32, paddingHorizontal: 24 },
  backButton: { position: 'absolute', top: 64, left: 24, zIndex: 10, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  backButtonText: { color: '#4F46E5', fontSize: 16, fontWeight: '600' },
  logoContainer: { alignItems: 'center', marginBottom: 16, marginTop: 32 },
  logoWrapper: { backgroundColor: '#FFFFFF', borderRadius: 50, padding: 8 },
  logoImage: { width: 96, height: 96, borderRadius: 48 },
  logoPlaceholder: { backgroundColor: '#FFFFFF', borderRadius: 56, width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 60 },
  headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  actionButton: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  greenButton: { backgroundColor: '#10B981' },
  blueButton: { backgroundColor: '#3B82F6' },
  purpleButton: { backgroundColor: '#8B5CF6' },
  actionText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginTop: 8 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  infoCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 12 },
  infoLabel: { color: '#6B7280', fontSize: 12, marginBottom: 4 },
  infoValue: { color: '#1F2937', fontSize: 18, fontWeight: '600' },
  infoSubValue: { color: '#4B5563', fontSize: 14, marginTop: 4 },
  hoursCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  hourRowBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  dayText: { color: '#374151', fontSize: 16, fontWeight: '500' },
  hoursText: { color: '#1F2937', fontSize: 16, fontWeight: '600' },
  closedText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
  socialButton: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  instagramButton: { backgroundColor: '#E4405F', shadowColor: '#E4405F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  facebookButton: { backgroundColor: '#1877F2', shadowColor: '#1877F2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  socialText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  infoBadge: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 24, marginBottom: 24 },
  infoBadgeTitle: { color: '#92400E', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  infoBadgeText: { color: '#B45309', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});


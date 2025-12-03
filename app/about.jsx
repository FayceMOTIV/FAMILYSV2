import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, Platform, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRestaurantInfo } from '../services/restaurantService';

const DAYS_FR = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche' };

export default function RestaurantScreen() {
const router = useRouter();
const [info, setInfo] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => { loadRestaurantInfo(); }, []);

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
const url = Platform.select({ ios: `maps:0,0?q=${address}`, android: `geo:0,0?q=${address}` });
Linking.openURL(url);
}
};

const handleEmail = () => { if (info?.email) Linking.openURL(`mailto:${info.email}`); };

const openSocialMedia = (platform, url) => {
if (url) Linking.openURL(url).catch(() => Alert.alert('Erreur', `Impossible d'ouvrir ${platform}`));
};

if (loading) {
return (
<View style={styles.loadingContainer}>
<ActivityIndicator size="large" color="#4F46E5" />
<Text style={styles.loadingText}>Chargement...</Text>
</View>
);
}

return (
<View style={styles.container}>
<View style={styles.header}>
<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
<Ionicons name="arrow-back" size={24} color="#FFFFFF" />
</TouchableOpacity>
<Text style={styles.headerTitle}>Infos du Resto</Text>
<View style={{ width: 40 }} />
</View>

<View style={styles.heroSection}>
{info?.logo_url ? (
<Image source={{ uri: info.logo_url }} style={styles.logo} resizeMode="contain" />
) : (
<View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>🍔</Text></View>
)}
<Text style={styles.heroSubtitle}>Toutes nos infos pratiques</Text>
</View>

<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
<View style={styles.quickActionsRow}>
<TouchableOpacity onPress={handleCall} style={[styles.quickActionButton, styles.callButton]}>
<Ionicons name="call" size={28} color="white" />
<Text style={styles.quickActionText}>Appeler</Text>
</TouchableOpacity>

<TouchableOpacity onPress={handleOpenMap} style={[styles.quickActionButton, styles.mapButton]}>
<Ionicons name="navigate" size={28} color="white" />
<Text style={styles.quickActionText}>Y aller</Text>
</TouchableOpacity>

<TouchableOpacity onPress={handleEmail} style={[styles.quickActionButton, styles.emailButton]}>
<Ionicons name="mail" size={28} color="white" />
<Text style={styles.quickActionText}>Email</Text>
</TouchableOpacity>
</View>

<View style={styles.section}>
<Text style={styles.sectionTitle}>📞 Contact</Text>
<View style={styles.infoCard}>
<Text style={styles.infoLabel}>Téléphone</Text>
<Text style={styles.infoValue}>{info?.phone}</Text>
</View>

<View style={styles.infoCard}>
<Text style={styles.infoLabel}>Adresse</Text>
<Text style={styles.infoValue}>{info?.address}</Text>
{info?.city && <Text style={styles.infoSubValue}>{info.postal_code} {info.city}</Text>}
</View>

<View style={styles.infoCard}>
<Text style={styles.infoLabel}>Email</Text>
<Text style={styles.infoValue}>{info?.email}</Text>
</View>
</View>

{info?.opening_hours && Object.keys(info.opening_hours).length > 0 && (
<View style={styles.section}>
<Text style={styles.sectionTitle}>🕐 Horaires</Text>
<View style={styles.scheduleCard}>
{Object.entries(info.opening_hours).map(([day, hours], index) => (
<View key={day} style={[styles.scheduleRow, index === Object.entries(info.opening_hours).length - 1 && styles.scheduleRowLast]}>
<Text style={styles.dayText}>{DAYS_FR[day]}</Text>
{hours.closed ? (
<Text style={styles.closedText}>Fermé</Text>
) : (
<Text style={styles.hoursText}>{hours.open} - {hours.close}</Text>
)}
</View>
))}
</View>
</View>
)}

<View style={styles.section}>
<Text style={styles.sectionTitle}>🌐 Suivez-nous</Text>
<TouchableOpacity onPress={() => openSocialMedia('Instagram', info?.social_media?.instagram || 'https://instagram.com/familys_restaurant')} style={[styles.socialButton, styles.instagramButton]}>
<Ionicons name="logo-instagram" size={28} color="white" />
<Text style={styles.socialButtonText}>Instagram</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => openSocialMedia('Facebook', info?.social_media?.facebook || 'https://facebook.com/familys.restaurant')} style={[styles.socialButton, styles.facebookButton]}>
<Ionicons name="logo-facebook" size={28} color="white" />
<Text style={styles.socialButtonText}>Facebook</Text>
</TouchableOpacity>
</View>

<View style={styles.infoBox}>
<Text style={styles.infoBoxTitle}>💡 Bon à savoir</Text>
<Text style={styles.infoBoxText}>Vous pouvez nous appeler pendant les horaires d'ouverture pour toute question !</Text>
</View>
</ScrollView>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#F8F9FA' },
loadingContainer: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#4F46E5' },
backButton: { padding: 8 },
headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
heroSection: { backgroundColor: '#4F46E5', paddingBottom: 24, paddingHorizontal: 24, alignItems: 'center' },
logo: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF', marginBottom: 16 },
logoPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
logoPlaceholderText: { fontSize: 48 },
heroSubtitle: { color: '#E0E7FF', fontSize: 14, textAlign: 'center', marginTop: 4 },
scrollView: { flex: 1 },
scrollContent: { paddingHorizontal: 16, paddingVertical: 24 },
quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 8 },
quickActionButton: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
callButton: { backgroundColor: '#10B981' },
mapButton: { backgroundColor: '#3B82F6' },
emailButton: { backgroundColor: '#8B5CF6' },
quickActionText: { color: '#FFFFFF', fontWeight: '600', marginTop: 8, fontSize: 13 },
section: { marginBottom: 32 },
sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
infoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
infoValue: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
infoSubValue: { fontSize: 14, color: '#6B7280', marginTop: 4 },
scheduleCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
scheduleRowLast: { borderBottomWidth: 0 },
dayText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
hoursText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
closedText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
facebookButton: { backgroundColor: '#1877F2' },
instagramButton: { backgroundColor: '#E4405F' },
socialButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
infoBox: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 24, marginBottom: 24 },
infoBoxTitle: { fontSize: 16, fontWeight: '600', color: '#92400E', textAlign: 'center', marginBottom: 8 },
infoBoxText: { fontSize: 14, color: '#78350F', textAlign: 'center', lineHeight: 20 },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Users, Phone, Mail, User, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { reservationsService } from '../../services/reservations';

export default function ReservationsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { settings, isReservationsEnabled } = useSettingsStore();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myReservations, setMyReservations] = useState([]);
  
  // Formulaire
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
      loadReservations();
    }

    // Date par défaut : demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReservationDate(tomorrow.toISOString().split('T')[0]);
    setReservationTime('19:00');
  }, [isAuthenticated, user]);

  const loadReservations = async () => {
    if (!user?.email) return;
    
    try {
      const data = await reservationsService.getCustomerReservations(user.email);
      setMyReservations(data.reservations || []);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateReservation = async () => {
    // Validation
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!reservationDate || !reservationTime) {
      Alert.alert('Erreur', 'Veuillez choisir une date et une heure');
      return;
    }

    if (parseInt(partySize) < 1 || parseInt(partySize) > 20) {
      Alert.alert('Erreur', 'Le nombre de personnes doit être entre 1 et 20');
      return;
    }

    try {
      setLoading(true);

      const reservationData = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        party_size: parseInt(partySize),
        notes: notes || '',
        status: 'pending'
      };

      const result = await reservationsService.createReservation(reservationData);

      Alert.alert(
        '✅ Réservation confirmée !',
        `Votre réservation pour ${partySize} personne(s) le ${reservationDate} à ${reservationTime} est enregistrée.`,
        [{ text: 'OK', onPress: () => {
          setNotes('');
          loadReservations();
        }}]
      );
    } catch (error) {
      console.error('Erreur création réservation:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de créer la réservation'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = (reservationId) => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservationsService.cancelReservation(reservationId);
              Alert.alert('✅ Réservation annulée');
              loadReservations();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la réservation');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-[#C62828] pt-12 pb-6 px-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">📅 Réservations</Text>
        </View>
        
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Connectez-vous pour réserver
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)')}
            className="bg-[#C62828] rounded-full px-8 py-4"
          >
            <Text className="text-white font-bold text-lg">Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isReservationsEnabled()) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-[#C62828] pt-12 pb-6 px-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">📅 Réservations</Text>
        </View>
        
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-6xl mb-4">🚫</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            Réservations temporairement indisponibles
          </Text>
          <Text className="text-gray-600 text-center">
            Les réservations ne sont pas activées pour le moment.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-[#C62828] pt-12 pb-6 px-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">📅 Réserver une table</Text>
        <Text className="text-white opacity-90 mt-1">
          {settings?.name || 'Restaurant'}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadReservations();
          }} />
        }
      >
        <View className="p-6">
          {/* Formulaire */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Nouvelle réservation
            </Text>

            {/* Date et heure */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                📅 Date et heure *
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-gray-100 rounded-lg px-4 py-3"
                  placeholder="YYYY-MM-DD"
                  value={reservationDate}
                  onChangeText={setReservationDate}
                />
                <TextInput
                  className="w-28 bg-gray-100 rounded-lg px-4 py-3"
                  placeholder="HH:MM"
                  value={reservationTime}
                  onChangeText={setReservationTime}
                />
              </View>
            </View>

            {/* Nombre de personnes */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                👥 Nombre de personnes *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3"
                placeholder="Ex: 4"
                value={partySize}
                onChangeText={setPartySize}
                keyboardType="number-pad"
              />
            </View>

            {/* Nom */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                👤 Nom *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3"
                placeholder="Votre nom"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                📧 Email *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3"
                placeholder="votre@email.com"
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Téléphone */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                📱 Téléphone *
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3"
                placeholder="06 XX XX XX XX"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                📝 Notes (optionnel)
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3"
                placeholder="Allergies, chaise haute, etc."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Bouton */}
            <TouchableOpacity
              onPress={handleCreateReservation}
              disabled={loading}
              className="bg-[#C62828] rounded-2xl py-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Réserver
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Mes réservations */}
          {myReservations.length > 0 && (
            <View className="bg-white rounded-2xl p-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Mes réservations
              </Text>

              {myReservations.map((reservation) => (
                <View
                  key={reservation.id}
                  className="bg-gray-50 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-800">
                        {formatDate(reservation.reservation_date)}
                      </Text>
                      <Text className="text-gray-600">
                        🕐 {reservation.reservation_time}
                      </Text>
                      <Text className="text-gray-600">
                        👥 {reservation.party_size} personne(s)
                      </Text>
                    </View>

                    <View
                      className={`px-3 py-1 rounded-full ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-100'
                          : reservation.status === 'pending'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          reservation.status === 'confirmed'
                            ? 'text-green-700'
                            : reservation.status === 'pending'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}
                      >
                        {reservation.status === 'confirmed' && '✓ Confirmée'}
                        {reservation.status === 'pending' && '⏳ En attente'}
                        {reservation.status === 'canceled' && '✗ Annulée'}
                      </Text>
                    </View>
                  </View>

                  {reservation.status !== 'canceled' && (
                    <TouchableOpacity
                      onPress={() => handleCancelReservation(reservation.id)}
                      className="bg-red-50 rounded-lg py-2 items-center"
                    >
                      <Text className="text-red-600 font-semibold">
                        Annuler cette réservation
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

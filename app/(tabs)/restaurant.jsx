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
  Image
} from 'react-native';
import { Phone, MapPin, Mail, Facebook, Instagram, Twitter } from 'lucide-react-native';
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

export default function RestaurantScreen() {
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header avec logo */}
      <View className="bg-[#C62828] pt-12 pb-6 px-6">
        {info?.logo_url && (
          <View className="items-center mb-4">
            <Image
              source={{ uri: info.logo_url }}
              className="w-24 h-24 rounded-full bg-white"
              resizeMode="contain"
            />
          </View>
        )}
        <Text className="text-white opacity-90 mt-1 text-center">Toutes nos infos pratiques</Text>
        
        {/* Coordonnées GPS si disponibles */}
        {info?.latitude && info?.longitude && (
          <Text className="text-white opacity-75 text-xs text-center mt-2">
            📍 {info.latitude.toFixed(6)}, {info.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Actions rapides */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity 
            onPress={handleCall}
            className="bg-green-500 rounded-2xl p-4 flex-1 mr-2 items-center"
          >
            <Phone color="white" size={28} />
            <Text className="text-white font-semibold mt-2 text-sm">Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenMap}
            className="bg-blue-500 rounded-2xl p-4 flex-1 mx-2 items-center"
          >
            <MapPin color="white" size={28} />
            <Text className="text-white font-semibold mt-2 text-sm">Y aller</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleEmail}
            className="bg-purple-500 rounded-2xl p-4 flex-1 ml-2 items-center"
          >
            <Mail color="white" size={28} />
            <Text className="text-white font-semibold mt-2 text-sm">Email</Text>
          </TouchableOpacity>
        </View>

        {/* Coordonnées détaillées */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">📞 Contact</Text>
          
          <View className="bg-gray-50 rounded-2xl p-4 mb-3">
            <Text className="text-gray-500 text-xs mb-1">Téléphone</Text>
            <Text className="text-gray-800 text-lg font-semibold">{info?.phone}</Text>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 mb-3">
            <Text className="text-gray-500 text-xs mb-1">Adresse</Text>
            <Text className="text-gray-800 text-lg font-semibold">{info?.address}</Text>
            {info?.city && (
              <Text className="text-gray-600">{info.postal_code} {info.city}</Text>
            )}
          </View>

          <View className="bg-gray-50 rounded-2xl p-4">
            <Text className="text-gray-500 text-xs mb-1">Email</Text>
            <Text className="text-gray-800 text-lg font-semibold">{info?.email}</Text>
          </View>
        </View>

        {/* Horaires d'ouverture */}
        {info?.opening_hours && Object.keys(info.opening_hours).length > 0 && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">🕐 Horaires</Text>
            <View className="bg-gray-50 rounded-2xl p-4">
              {Object.entries(info.opening_hours).map(([day, hours]) => (
                <View key={day} className="flex-row justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <Text className="text-gray-700 font-medium text-base">{DAYS_FR[day]}</Text>
                  {hours.closed ? (
                    <Text className="text-red-500 font-semibold">Fermé</Text>
                  ) : (
                    <Text className="text-gray-800 font-semibold">
                      {hours.open} - {hours.close}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Réseaux sociaux */}
        {info?.social_media && Object.keys(info.social_media).length > 0 && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">🌐 Suivez-nous</Text>
            <View className="space-y-3">
              {info.social_media.facebook && (
                <TouchableOpacity
                  onPress={() => openSocialMedia('Facebook', info.social_media.facebook)}
                  className="bg-[#1877F2] rounded-2xl px-6 py-4 flex-row items-center justify-center mb-3"
                >
                  <Facebook color="white" size={24} />
                  <Text className="text-white font-semibold text-lg ml-3">Facebook</Text>
                </TouchableOpacity>
              )}
              {info.social_media.instagram && (
                <TouchableOpacity
                  onPress={() => openSocialMedia('Instagram', info.social_media.instagram)}
                  className="rounded-2xl px-6 py-4 flex-row items-center justify-center mb-3"
                  style={{ backgroundColor: '#E4405F' }}
                >
                  <Instagram color="white" size={24} />
                  <Text className="text-white font-semibold text-lg ml-3">Instagram</Text>
                </TouchableOpacity>
              )}
              {info.social_media.twitter && (
                <TouchableOpacity
                  onPress={() => openSocialMedia('Twitter', info.social_media.twitter)}
                  className="bg-[#1DA1F2] rounded-2xl px-6 py-4 flex-row items-center justify-center"
                >
                  <Twitter color="white" size={24} />
                  <Text className="text-white font-semibold text-lg ml-3">Twitter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View className="bg-amber-50 rounded-2xl p-6 mb-6">
          <Text className="text-amber-800 text-center font-semibold text-base mb-2">
            💡 Bon à savoir
          </Text>
          <Text className="text-amber-700 text-center text-sm">
            Vous pouvez nous appeler pendant les horaires d'ouverture pour toute question !
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

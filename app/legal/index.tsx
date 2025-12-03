import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { getRestaurantInfo } from '../../services/restaurantService';

export default function LegalScreen() {
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

  const openLegalDoc = (url, title) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', `Impossible d'ouvrir ${title}`);
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
      <View className="bg-[#C62828] pt-12 pb-6 px-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">⚖️ Mentions Légales</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Informations de l'entreprise</Text>
          <View className="bg-gray-50 rounded-2xl p-4">
            {info?.legal_entity_name && (
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">Raison sociale</Text>
                <Text className="text-gray-800 text-base">{info.legal_entity_name}</Text>
              </View>
            )}
            {info?.legal_form && (
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">Forme juridique</Text>
                <Text className="text-gray-800 text-base">{info.legal_form}</Text>
              </View>
            )}
            {info?.siret && (
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">SIRET</Text>
                <Text className="text-gray-800 text-base font-mono">{info.siret}</Text>
              </View>
            )}
            {info?.vat_number && (
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">Numéro de TVA</Text>
                <Text className="text-gray-800 text-base font-mono">{info.vat_number}</Text>
              </View>
            )}
            {info?.share_capital && (
              <View className="mb-4">
                <Text className="text-gray-500 text-xs mb-1">Capital social</Text>
                <Text className="text-gray-800 text-base">{info.share_capital}</Text>
              </View>
            )}
            {info?.director_name && (
              <View>
                <Text className="text-gray-500 text-xs mb-1">Directeur de publication</Text>
                <Text className="text-gray-800 text-base">{info.director_name}</Text>
              </View>
            )}
          </View>
        </View>

        {info?.address && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">Siège social</Text>
            <View className="bg-gray-50 rounded-2xl p-4">
              <Text className="text-gray-800 text-base">{info.address}</Text>
              {info.city && (
                <Text className="text-gray-800 text-base mt-1">
                  {info.postal_code} {info.city}
                </Text>
              )}
            </View>
          </View>
        )}

        {info?.host_name && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">Hébergement</Text>
            <View className="bg-gray-50 rounded-2xl p-4">
              <Text className="text-gray-800 text-base font-semibold">{info.host_name}</Text>
              {info.host_address && (
                <Text className="text-gray-600 text-sm mt-1">{info.host_address}</Text>
              )}
            </View>
          </View>
        )}

        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Documents légaux</Text>
          
          {info?.cgv_url && (
            <TouchableOpacity
              onPress={() => openLegalDoc(info.cgv_url, 'CGV')}
              className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4 mb-3"
            >
              <View>
                <Text className="text-gray-800 font-semibold text-base">CGV</Text>
                <Text className="text-gray-500 text-xs mt-1">Conditions Générales de Vente</Text>
              </View>
              <ExternalLink color="#6B7280" size={20} />
            </TouchableOpacity>
          )}
          
          {info?.terms_url && (
            <TouchableOpacity
              onPress={() => openLegalDoc(info.terms_url, 'CGU')}
              className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4 mb-3"
            >
              <View>
                <Text className="text-gray-800 font-semibold text-base">CGU</Text>
                <Text className="text-gray-500 text-xs mt-1">Conditions d'Utilisation</Text>
              </View>
              <ExternalLink color="#6B7280" size={20} />
            </TouchableOpacity>
          )}
          
          {info?.privacy_url && (
            <TouchableOpacity
              onPress={() => openLegalDoc(info.privacy_url, 'Confidentialité')}
              className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4"
            >
              <View>
                <Text className="text-gray-800 font-semibold text-base">Confidentialité</Text>
                <Text className="text-gray-500 text-xs mt-1">RGPD & Données</Text>
              </View>
              <ExternalLink color="#6B7280" size={20} />
            </TouchableOpacity>
          )}
        </View>

        <View className="items-center py-6 mb-6">
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
          <Text className="text-gray-400 text-xs mt-2">© 2024 {info?.name}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

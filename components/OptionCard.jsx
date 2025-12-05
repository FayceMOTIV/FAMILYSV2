import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { API_BASE_URL } from '../constants/config';

export default function OptionCard({ option, isSelected, onPress, compact = false }) {
  const hasImage = option.image_url;
  const price = option.delta_price || option.price || 0;
  
  // Construire l'URL complète de l'image
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // URL relative → ajouter le base URL
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${url}`;
  };

  // Mode compact avec image (style carte)
  if (hasImage && !compact) {
    return (
      <TouchableOpacity
        style={[styles.cardWithImage, isSelected && styles.cardWithImageSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Image */}
        <Image
          source={{ uri: getImageUrl(option.image_url) }}
          style={styles.choiceImage}
          resizeMode="cover"
        />
        
        {/* Overlay sélection */}
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
        
        {/* Infos */}
        <View style={styles.imageCardInfo}>
          <Text style={[styles.imageCardName, isSelected && styles.imageCardNameSelected]} numberOfLines={2}>
            {option.name}
          </Text>
          {price > 0 && (
            <Text style={[styles.imageCardPrice, isSelected && styles.imageCardPriceSelected]}>
              +{price.toFixed(2)}€
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Mode liste classique (sans image ou compact)
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.text, compact && styles.textCompact]}>{option.name}</Text>
      {price > 0 && (
        <Text style={[styles.price, compact && styles.priceCompact]}>+{price.toFixed(2)}€</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Mode liste classique
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  cardCompact: {
    padding: 10,
    marginBottom: 6,
    borderRadius: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#4F46E5',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  textCompact: {
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  priceCompact: {
    fontSize: 13,
  },

  // Mode carte avec image
  cardWithImage: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardWithImageSelected: {
    borderColor: '#4F46E5',
    borderWidth: 3,
  },
  choiceImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageCardInfo: {
    padding: 10,
  },
  imageCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  imageCardNameSelected: {
    color: '#4F46E5',
  },
  imageCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  imageCardPriceSelected: {
    color: '#4F46E5',
  },
});

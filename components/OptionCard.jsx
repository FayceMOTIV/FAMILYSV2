import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export default function OptionCard({ option, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioDot} />}
      </View>
      <Text style={styles.text}>{option.name}</Text>
      {option.delta_price > 0 && (
        <Text style={styles.price}>+{option.delta_price.toFixed(2)} €</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
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
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SupplementControl({ supplement, quantity, onIncrease, onDecrease }) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{supplement.name}</Text>
          <Text style={styles.price}>+{supplement.delta_price.toFixed(2)} €</Text>
        </View>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, quantity === 0 && styles.buttonDisabled]}
          onPress={onDecrease}
          disabled={quantity === 0}
        >
          <Text style={[styles.buttonText, quantity === 0 && styles.buttonTextDisabled]}>−</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{quantity}</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={onIncrease}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    minWidth: 24,
    textAlign: 'center',
  },
});

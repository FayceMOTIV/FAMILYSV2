import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';

export default function CategoryButton({ category, isActive, onPress }) {
  const hasImage = category.image || category.icon;
  
  return (
    <TouchableOpacity
      style={[styles.button, isActive && styles.buttonActive]}
      onPress={onPress}
    >
      {hasImage ? (
        <Image 
          source={{ uri: category.image || category.icon }} 
          style={styles.iconImage}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.emoji}>{category.emoji || '🍽️'}</Text>
      )}
      <Text style={[styles.text, isActive && styles.textActive]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  buttonActive: {
    backgroundColor: '#4F46E5',
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  iconImage: {
    width: 24,
    height: 24,
    marginRight: 6,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  textActive: {
    color: '#FFFFFF',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export default function ToggleSwitch({ ingredient, isActive, onToggle }) {
  const translateX = React.useRef(new Animated.Value(isActive ? 20 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: isActive ? 20 : 0,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [isActive]);

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{ingredient.name}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.toggle, isActive && styles.toggleActive]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleCircle,
            { transform: [{ translateX }] }
          ]}
        />
      </TouchableOpacity>
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
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4F46E5',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Loader({ size = 'large', color = '#C62828' }) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

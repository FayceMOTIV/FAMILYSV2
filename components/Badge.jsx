import React from 'react';
import { View, Text } from 'react-native';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-700',
    primary: 'bg-[#C62828] text-white',
    secondary: 'bg-[#FFD54F] text-[#1a1a1a]',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };
  
  const classes = variantClasses[variant].split(' ');
  const bgClass = classes[0];
  const textClass = classes[1];
  
  return (
    <View className={`${bgClass} px-3 py-1 rounded-full ${className}`}>
      <Text className={`${textClass} font-semibold text-xs`}>
        {children}
      </Text>
    </View>
  );
}

import React from 'react';
import { View, TextInput, Text } from 'react-native';

export default function Input({ 
  label, 
  placeholder, 
  value, 
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  className = '',
  ...props 
}) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-[#333333] font-medium mb-2">{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        className={`bg-white border rounded-lg px-4 py-3 text-base ${
          error ? 'border-[#F44336]' : 'border-[#CCCCCC]'
        }`}
        {...props}
      />
      {error && (
        <Text className="text-[#F44336] text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}

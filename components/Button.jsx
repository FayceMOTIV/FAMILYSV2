import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function Button({ 
  onPress, 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) {
  const baseClass = 'rounded-lg items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-[#C62828]',
    secondary: 'bg-[#FFD54F]',
    outline: 'border-2 border-[#C62828] bg-transparent',
    ghost: 'bg-transparent',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };
  
  const textVariants = {
    primary: 'text-white font-semibold',
    secondary: 'text-[#1a1a1a] font-semibold',
    outline: 'text-[#C62828] font-semibold',
    ghost: 'text-[#C62828] font-semibold',
  };
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#C62828'} />
      ) : (
        <Text className={`${textVariants[variant]} ${textSizes[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

import React from 'react';
import { View } from 'react-native';

export default function Card({ children, className = '', ...props }) {
  return (
    <View 
      className={`bg-white rounded-xl p-4 shadow-sm ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      {...props}
    >
      {children}
    </View>
  );
}

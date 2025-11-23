import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const categoryIcons = {
  'Burgers': '🍔',
  'Pizzas': '🍕',
  'Tacos': '🌮',
  'Desserts': '🍰',
  'Boissons': '🥤',
  'Entrées': '🥗',
  'Plats': '🍝',
  'default': '🍴'
};

export default function CategoryCard({ category }) {
  const router = useRouter();
  const icon = categoryIcons[category.name] || categoryIcons.default;
  
  const handlePress = () => {
    router.push(`/category/${encodeURIComponent(category.name)}`);
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="mr-4 items-center"
      activeOpacity={0.8}
    >
      <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-2 shadow-sm">
        <Text className="text-3xl">{icon}</Text>
      </View>
      <Text className="text-[#333333] font-medium text-sm text-center">
        {category.name}
      </Text>
      {category.count && (
        <Text className="text-[#666666] text-xs">
          {category.count} items
        </Text>
      )}
    </TouchableOpacity>
  );
}

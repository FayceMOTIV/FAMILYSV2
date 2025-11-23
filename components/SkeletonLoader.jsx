import React from 'react';
import { View } from 'react-native';

export function SkeletonBox({ width = '100%', height = 100, className = '' }) {
  return (
    <View 
      className={`bg-gray-200 rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonText({ width = '80%', className = '' }) {
  return (
    <View 
      className={`bg-gray-200 rounded h-4 ${className}`}
      style={{ width }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="bg-white rounded-xl p-3 mr-3 w-40">
      <SkeletonBox height={120} className="mb-2" />
      <SkeletonText width="90%" className="mb-2" />
      <SkeletonText width="60%" />
    </View>
  );
}

export function CategoryCardSkeleton() {
  return (
    <View className="mr-3 items-center">
      <SkeletonBox width={80} height={80} className="rounded-full mb-2" />
      <SkeletonText width={60} />
    </View>
  );
}

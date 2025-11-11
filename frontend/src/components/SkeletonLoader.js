import React from 'react';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-4 shadow-lg animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-28 h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
    );
  }

  if (type === 'category') {
    return (
      <div className="flex-shrink-0 w-28 bg-gray-200 dark:bg-gray-800 rounded-3xl h-32 animate-pulse" />
    );
  }

  return null;
};

export const ProductCardSkeleton = () => <SkeletonLoader type="card" />;
export const HeroSkeleton = () => <SkeletonLoader type="hero" />;
export const CategorySkeleton = () => <SkeletonLoader type="category" />;

export default SkeletonLoader;

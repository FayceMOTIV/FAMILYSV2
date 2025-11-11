import React from 'react';
import { cn } from '../utils/cn';

export const Card = ({ className, ...props }) => (
  <div
    className={cn('bg-white rounded-xl shadow-md p-6', className)}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('mb-4', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-xl font-bold text-gray-900', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('', className)} {...props} />
);

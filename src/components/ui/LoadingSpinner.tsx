import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary-500' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 'h-6 w-6 border-2';
      case 'large': return 'h-12 w-12 border-4';
      default: return 'h-8 w-8 border-3';
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full ${getSize()} border-t-transparent border-${color}`}></div>
    </div>
  );
};

export default LoadingSpinner;
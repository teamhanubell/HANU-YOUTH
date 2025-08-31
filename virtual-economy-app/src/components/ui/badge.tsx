import React from 'react';

interface BadgeProps {
  variant?: 'outline' | 'filled';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'filled', className, children }) => {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded text-sm font-medium';
  const variantStyles = variant === 'outline' 
    ? 'border border-gray-500 text-gray-500' 
    : 'bg-gray-500 text-white';

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
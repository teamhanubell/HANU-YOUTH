import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ children, className }) => {
  return (
    <div className={`p-4 mb-4 rounded-lg border ${className}`}>
      {children}
    </div>
  );
};

export { Alert };
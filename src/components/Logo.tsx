
import React from 'react';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <img 
      src="/lovable-uploads/3a38b4d2-f711-49d6-ae36-c69a051450ba.png"
      alt="The7Connect Logo"
      className={`h-6 ${className}`}
    />
  );
};

export default Logo;

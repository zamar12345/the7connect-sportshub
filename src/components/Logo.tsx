
import React from 'react';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <img 
      src="https://aatzzynkzgqizcovsvpp.supabase.co/storage/v1/object/public/public-images//WhatsApp%20Image%202025-04-28%20at%203.59.09%20PM.jpeg"
      alt="The7Connect Logo"
      className={`h-8 w-auto ${className}`}
    />
  );
};

export default Logo;

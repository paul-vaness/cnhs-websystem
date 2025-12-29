
import React from 'react';

interface BackgroundProps {
  src: string;
}

export const Background: React.FC<BackgroundProps> = ({ src }) => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {/* The main image - using a subtle zoom for depth */}
      <img 
        src={src} 
        alt="School Campus" 
        className="absolute inset-0 w-full h-full object-cover scale-110"
      />
      
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Bottom gradient to lift the login form */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)]"></div>
    </div>
  );
};

import React from 'react';

export const Ball: React.FC = () => {
  return (
    // This component renders the ball visualization.
    // It is positioned by the parent container.
    <div className="w-8 h-8 rounded-full bg-slate-200 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),2px_5px_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
        {/* Red core/stripe for visibility */}
        <div className="w-full h-full bg-gradient-to-tr from-red-600 to-red-400 rounded-full scale-75 shadow-inner"></div>
        
        {/* Shine highlight */}
        <div className="absolute top-1 left-2 w-3 h-2 bg-white/40 rounded-full blur-[1px]"></div>
    </div>
  );
};
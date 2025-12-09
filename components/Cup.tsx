import React from 'react';
import { motion } from 'framer-motion';
import { Ball } from './Ball';

interface CupProps {
  id: number;
  hasBall: boolean;
  positionIndex: number; // 0, 1, 2...
  totalCups: number;     // Used for centering
  isLifted: boolean;
  onClick: () => void;
  canInteract: boolean;
}

const SLOT_WIDTH = 120; // Distance between cups

export const Cup: React.FC<CupProps> = ({
  id,
  hasBall,
  positionIndex,
  totalCups,
  isLifted,
  onClick,
  canInteract
}) => {
  
  // Calculate X position to center the group of cups
  // Formula shifts the center (0) to the middle of the array
  const centerOffset = (totalCups - 1) / 2;
  const xPosition = (positionIndex - centerOffset) * SLOT_WIDTH;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      initial={false}
      animate={{
        x: xPosition,
        scale: canInteract ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      style={{
        width: '90px',
        height: '110px',
        marginLeft: '-45px', // Center relative to position
        marginTop: '-55px',
        zIndex: isLifted ? 20 : 10,
        cursor: canInteract ? 'pointer' : 'default',
      }}
      onClick={canInteract ? onClick : undefined}
      whileHover={canInteract ? { scale: 1.1 } : {}}
      whileTap={canInteract ? { scale: 0.95 } : {}}
    >
      {/* The Ball - Sits on the table (absolute to the container, not the moving cup body) */}
      {hasBall && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-0">
             <Ball />
        </div>
      )}

      {/* The Cup Body - Handles the lifting animation independently */}
      <motion.div
        className="relative w-full h-full z-10"
        animate={{
          y: isLifted ? -70 : 0, // Lift straight up
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        {/* Cup Visuals */}
        <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-t-xl rounded-b-lg shadow-2xl border-b-4 border-red-950 flex items-center justify-center overflow-hidden relative">
             <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
             {/* Highlight */}
             <div className="w-full h-12 bg-white/10 absolute top-0 skew-y-6 blur-md transform -translate-y-4"></div>
             
             {/* Stripe */}
             <div className="w-full h-2 bg-red-900/40 absolute bottom-4"></div>
        </div>
      </motion.div>
      
      {/* Shadow on the table - Shrinks when cup lifts */}
      <div 
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/50 rounded-full blur-md transition-all duration-300 ${isLifted ? 'opacity-30 scale-75' : 'opacity-100 scale-100'}`}
      ></div>
      
    </motion.div>
  );
};
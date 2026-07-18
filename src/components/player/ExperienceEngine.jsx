// ExperienceEngine.jsx - Manages cinematic animations, blurs, and background vignette depths

import React from 'react';
import { motion } from 'framer-motion';

export const ExperienceEngine = {
  // Returns styling config based on active state of overlay
  getHUDLayout(dimState) {
    switch (dimState) {
      case 'hide':
        return { opacity: 0, blur: 0, scale: 0.95 };
      case 'dim':
        return { opacity: 0.6, blur: 4, scale: 1 };
      default:
        return { opacity: 1, blur: 16, scale: 1 };
    }
  },

  // Backdrop gradient intensity controls
  Vignette({ intensity = 'medium' }) {
    const opacityMap = { light: 0.4, medium: 0.7, intense: 0.95 };
    return (
      <div 
        className="absolute inset-0 transition-opacity duration-1000 -z-10 bg-black pointer-events-none"
        style={{ opacity: opacityMap[intensity] }}
      />
    );
  }
};

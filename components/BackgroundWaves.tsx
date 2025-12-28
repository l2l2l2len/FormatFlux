import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundWaves: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper to-paper-dark opacity-90" />

      {/* Animated waves */}
      <svg
        className="absolute bottom-0 left-0 w-full h-80"
        viewBox="0 0 1920 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Wave 1 - Back */}
        <motion.path
          fill="url(#waveGradient2)"
          initial={{ d: "M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z" }}
          animate={{
            d: [
              "M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z",
              "M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z",
              "M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Wave 2 - Front */}
        <motion.path
          fill="url(#waveGradient1)"
          initial={{ d: "M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z" }}
          animate={{
            d: [
              "M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z",
              "M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z",
              "M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-indigo/5 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.15)_1px,_transparent_0)] bg-[length:32px_32px]" />
    </div>
  );
};

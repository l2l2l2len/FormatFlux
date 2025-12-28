import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundWaves: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper to-paper-dark opacity-80" />

      {/* Animated waves */}
      <svg
        className="absolute bottom-0 left-0 w-full h-80"
        viewBox="0 0 1920 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Wave 1 - Back */}
        <motion.path
          fill="url(#waveGradient3)"
          initial={{ d: 'M0,180 C320,280 520,200 720,180 C920,160 1100,260 1400,200 C1600,160 1800,240 1920,180 L1920,320 L0,320 Z' }}
          animate={{
            d: [
              'M0,180 C320,280 520,200 720,180 C920,160 1100,260 1400,200 C1600,160 1800,240 1920,180 L1920,320 L0,320 Z',
              'M0,220 C280,140 520,280 720,220 C920,160 1100,280 1400,220 C1600,180 1800,260 1920,220 L1920,320 L0,320 Z',
              'M0,180 C320,280 520,200 720,180 C920,160 1100,260 1400,200 C1600,160 1800,240 1920,180 L1920,320 L0,320 Z',
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Wave 2 - Middle */}
        <motion.path
          fill="url(#waveGradient2)"
          initial={{ d: 'M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z' }}
          animate={{
            d: [
              'M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z',
              'M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z',
              'M0,160 C320,300 420,240 640,160 C880,80 900,200 1200,160 C1400,120 1600,200 1920,160 L1920,320 L0,320 Z',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Wave 3 - Front */}
        <motion.path
          fill="url(#waveGradient1)"
          initial={{ d: 'M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z' }}
          animate={{
            d: [
              'M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z',
              'M0,180 C320,260 420,200 640,180 C880,160 900,240 1200,200 C1400,160 1600,240 1920,180 L1920,320 L0,320 Z',
              'M0,200 C280,120 520,280 720,200 C920,120 1100,240 1400,180 C1600,140 1800,220 1920,200 L1920,320 L0,320 Z',
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-accent-indigo/5"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl bg-accent-blue/5"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

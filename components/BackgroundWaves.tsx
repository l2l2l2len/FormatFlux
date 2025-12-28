import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export const BackgroundWaves: React.FC = () => {
  const { theme } = useTheme();

  // Colors adapt to theme
  const waveColors = {
    dark: {
      wave1: 'rgba(99, 102, 241, 0.12)',
      wave2: 'rgba(59, 130, 246, 0.08)',
      wave3: 'rgba(139, 92, 246, 0.06)',
      orb1: 'rgba(99, 102, 241, 0.15)',
      orb2: 'rgba(59, 130, 246, 0.12)',
    },
    light: {
      wave1: 'rgba(99, 102, 241, 0.06)',
      wave2: 'rgba(59, 130, 246, 0.04)',
      wave3: 'rgba(139, 92, 246, 0.03)',
      orb1: 'rgba(99, 102, 241, 0.08)',
      orb2: 'rgba(59, 130, 246, 0.06)',
    },
  };

  const colors = waveColors[theme];

  // Wave path variants for Framer Motion
  const waveVariants = {
    animate: (custom: number) => ({
      d: [
        `M0,${100 + custom * 20} C320,${180 + custom * 30} 420,${120 + custom * 20} 640,${100 + custom * 20} C880,${80 + custom * 10} 900,${140 + custom * 25} 1200,${100 + custom * 20} C1400,${60 + custom * 15} 1600,${120 + custom * 20} 1920,${100 + custom * 20} L1920,320 L0,320 Z`,
        `M0,${120 + custom * 25} C280,${80 + custom * 15} 520,${160 + custom * 30} 720,${120 + custom * 25} C920,${80 + custom * 10} 1100,${150 + custom * 25} 1400,${100 + custom * 20} C1600,${70 + custom * 15} 1800,${130 + custom * 20} 1920,${120 + custom * 25} L1920,320 L0,320 Z`,
        `M0,${100 + custom * 20} C320,${180 + custom * 30} 420,${120 + custom * 20} 640,${100 + custom * 20} C880,${80 + custom * 10} 900,${140 + custom * 25} 1200,${100 + custom * 20} C1400,${60 + custom * 15} 1600,${120 + custom * 20} 1920,${100 + custom * 20} L1920,320 L0,320 Z`,
      ],
      transition: {
        duration: 8 + custom * 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient - adapts to theme */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-midnight via-midnight to-midnight-light'
            : 'bg-gradient-to-b from-paper via-paper to-paper-dark'
        }`}
      />

      {/* Animated SVG Waves */}
      <svg
        className="absolute bottom-0 left-0 w-full h-96"
        viewBox="0 0 1920 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient definitions for waves */}
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.wave1} />
            <stop offset="50%" stopColor={colors.wave2} />
            <stop offset="100%" stopColor={colors.wave1} />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.wave2} />
            <stop offset="50%" stopColor={colors.wave3} />
            <stop offset="100%" stopColor={colors.wave2} />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.wave3} />
            <stop offset="50%" stopColor={colors.wave1} />
            <stop offset="100%" stopColor={colors.wave3} />
          </linearGradient>
        </defs>

        {/* Wave 3 - Back (slowest) */}
        <motion.path
          fill="url(#waveGrad3)"
          custom={2}
          variants={waveVariants}
          animate="animate"
          initial="animate"
        />

        {/* Wave 2 - Middle */}
        <motion.path
          fill="url(#waveGrad2)"
          custom={1}
          variants={waveVariants}
          animate="animate"
          initial="animate"
        />

        {/* Wave 1 - Front (fastest) */}
        <motion.path
          fill="url(#waveGrad1)"
          custom={0}
          variants={waveVariants}
          animate="animate"
          initial="animate"
        />
      </svg>

      {/* Floating Orbs with Framer Motion */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '400px',
          background: colors.orb1,
          top: '20%',
          left: '15%',
        }}
        animate={{
          y: [0, -30, 10, -20, 0],
          x: [0, 10, -10, 5, 0],
          scale: [1, 1.05, 0.98, 1.02, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '350px',
          height: '350px',
          background: colors.orb2,
          top: '30%',
          right: '20%',
        }}
        animate={{
          y: [0, 20, -15, 25, 0],
          x: [0, -15, 10, -5, 0],
          scale: [1, 0.98, 1.04, 0.99, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '300px',
          height: '300px',
          background: theme === 'dark' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)',
          bottom: '30%',
          left: '40%',
        }}
        animate={{
          y: [0, -20, 15, -10, 0],
          x: [0, 20, -15, 10, 0],
          scale: [1, 1.03, 0.97, 1.01, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Subtle grid pattern overlay - only in light mode */}
      {theme === 'light' && (
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Noise texture overlay */}
      <div
        className={`absolute inset-0 opacity-[0.02] ${theme === 'dark' ? 'opacity-[0.03]' : 'opacity-[0.015]'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

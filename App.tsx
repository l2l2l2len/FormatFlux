import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { ThemeToggleCompact } from './components/ThemeToggle';
import { BackgroundWaves } from './components/BackgroundWaves';
import {
  Layers,
  Users,
  Shield,
  ScanText,
  Zap,
  Upload,
  Cpu,
  Download,
  ArrowRight
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Navbar Component
const Navbar: React.FC = () => {
  const { theme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-accent-indigo to-accent-blue p-2 rounded-xl shadow-glow-sm">
            <Layers size={20} className="text-white" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-ink dark:text-snow">
            Convertly
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex text-xs font-medium text-ink-muted dark:text-snow-muted px-3 py-1.5 rounded-full glass">
            100% Client-Side
          </span>
          <ThemeToggleCompact />
        </div>
      </div>
    </motion.nav>
  );
};

// Hero Section Component
const HeroSection: React.FC = () => (
  <div className="text-center space-y-8 mb-16 max-w-4xl mx-auto pt-8 md:pt-16">
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={0}
      className="inline-block px-4 py-2 rounded-full glass text-ink-light dark:text-snow-dim font-medium text-sm tracking-wide"
    >
      Premium File Conversion Tools
    </motion.div>

    <motion.h1
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={0.1}
      className="font-serif text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
    >
      <span className="text-ink dark:text-snow">Document conversion,</span>
      <br />
      <span className="gradient-text italic">redefined.</span>
    </motion.h1>

    <motion.p
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={0.2}
      className="text-ink-light dark:text-snow-dim text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
    >
      Transform your files with enterprise-grade security. Everything happens in your browser
      {' '}<span className="text-accent-indigo font-semibold">no uploads, no servers, no compromises.</span>
    </motion.p>
  </div>
);

// Bento Feature Card Component
interface BentoCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  bgLight: string;
  bgDark: string;
  index: number;
}

const BentoCard: React.FC<BentoCardProps> = ({
  icon,
  iconColor,
  title,
  description,
  bgLight,
  bgDark,
  index,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`${bgLight} dark:${bgDark} rounded-3xl p-8 md:p-10 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow group min-h-[320px] flex flex-col`}
    >
      <div className={`w-14 h-14 rounded-2xl ${iconColor} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink dark:text-snow mb-4">
        {title}
      </h3>
      <p className="text-ink-light dark:text-snow-dim leading-relaxed flex-grow">
        {description}
      </p>
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-accent-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span>Learn more</span>
        <ArrowRight size={16} />
      </div>
    </motion.div>
  );
};

// Bento Feature Section
const BentoSection: React.FC = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-indigo mb-4 block">
            Why Convertly
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink dark:text-snow">
            Built for the Modern Web
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <BentoCard
            icon={<Shield size={28} className="text-rose-500 dark:text-rose-400" />}
            iconColor="bg-rose-500"
            title="Zero Server-Side Storage"
            description="Your files never leave your device. All processing happens locally in your browser using cutting-edge WebAssembly technology. Complete privacy guaranteed."
            bgLight="bg-bento-coral-light"
            bgDark="bg-bento-coral-dark"
            index={0}
          />
          <BentoCard
            icon={<ScanText size={28} className="text-emerald-500 dark:text-emerald-400" />}
            iconColor="bg-emerald-500"
            title="Intelligent OCR"
            description="Extract text from scanned documents and images with AI-powered optical character recognition. Supports 100+ languages with exceptional accuracy."
            bgLight="bg-bento-sage-light"
            bgDark="bg-bento-sage-dark"
            index={1}
          />
          <BentoCard
            icon={<Zap size={28} className="text-indigo-500 dark:text-indigo-400" />}
            iconColor="bg-indigo-500"
            title="Batch Processing"
            description="Convert hundreds of files simultaneously with our lightning-fast batch engine. Queue, process, and download with a single click."
            bgLight="bg-bento-indigo-light"
            bgDark="bg-bento-indigo-dark"
            index={2}
          />
        </div>
      </div>
    </section>
  );
};

// How It Works Step Component
interface StepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Step: React.FC<StepProps> = ({ number, icon, title, description, index }) => {
  const stepRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-2xl glass-strong flex items-center justify-center mx-auto group hover:shadow-glow transition-all duration-300">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent-indigo to-accent-blue text-white text-sm font-bold flex items-center justify-center shadow-lg">
          {number}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold text-ink dark:text-snow mb-3">{title}</h3>
      <p className="text-ink-muted dark:text-snow-muted text-sm leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </motion.div>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 md:py-32 relative glass">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-blue mb-4 block">
            Simple Process
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink dark:text-snow">
            Ingest. Analyze. Export.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto relative">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent-indigo/30 to-transparent" />

          <Step
            number="1"
            icon={<Upload size={32} className="text-accent-indigo" />}
            title="Ingest"
            description="Drag and drop your files or click to browse. We support images, documents, and data formats up to 50MB."
            index={0}
          />
          <Step
            number="2"
            icon={<Cpu size={32} className="text-accent-blue" />}
            title="Analyze"
            description="Our intelligent engine analyzes your file and prepares optimal conversion settings automatically."
            index={1}
          />
          <Step
            number="3"
            icon={<Download size={32} className="text-accent-indigo" />}
            title="Export"
            description="Download your converted file instantly. No waiting, no email verification, no compromises."
            index={2}
          />
        </div>
      </div>
    </section>
  );
};

// Visit Counter Component
const VisitCounter: React.FC = () => {
  const [count, setCount] = React.useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.counterapi.dev/v1/convertly-silvercrest-app/visits/up')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(err => console.error("Counter API Error:", err));
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-ink-muted dark:text-snow-muted glass px-4 py-2 rounded-full">
      <Users size={12} />
      <span>{count.toLocaleString()} Visits</span>
    </div>
  );
};

// Footer Component
const Footer: React.FC = () => (
  <footer className="glass py-12 mt-auto">
    <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-accent-indigo to-accent-blue p-1.5 rounded-lg">
          <Layers size={16} className="text-white" />
        </div>
        <span className="font-serif font-semibold text-ink dark:text-snow">Convertly</span>
      </div>
      <div className="text-ink-muted dark:text-snow-muted text-sm font-medium">
        Designed and Developed by Silvercrest Creative Studios
      </div>
      <VisitCounter />
    </div>
  </footer>
);

// Main App Content (inside providers)
const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-accent-indigo selection:text-white ${
      theme === 'dark' ? 'bg-midnight text-snow' : 'bg-paper text-ink'
    }`}>
      {/* Animated Background */}
      <BackgroundWaves />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Converter */}
      <main className="flex-grow relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        <HeroSection />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full"
        >
          <Converter />
        </motion.div>
      </main>

      {/* Bento Features Section */}
      <BentoSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

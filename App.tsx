import React, { useEffect, useRef } from 'react';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import { BackgroundWaves } from './components/BackgroundWaves';
import { Layers, Users, Scan, Shield, Zap, Upload, Settings, Download } from 'lucide-react';

// Navbar Component
const Navbar: React.FC = () => (
  <nav className="glass sticky top-0 z-50">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-accent-indigo to-accent-blue p-2 rounded-xl shadow-glow-sm">
          <Layers size={20} className="text-white" />
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-ink">Convertly</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate px-3 py-1.5 rounded-full glass">
          100% Client-Side
        </span>
      </div>
    </div>
  </nav>
);

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
    <div className="flex items-center gap-2 text-xs font-medium text-slate glass px-4 py-2 rounded-full">
      <Users size={12} />
      <span>{count.toLocaleString()} Visits</span>
    </div>
  );
};

// Bento Feature Card Component
interface BentoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  delay?: string;
}

const BentoCard: React.FC<BentoCardProps> = ({ icon, title, description, bgColor, delay = '0s' }) => {
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
    <div
      ref={cardRef}
      className={`${bgColor} rounded-3xl p-8 transition-all duration-700 hover:scale-[1.02] hover:shadow-soft border border-ink/5 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-soft flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="font-serif text-2xl font-bold text-ink mb-3">{title}</h3>
      <p className="text-ink-light leading-relaxed">{description}</p>
    </div>
  );
};

// Bento Feature Section
const BentoSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-indigo mb-4 block">
            Features
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink">
            Built for the Modern Web
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <BentoCard
            icon={<Scan size={28} className="text-rose-500" />}
            title="AI-Powered OCR"
            description="Turn scanned documents and images into editable, searchable text with advanced optical character recognition."
            bgColor="bg-bento-rose"
            delay="0s"
          />
          <BentoCard
            icon={<Shield size={28} className="text-emerald-500" />}
            title="Privacy First"
            description="100% browser-based conversion. Your files never leave your device or touch any external servers."
            bgColor="bg-bento-sage"
            delay="0.15s"
          />
          <BentoCard
            icon={<Zap size={28} className="text-indigo-500" />}
            title="Batch Mode"
            description="Convert hundreds of files instantly with our lightning-fast batch processing engine."
            bgColor="bg-bento-indigo"
            delay="0.3s"
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
  delay?: string;
}

const Step: React.FC<StepProps> = ({ number, icon, title, description, delay = '0s' }) => {
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
    <div
      ref={stepRef}
      className={`text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-2xl bg-white/90 shadow-soft border border-ink/5 flex items-center justify-center mx-auto group hover:shadow-glow transition-shadow duration-300">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent-indigo to-accent-blue text-white text-sm font-bold flex items-center justify-center">
          {number}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold text-ink mb-2">{title}</h3>
      <p className="text-ink-light text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </div>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-paper-dark/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-blue mb-4 block">
            Simple Process
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto relative">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent-indigo/30 to-transparent" />

          <Step
            number="1"
            icon={<Upload size={32} className="text-accent-indigo" />}
            title="Upload Your File"
            description="Drag and drop or click to select your files. We support images, documents, and data formats."
            delay="0s"
          />
          <Step
            number="2"
            icon={<Settings size={32} className="text-accent-blue" />}
            title="Choose Format"
            description="Select your desired output format and adjust quality settings if needed."
            delay="0.15s"
          />
          <Step
            number="3"
            icon={<Download size={32} className="text-accent-indigo" />}
            title="Download Result"
            description="Your converted file is ready instantly. No waiting, no email required."
            delay="0.3s"
          />
        </div>
      </div>
    </section>
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
        <span className="font-serif font-semibold text-ink">Convertly</span>
      </div>
      <div className="text-slate text-sm font-medium">
        Designed and Developed by Silvercrest Creative Studios
      </div>
      <VisitCounter />
    </div>
  </footer>
);

// Hero Section Component
const HeroSection: React.FC = () => (
  <div className="text-center space-y-8 mb-16 max-w-3xl mx-auto pt-8">
    <div
      className="inline-block px-4 py-2 rounded-full glass text-ink-light font-medium text-sm tracking-wide opacity-0 animate-fade-up"
    >
      Premium File Conversion Tools
    </div>
    <h1
      className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-ink leading-[1.1] opacity-0 animate-fade-up-delay"
    >
      Universal{' '}
      <span className="gradient-text">
        File Converter
      </span>
    </h1>
    <p
      className="text-ink-light text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up-delay-2"
    >
      Secure, fast, and 100% client-side. Convert your files without them ever leaving your browser.
    </p>
  </div>
);

// Main App Component
const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-accent-indigo selection:text-white">
        {/* Animated Background */}
        <BackgroundWaves />

        {/* Navbar */}
        <Navbar />

        {/* Hero Section with Converter */}
        <main className="flex-grow relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
          <HeroSection />
          <Converter />
        </main>

        {/* Bento Features Section */}
        <BentoSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;

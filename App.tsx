import React, { useEffect, useRef } from 'react';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import { Layers, Users, Shield, Zap, Lock, Upload, Settings, Download } from 'lucide-react';

// Navbar Component - Clean, minimal enterprise style
const Navbar: React.FC = () => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="bg-brand-blue p-1.5 rounded-lg">
            <Layers size={20} className="text-white" />
          </div>
          <span className="font-semibold text-xl text-gray-900">Convertly</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            100% Client-Side Processing
          </span>
          <a
            href="#converter"
            className="bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </a>
        </div>
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
    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
      <Users size={14} />
      <span>{count.toLocaleString()} conversions completed</span>
    </div>
  );
};

// Feature Card Component - Clean enterprise style
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = '0s' }) => {
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
      className={`bg-white border border-gray-200 rounded-xl p-6 transition-all duration-500 hover:shadow-lg hover:border-gray-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// Features Section
const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Convertly
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enterprise-grade file conversion that respects your privacy and delivers results instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Shield size={20} className="text-brand-blue" />}
            title="Privacy First"
            description="All conversions happen in your browser. Your files never leave your device or touch external servers."
            delay="0s"
          />
          <FeatureCard
            icon={<Zap size={20} className="text-brand-blue" />}
            title="Lightning Fast"
            description="Instant conversions powered by modern browser APIs. No upload delays or server processing time."
            delay="0.1s"
          />
          <FeatureCard
            icon={<Lock size={20} className="text-brand-blue" />}
            title="Secure by Design"
            description="Zero data collection, no cookies, no tracking. Your files remain completely private."
            delay="0.2s"
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
      className={`text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="relative inline-block mb-4">
        <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mx-auto shadow-sm">
          {icon}
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-semibold flex items-center justify-center">
          {number}
        </span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">{description}</p>
    </div>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600">
            Three simple steps to convert your files
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-7 left-1/4 right-1/4 h-px bg-gray-200" />

          <Step
            number="1"
            icon={<Upload size={24} className="text-gray-700" />}
            title="Upload"
            description="Drag and drop or click to select your file"
            delay="0s"
          />
          <Step
            number="2"
            icon={<Settings size={24} className="text-gray-700" />}
            title="Configure"
            description="Choose your target format and settings"
            delay="0.1s"
          />
          <Step
            number="3"
            icon={<Download size={24} className="text-gray-700" />}
            title="Download"
            description="Get your converted file instantly"
            delay="0.2s"
          />
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC = () => (
  <footer className="bg-gray-50 border-t border-gray-200 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-brand-blue p-1 rounded">
            <Layers size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900">Convertly</span>
        </div>
        <p className="text-sm text-gray-500">
          Designed and Developed by Silvercrest Creative Studios
        </p>
        <VisitCounter />
      </div>
    </div>
  </footer>
);

// Hero Section Component - Clean, enterprise style
const HeroSection: React.FC = () => (
  <div className="text-center max-w-3xl mx-auto pt-12 pb-8 px-4">
    <div className="opacity-0 animate-fade-in-up">
      <span className="inline-block text-brand-blue text-sm font-medium mb-4">
        Universal File Conversion
      </span>
    </div>
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight opacity-0 animate-fade-in-up-delay">
      Convert files with{' '}
      <span className="text-brand-blue">confidence</span>
    </h1>
    <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-in-up-delay-2">
      Fast, secure, and private file conversion. Everything happens in your browser — your files never leave your device.
    </p>
  </div>
);

// Main App Component
const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        {/* Navbar */}
        <Navbar />

        {/* Hero Section with Converter */}
        <main className="flex-grow">
          <div className="bg-white py-8">
            <HeroSection />
            <div id="converter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <Converter />
            </div>
          </div>

          {/* Features Section */}
          <FeaturesSection />

          {/* How It Works Section */}
          <HowItWorksSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;

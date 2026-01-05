import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import {
  Layers, Shield, Zap, Lock, Upload, Settings, Download,
  Menu, X, FileText, ChevronRight, ChevronDown,
  Image, FileSpreadsheet, File, CheckCircle, ArrowLeft,
  Keyboard, MessageCircle, Github,
  BookOpen, AlertTriangle
} from 'lucide-react';

// Types
type Page = 'home' | 'about' | 'contact' | 'privacy' | 'terms' | 'help';

// Local Storage Keys
const STORAGE_KEYS = {
  CONVERSIONS: 'convertly_total_conversions',
  VISITS: 'convertly_total_visits',
  FIRST_VISIT: 'convertly_first_visit',
};

// Stats Utilities - Real local data only
const getLocalStats = () => {
  const conversions = parseInt(localStorage.getItem(STORAGE_KEYS.CONVERSIONS) || '0', 10);
  const visits = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS) || '0', 10);
  return { conversions, visits };
};

const incrementVisits = () => {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.VISITS, (current + 1).toString());
  if (!localStorage.getItem(STORAGE_KEYS.FIRST_VISIT)) {
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, new Date().toISOString());
  }
  return current + 1;
};

export const incrementConversions = () => {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.CONVERSIONS) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.CONVERSIONS, (current + 1).toString());
  return current + 1;
};

// Keyboard Shortcuts Modal
const KeyboardShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['H'], description: 'Go to Home' },
    { keys: ['C'], description: 'Focus converter' },
    { keys: ['Esc'], description: 'Close modals/menus' },
    { keys: ['Tab'], description: 'Navigate between elements' },
    { keys: ['Enter'], description: 'Activate focused element' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} tabIndex={-1} className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden focus:outline-none">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Keyboard size={20} aria-hidden="true" /> Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close shortcuts modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            {shortcuts.map((shortcut, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-gray-700">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, j) => (
                    <kbd key={j} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-800">
                      {key}
                    </kbd>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
}> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={menuRef} className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2" aria-label="Mobile navigation">
          <button
            onClick={() => handleNav('home')}
            className={`block w-full text-left px-4 py-3 rounded-lg min-h-[44px] ${currentPage === 'home' ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`block w-full text-left px-4 py-3 rounded-lg min-h-[44px] ${currentPage === 'about' ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            About
          </button>
          <button
            onClick={() => handleNav('help')}
            className={`block w-full text-left px-4 py-3 rounded-lg min-h-[44px] ${currentPage === 'help' ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Help
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`block w-full text-left px-4 py-3 rounded-lg min-h-[44px] ${currentPage === 'contact' ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Contact
          </button>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => { handleNav('home'); setTimeout(() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="block w-full px-4 py-3 bg-brand-blue text-white rounded-lg text-center font-medium min-h-[44px]"
            >
              Start Converting
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar: React.FC<{
  onNavigate: (page: Page) => void;
  currentPage: Page;
  onShowShortcuts: () => void;
}> = ({ onNavigate, currentPage, onShowShortcuts }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-blue focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      <nav className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-shadow ${scrolled ? 'shadow-sm' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded-lg p-1"
              aria-label="Convertly - Go to homepage"
            >
              <div className="bg-brand-blue p-1.5 rounded-lg">
                <Layers size={20} className="text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-xl text-gray-900">Convertly</span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm transition-colors px-3 py-2 rounded-lg ${currentPage === 'home' ? 'text-brand-blue font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`text-sm transition-colors px-3 py-2 rounded-lg ${currentPage === 'about' ? 'text-brand-blue font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                About
              </button>
              <button
                onClick={() => onNavigate('help')}
                className={`text-sm transition-colors px-3 py-2 rounded-lg ${currentPage === 'help' ? 'text-brand-blue font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Help
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className={`text-sm transition-colors px-3 py-2 rounded-lg ${currentPage === 'contact' ? 'text-brand-blue font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Contact
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onShowShortcuts}
                className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded min-w-[44px] min-h-[44px] justify-center"
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard size={16} aria-hidden="true" />
              </button>
              <span className="text-sm text-gray-500 hidden md:block">
                100% Free & Private
              </span>
              {currentPage !== 'home' ? (
                <button
                  onClick={() => onNavigate('home')}
                  className="hidden sm:inline-flex bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors min-h-[44px] items-center"
                >
                  Start Converting
                </button>
              ) : (
                <button
                  onClick={() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden sm:inline-flex bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors min-h-[44px] items-center"
                >
                  Start Converting
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={onNavigate}
        currentPage={currentPage}
      />
    </>
  );
};

// Stats Section - Real local data only
const StatsSection: React.FC = () => {
  const [stats, setStats] = useState({ conversions: 0, visits: 0 });

  useEffect(() => {
    const localStats = getLocalStats();
    setStats(localStats);
  }, []);

  return (
    <section className="bg-gray-50 border-y border-gray-200 py-8" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">Your Usage Statistics</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.conversions.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Your Conversions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.visits.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Your Visits</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-gray-900">Unlimited</div>
            <div className="text-sm text-gray-500 mt-1">Free Forever</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Supported Formats Section
const FormatsSection: React.FC = () => {
  const formats = [
    { category: 'Images', icon: Image, items: ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP'] },
    { category: 'Documents', icon: FileText, items: ['PDF', 'DOCX', 'TXT', 'HTML'] },
    { category: 'Data', icon: FileSpreadsheet, items: ['JSON', 'CSV', 'XLSX'] },
  ];

  return (
    <section className="py-16 bg-white" aria-labelledby="formats-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="formats-heading" className="text-2xl font-bold text-gray-900 mb-3">Supported Formats</h2>
          <p className="text-gray-600">Convert between popular file formats instantly in your browser</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {formats.map(({ category, icon: Icon, items }) => (
            <div key={category} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                  <Icon size={20} className="text-brand-blue" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900">{category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <span key={item} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Card
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <article className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all">
    <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-4" aria-hidden="true">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </article>
);

// Features Section
const FeaturesSection: React.FC = () => (
  <section id="features" className="py-20 bg-gray-50 scroll-mt-20" aria-labelledby="features-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">Why Choose Convertly</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Secure file conversion that respects your privacy and delivers results instantly.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Shield size={24} className="text-brand-blue" />}
          title="100% Private"
          description="All conversions happen locally in your browser. Your files never leave your device or touch any external servers."
        />
        <FeatureCard
          icon={<Zap size={24} className="text-brand-blue" />}
          title="Lightning Fast"
          description="Instant conversions powered by modern browser APIs. No upload delays or server processing time."
        />
        <FeatureCard
          icon={<Lock size={24} className="text-brand-blue" />}
          title="No Registration"
          description="Start converting immediately. No sign-up, no email, no account required. Just drag and drop."
        />
        <FeatureCard
          icon={<File size={24} className="text-brand-blue" />}
          title="Multiple Formats"
          description="Support for images, documents, and data files. Convert between all common file formats."
        />
        <FeatureCard
          icon={<CheckCircle size={24} className="text-brand-blue" />}
          title="High Quality"
          description="Maintain the quality of your files during conversion with adjustable quality settings."
        />
        <FeatureCard
          icon={<Download size={24} className="text-brand-blue" />}
          title="Instant Download"
          description="Get your converted files immediately. No waiting, no email verification required."
        />
      </div>
    </div>
  </section>
);

// How It Works
const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="py-20 bg-white scroll-mt-20" aria-labelledby="how-it-works-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 id="how-it-works-heading" className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600">Three simple steps to convert your files</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gray-200" aria-hidden="true" />

        {[
          { num: '1', icon: Upload, title: 'Upload', desc: 'Drag and drop or click to select your file' },
          { num: '2', icon: Settings, title: 'Configure', desc: 'Choose your target format and quality settings' },
          { num: '3', icon: Download, title: 'Download', desc: 'Get your converted file instantly' },
        ].map(({ num, icon: Icon, title, desc }) => (
          <article key={num} className="text-center relative z-10">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mx-auto shadow-sm">
                <Icon size={28} className="text-gray-700" aria-hidden="true" />
              </div>
              <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-blue text-white text-sm font-semibold flex items-center justify-center" aria-hidden="true">
                {num}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step {num}: {title}</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">{desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// FAQ Section
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is Convertly really free?',
      a: 'Yes, Convertly is 100% free to use with no hidden costs, subscriptions, or premium tiers. All features are available to everyone.'
    },
    {
      q: 'Are my files secure?',
      a: 'Absolutely. All file conversions happen directly in your browser using JavaScript. Your files never leave your device and are never uploaded to any server. We have zero access to your data.'
    },
    {
      q: 'Do I need to create an account?',
      a: 'No. Convertly is designed to be used immediately without any registration, sign-up, or login. Just visit the site and start converting.'
    },
    {
      q: 'What file formats are supported?',
      a: 'We support images (JPG, PNG, WEBP, GIF, BMP), documents (PDF, DOCX, TXT, HTML), and data files (JSON, CSV, XLSX). You can convert between formats within each category.'
    },
    {
      q: 'Is there a file size limit?',
      a: 'The current limit is 50MB per file. Since processing happens in your browser, larger files may take longer depending on your device\'s capabilities.'
    },
    {
      q: 'Where is my data stored?',
      a: 'Your files are processed entirely in your browser memory and are never stored anywhere. Usage statistics (like your conversion count) are stored locally on your device using localStorage.'
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50 scroll-mt-20" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about Convertly</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[56px]"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform flex-shrink-0 ${openIndex === i ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`faq-answer-${i}`}
                className={`overflow-hidden transition-all duration-200 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}
                aria-hidden={openIndex !== i}
              >
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <section className="py-16 bg-brand-blue" aria-labelledby="cta-heading">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold text-white mb-4">
        Ready to convert your files?
      </h2>
      <p className="text-blue-100 mb-8 max-w-xl mx-auto">
        No sign-up required. Start converting for free right now.
      </p>
      <button
        onClick={() => { onNavigate('home'); setTimeout(() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
        className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[48px]"
      >
        Start Converting <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  </section>
);

// Footer
const Footer: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-brand-blue p-1.5 rounded-lg">
                <Layers size={18} className="text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-white text-lg">Convertly</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-sm">
              Free, private, and instant file conversion. All processing happens in your browser — your files never leave your device.
            </p>
            <p className="text-xs text-gray-500">
              Made with care by Gregorious Creative Studios
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors text-left">Home</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-left">About</button></li>
              <li><button onClick={() => onNavigate('help')} className="hover:text-white transition-colors text-left">Help</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors text-left">Contact</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Convertly. All rights reserved.</p>
          <p className="text-xs text-gray-500">No data collection. No cookies. No tracking.</p>
        </div>
      </div>
    </footer>
  );
};

// Hero Section
const HeroSection: React.FC = () => (
  <div className="text-center max-w-4xl mx-auto pt-12 md:pt-16 pb-8 px-4">
    <span className="inline-block text-brand-blue text-sm font-medium mb-4 bg-brand-blue/10 px-3 py-1 rounded-full">
      Free & No Sign-up Required
    </span>
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
      Convert files with{' '}
      <span className="text-brand-blue">complete privacy</span>
    </h1>
    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
      Fast, secure, and 100% private file conversion. Everything happens in your browser — your files never leave your device. No uploads, no accounts, no tracking.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
      <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" aria-hidden="true" /> Images</span>
      <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" aria-hidden="true" /> Documents</span>
      <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" aria-hidden="true" /> Data Files</span>
    </div>
  </div>
);

// ============ PAGES ============

// About Page
const AboutPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <main id="main-content" className="flex-grow">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 min-h-[44px]"
      >
        <ArrowLeft size={18} aria-hidden="true" /> Back to Home
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Convertly</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly was built with a simple mission: provide fast, free, and completely private file conversion for everyone.
            We believe that converting your files shouldn't require uploading them to unknown servers, creating accounts,
            or worrying about data privacy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-600 leading-relaxed">
            Unlike traditional file converters that upload your files to remote servers, Convertly processes everything
            directly in your web browser using modern JavaScript APIs. When you convert a file:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>Your file is read into your browser's memory</li>
            <li>Conversion happens locally on your device</li>
            <li>The converted file is downloaded directly to your computer</li>
            <li>No data is ever transmitted to any server</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Technology</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly uses industry-standard open-source libraries for file processing:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li><strong>PDF.js</strong> by Mozilla for PDF reading and rendering</li>
            <li><strong>Mammoth.js</strong> for Word document processing</li>
            <li><strong>SheetJS</strong> for Excel spreadsheet handling</li>
            <li><strong>HTML5 Canvas</strong> for image format conversion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly is developed and maintained by Gregorious Creative Studios, a team passionate about
            creating useful, privacy-respecting tools for the web. We believe that useful software
            doesn't need to compromise your privacy or require a subscription.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Open & Free</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly is completely free to use with no limits, no premium tiers, and no hidden fees.
            We don't show ads, we don't track you, and we don't sell your data (because we don't have any of it).
          </p>
        </section>
      </div>
    </div>
  </main>
);

// Contact Page
const ContactPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{name?: string; email?: string; message?: string}>({});

  const validateForm = () => {
    const newErrors: {name?: string; email?: string; message?: string} = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) newErrors.email = 'Please enter a valid email';
    if (!formState.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Store feedback locally since we have no backend
    const feedback = JSON.parse(localStorage.getItem('convertly_feedback') || '[]');
    feedback.push({ ...formState, timestamp: new Date().toISOString() });
    localStorage.setItem('convertly_feedback', JSON.stringify(feedback));
    setSubmitted(true);
  };

  return (
    <main id="main-content" className="flex-grow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 min-h-[44px]"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to Home
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Have questions, feedback, or suggestions? We'd love to hear from you.
              Since Convertly runs entirely in your browser, we don't have a traditional support
              system, but you can reach out through the following channels.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <Github size={20} className="text-brand-blue" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">GitHub</h3>
                  <p className="text-sm text-gray-600">Report bugs or request features on our GitHub repository.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-brand-blue" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Feedback Form</h3>
                  <p className="text-sm text-gray-600">Use the form to send us your thoughts. Stored locally for your reference.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 text-sm">
                  Your feedback has been saved locally. Since we don't have a backend,
                  consider sharing your feedback on our GitHub repository for a response.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', message: '' }); }}
                  className="mt-4 text-brand-blue hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-base ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Your name"
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-base ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-base resize-none ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Your message..."
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <p id="message-error" className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-medium py-3 px-4 rounded-lg transition-colors min-h-[48px]"
                >
                  Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

// Help Page
const HelpPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [openSection, setOpenSection] = useState<string | null>('getting-started');

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p>Using Convertly is simple:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Choose your file type category (Images, Documents, or Data)</li>
            <li>Drag and drop your file or click to browse</li>
            <li>Select your desired output format</li>
            <li>For images, adjust quality if needed</li>
            <li>Click "Convert File" and wait for processing</li>
            <li>Download your converted file</li>
          </ol>
        </div>
      )
    },
    {
      id: 'images',
      title: 'Image Conversion',
      icon: Image,
      content: (
        <div className="space-y-4">
          <p><strong>Supported input formats:</strong> JPG, PNG, WEBP, GIF, BMP</p>
          <p><strong>Supported output formats:</strong> JPG, PNG, WEBP, GIF, BMP</p>
          <p><strong>Quality settings:</strong> For JPG and WEBP formats, you can adjust the quality from 10% to 100%. Lower quality means smaller file size.</p>
          <p><strong>Transparency:</strong> PNG and WEBP support transparency. When converting to JPG or BMP, transparent areas become white.</p>
        </div>
      )
    },
    {
      id: 'documents',
      title: 'Document Conversion',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p><strong>PDF files can be converted to:</strong> TXT (text extraction), JPG/PNG (first page image), DOCX (text-based)</p>
          <p><strong>Word documents (DOCX) can be converted to:</strong> PDF, TXT, HTML</p>
          <p><strong>Excel files (XLSX) can be converted to:</strong> CSV, JSON, HTML</p>
          <p><strong>Note:</strong> Complex formatting may not be perfectly preserved. Text and basic structure are prioritized.</p>
        </div>
      )
    },
    {
      id: 'data',
      title: 'Data File Conversion',
      icon: FileSpreadsheet,
      content: (
        <div className="space-y-4">
          <p><strong>Supported formats:</strong> JSON, CSV, TXT</p>
          <p><strong>JSON to CSV:</strong> Converts array of objects to CSV format. Non-array JSON cannot be directly converted to CSV.</p>
          <p><strong>CSV to JSON:</strong> First row is used as headers. Results in an array of objects.</p>
          <p><strong>TXT conversion:</strong> Plain text conversion between formats.</p>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <p><strong>File too large:</strong> Maximum file size is 50MB. Try compressing your file first.</p>
          <p><strong>Conversion fails:</strong> Make sure your file isn't corrupted and is a valid format.</p>
          <p><strong>Slow conversion:</strong> Large files take longer. Processing happens on your device, so speed depends on your hardware.</p>
          <p><strong>Browser issues:</strong> Convertly works best on modern browsers (Chrome, Firefox, Safari, Edge). Make sure JavaScript is enabled.</p>
        </div>
      )
    },
  ];

  return (
    <main id="main-content" className="flex-grow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 min-h-[44px]"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to Home
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600 mb-8">Learn how to use Convertly effectively</p>

        <div className="space-y-3">
          {helpSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[56px]"
                  aria-expanded={openSection === section.id}
                  aria-controls={`help-${section.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-brand-blue" aria-hidden="true" />
                    <span className="font-medium text-gray-900">{section.title}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${openSection === section.id ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`help-${section.id}`}
                  className={`overflow-hidden transition-all duration-200 ${openSection === section.id ? 'max-h-[500px]' : 'max-h-0'}`}
                  aria-hidden={openSection !== section.id}
                >
                  <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                    {section.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

// Privacy Policy Page
const PrivacyPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <main id="main-content" className="flex-grow">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 min-h-[44px]"
      >
        <ArrowLeft size={18} aria-hidden="true" /> Back to Home
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly is committed to protecting your privacy. This policy explains how we handle your data — or rather, how we don't collect any of it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Collection</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>We collect absolutely no personal data.</strong> Convertly operates entirely in your browser. Your files are never uploaded to any server, and we have no access to your content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">File Processing</h2>
          <p className="text-gray-600 leading-relaxed">
            When you convert a file using Convertly:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>The file is read directly from your device into your browser's memory</li>
            <li>All conversion processing happens locally on your device</li>
            <li>The converted file is saved directly to your device</li>
            <li>No file data is ever transmitted over the internet</li>
            <li>No file data is stored after you close or refresh the page</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies & Tracking</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not use cookies, tracking pixels, analytics services, or any form of user tracking. There are no third-party scripts that monitor your behavior.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Local Storage</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly uses your browser's localStorage to store:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>Your conversion count (for your personal reference)</li>
            <li>Your visit count (for your personal reference)</li>
            <li>Any feedback you submit through the contact form (stored locally only)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            This data never leaves your device and can be cleared by clearing your browser data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly loads the following external resources:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>Google Fonts (Inter font family)</li>
            <li>Tailwind CSS from CDN</li>
            <li>PDF.js, Mammoth.js, SheetJS, jsPDF from CDNs for file processing</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            These are standard, trusted libraries. We don't control their privacy practices, but they are only used for functionality, not tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly does not knowingly collect any information from anyone, including children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this privacy policy from time to time. We will notify users of any changes by updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have questions about this privacy policy, please visit our <button onClick={() => onNavigate('contact')} className="text-brand-blue hover:underline">Contact page</button>.
          </p>
        </section>
      </div>
    </div>
  </main>
);

// Terms of Service Page
const TermsPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <main id="main-content" className="flex-grow">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 min-h-[44px]"
      >
        <ArrowLeft size={18} aria-hidden="true" /> Back to Home
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By using Convertly, you agree to these terms. If you don't agree, please don't use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly is a free, browser-based file conversion tool. All processing occurs locally on your device using JavaScript. No files are uploaded to external servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Use of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            You may use Convertly for any lawful purpose. You are responsible for the content you convert and must have the rights to that content. You agree not to use Convertly to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>Convert files you don't have the right to use</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the intellectual property rights of others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly and its original content, features, and functionality are owned by Gregorious Creative Studios. The conversion libraries used (PDF.js, Mammoth.js, SheetJS, jsPDF) are open-source software with their own licenses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>The service will be uninterrupted or error-free</li>
            <li>Conversions will be perfectly accurate in all cases</li>
            <li>All file formats will be supported</li>
            <li>The service will meet your specific requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            In no event shall Convertly or Gregorious Creative Studios be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
            <li>Loss of data or corruption of files</li>
            <li>Loss of profits or business interruption</li>
            <li>Any damages arising from your use of the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">File Size Limits</h2>
          <p className="text-gray-600 leading-relaxed">
            Convertly has a maximum file size limit of 50MB. This limit exists because all processing happens in your browser, and larger files may cause performance issues or browser crashes on some devices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have questions about these terms, please visit our <button onClick={() => onNavigate('contact')} className="text-brand-blue hover:underline">Contact page</button>.
          </p>
        </section>
      </div>
    </div>
  </main>
);

// Home Page
const HomePage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <main id="main-content" className="flex-grow">
    <div className="bg-gradient-to-b from-gray-50 to-white py-8">
      <HeroSection />
      <div id="converter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-20">
        <Converter />
      </div>
    </div>

    <StatsSection />
    <FormatsSection />
    <FeaturesSection />
    <HowItWorksSection />
    <FAQSection />
    <CTASection onNavigate={onNavigate} />
  </main>
);

// Main App
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Track visits on mount
  useEffect(() => {
    incrementVisits();
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('home');
      } else if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('home');
        setTimeout(() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Update document title based on page
  useEffect(() => {
    const titles: Record<Page, string> = {
      home: 'Convertly - Free Private File Converter',
      about: 'About - Convertly',
      contact: 'Contact - Convertly',
      help: 'Help - Convertly',
      privacy: 'Privacy Policy - Convertly',
      terms: 'Terms of Service - Convertly',
    };
    document.title = titles[currentPage];
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'help':
        return <HelpPage onNavigate={navigate} />;
      case 'privacy':
        return <PrivacyPage onNavigate={navigate} />;
      case 'terms':
        return <TermsPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <Navbar onNavigate={navigate} currentPage={currentPage} onShowShortcuts={() => setShowShortcuts(true)} />
        {renderPage()}
        <Footer onNavigate={navigate} />
        <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </ToastProvider>
  );
};

export default App;

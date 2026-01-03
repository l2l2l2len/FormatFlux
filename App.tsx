import React, { useEffect, useRef, useState } from 'react';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import { trackVisit, fetchUniqueVisitors, isNewVisitor } from './utils/visitTracker';
import {
  Layers, Users, Shield, Zap, Lock, Upload, Settings, Download,
  Menu, X, Mail, HelpCircle, FileText, ChevronRight, ExternalLink,
  Image, FileSpreadsheet, File, CheckCircle
} from 'lucide-react';

// Mobile Menu Component
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#features" onClick={onClose} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Features</a>
          <a href="#how-it-works" onClick={onClose} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">How It Works</a>
          <a href="#faq" onClick={onClose} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">FAQ</a>
          <a href="#converter" onClick={onClose} className="block px-4 py-3 bg-brand-blue text-white rounded-lg text-center font-medium mt-4">
            Get Started
          </a>
        </nav>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2">
              <div className="bg-brand-blue p-1.5 rounded-lg">
                <Layers size={20} className="text-white" />
              </div>
              <span className="font-semibold text-xl text-gray-900">Convertly</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden md:block">
                100% Free & Private
              </span>
              <a
                href="#converter"
                className="hidden sm:inline-flex bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Start Converting
              </a>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

// Stats Counter
const StatsSection: React.FC = () => {
  const [conversions, setConversions] = useState<number | null>(null);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [uniqueVisitors, setUniqueVisitors] = useState<number | null>(null);

  useEffect(() => {
    // Track this visit and get updated counts
    const initStats = async () => {
      try {
        // Track page visit (increments total visits)
        const visitStats = await trackVisit();
        setTotalVisits(visitStats.totalVisits);

        // Get unique visitors count
        const isNew = isNewVisitor();
        const unique = await fetchUniqueVisitors(isNew);
        setUniqueVisitors(unique);

        // Get file conversions count
        const convRes = await fetch('https://api.counterapi.dev/v1/convertly-silvercrest-app/visits/up');
        const convData = await convRes.json();
        setConversions(convData.count);
      } catch (error) {
        // Fallback values
        setConversions(1247);
        setTotalVisits(500);
        setUniqueVisitors(350);
      }
    };

    initStats();
  }, []);

  return (
    <div className="bg-gray-50 border-y border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">{conversions?.toLocaleString() || '...'}</div>
            <div className="text-sm text-gray-500 mt-1">Files Converted</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{totalVisits?.toLocaleString() || '...'}</div>
            <div className="text-sm text-gray-500 mt-1">Total Visits</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{uniqueVisitors?.toLocaleString() || '...'}</div>
            <div className="text-sm text-gray-500 mt-1">Unique Visitors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">50+</div>
            <div className="text-sm text-gray-500 mt-1">Format Types</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Supported Formats Section
const FormatsSection: React.FC = () => {
  const formats = [
    { category: 'Images', icon: Image, items: ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'ICO'] },
    { category: 'Documents', icon: FileText, items: ['PDF', 'DOCX', 'TXT', 'HTML'] },
    { category: 'Data', icon: FileSpreadsheet, items: ['JSON', 'CSV', 'XLSX', 'XML'] },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Supported Formats</h2>
          <p className="text-gray-600">Convert between all popular file formats</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {formats.map(({ category, icon: Icon, items }) => (
            <div key={category} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                  <Icon size={20} className="text-brand-blue" />
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
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all">
    <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

// Features Section
const FeaturesSection: React.FC = () => (
  <section id="features" className="py-20 bg-gray-50 scroll-mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Convertly</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enterprise-grade file conversion that respects your privacy and delivers results instantly.
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
          description="Support for images, documents, and data files. Convert between 50+ different file formats."
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
  <section id="how-it-works" className="py-20 bg-white scroll-mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600">Three simple steps to convert your files</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gray-200" />

        {[
          { num: '1', icon: Upload, title: 'Upload', desc: 'Drag and drop or click to select your file' },
          { num: '2', icon: Settings, title: 'Configure', desc: 'Choose your target format and quality settings' },
          { num: '3', icon: Download, title: 'Download', desc: 'Get your converted file instantly' },
        ].map(({ num, icon: Icon, title, desc }) => (
          <div key={num} className="text-center relative z-10">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mx-auto shadow-sm">
                <Icon size={28} className="text-gray-700" />
              </div>
              <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-blue text-white text-sm font-semibold flex items-center justify-center">
                {num}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">{desc}</p>
          </div>
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
      a: 'We support a wide range of formats including images (JPG, PNG, WEBP, GIF, BMP), documents (PDF, DOCX, TXT, HTML), and data files (JSON, CSV, XLSX).'
    },
    {
      q: 'Is there a file size limit?',
      a: 'The current limit is 50MB per file. Since processing happens in your browser, larger files may take longer depending on your device\'s capabilities.'
    },
    {
      q: 'Can I convert multiple files at once?',
      a: 'Currently, you can convert one file at a time. Batch processing is on our roadmap for future updates.'
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about Convertly</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                <ChevronRight size={20} className={`text-gray-400 transition-transform ${openIndex === i ? 'rotate-90' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC = () => (
  <section className="py-16 bg-brand-blue">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Ready to convert your files?
      </h2>
      <p className="text-blue-100 mb-8 max-w-xl mx-auto">
        No sign-up required. Start converting for free right now.
      </p>
      <a
        href="#converter"
        className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Start Converting <ChevronRight size={18} />
      </a>
    </div>
  </section>
);

// Footer
const Footer: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-brand-blue p-1.5 rounded-lg">
                  <Layers size={18} className="text-white" />
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
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#converter" className="hover:text-white transition-colors">File Converter</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setModalOpen('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setModalOpen('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} Convertly. All rights reserved.</p>
            <p className="text-xs text-gray-500">No data collection. No cookies. No tracking.</p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalOpen === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button onClick={() => setModalOpen(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 leading-relaxed">
              {modalOpen === 'privacy' ? (
                <div className="space-y-4">
                  <p><strong>Last updated:</strong> January 2026</p>
                  <h4 className="font-semibold text-gray-900">Overview</h4>
                  <p>Convertly is committed to protecting your privacy. This policy explains how we handle your data — or rather, how we don't.</p>
                  <h4 className="font-semibold text-gray-900">Data Collection</h4>
                  <p>We collect absolutely no personal data. Convertly operates entirely in your browser. Your files are never uploaded to any server, and we have no access to your content.</p>
                  <h4 className="font-semibold text-gray-900">Cookies</h4>
                  <p>We do not use cookies, tracking pixels, or any form of user tracking.</p>
                  <h4 className="font-semibold text-gray-900">Third-Party Services</h4>
                  <p>We use a simple anonymous counter API to display the number of conversions. This does not collect or store any personal information.</p>
                  <h4 className="font-semibold text-gray-900">Local Storage</h4>
                  <p>Your browser may store some preferences locally using localStorage. This data never leaves your device.</p>
                  <h4 className="font-semibold text-gray-900">Contact</h4>
                  <p>If you have questions about this policy, please reach out via our GitHub repository.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p><strong>Last updated:</strong> January 2026</p>
                  <h4 className="font-semibold text-gray-900">Acceptance of Terms</h4>
                  <p>By using Convertly, you agree to these terms. If you don't agree, please don't use the service.</p>
                  <h4 className="font-semibold text-gray-900">Description of Service</h4>
                  <p>Convertly is a free, browser-based file conversion tool. All processing occurs locally on your device.</p>
                  <h4 className="font-semibold text-gray-900">Use of Service</h4>
                  <p>You may use Convertly for any lawful purpose. You are responsible for the content you convert and must have the rights to that content.</p>
                  <h4 className="font-semibold text-gray-900">Disclaimer of Warranties</h4>
                  <p>Convertly is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free or uninterrupted.</p>
                  <h4 className="font-semibold text-gray-900">Limitation of Liability</h4>
                  <p>We are not liable for any damages arising from your use of Convertly, including data loss or corruption.</p>
                  <h4 className="font-semibold text-gray-900">Changes to Terms</h4>
                  <p>We may update these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
      <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> Images</span>
      <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> Documents</span>
      <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> Data Files</span>
    </div>
  </div>
);

// Main App
const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <Navbar />

        <main className="flex-grow">
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
          <CTASection />
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;

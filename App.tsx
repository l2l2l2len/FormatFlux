import React from 'react';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import { Layers, Users } from 'lucide-react';

const Navbar = () => (
  <nav className="border-b border-brand-black/5 bg-cream-50/80 backdrop-blur-md sticky top-0 z-50">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-brand-yellow p-1.5 rounded-lg text-brand-black border border-brand-black/10 shadow-sm">
          <Layers size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-brand-black">Convertly</span>
      </div>
    </div>
  </nav>
);

const VisitCounter = () => {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Use a unique namespace for this app to track visits
    // Using counterapi.dev which is free and public
    fetch('https://api.counterapi.dev/v1/convertly-silvercrest-app/visits/up')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(err => console.error("Counter API Error:", err));
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-brand-black/40 mt-4 bg-brand-black/5 px-4 py-1.5 rounded-full border border-brand-black/5">
      <Users size={12} />
      <span>{count.toLocaleString()} Visits</span>
    </div>
  );
};

const Footer = () => (
  <footer className="border-t border-brand-black/5 bg-cream-50 py-8 mt-auto">
    <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
      <div className="text-brand-black/60 text-sm font-medium">
        Designed and Developed by Silvercrest Creative Studios
      </div>
      <VisitCounter />
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream-50 text-brand-black flex flex-col font-sans selection:bg-brand-yellow selection:text-brand-black">
        {/* Subtle texture overlay */}
        <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-multiply" />
        
        <Navbar />
        
        <main className="flex-grow relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
          <div className="text-center space-y-6 mb-12 max-w-2xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-brand-black font-semibold text-xs tracking-wider uppercase mb-2 border border-brand-yellow/30">
              Premium File Tools
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-brand-black leading-[1.1]">
              Universal <span className="relative whitespace-nowrap"><span className="absolute -inset-1 bg-brand-yellow transform -skew-y-2 rounded-lg -z-10 opacity-80"></span>File Converter</span>
            </h1>
            <p className="text-brand-black/70 text-lg font-medium max-w-lg mx-auto leading-relaxed">
              Secure, fast, and 100% client-side. Convert your files without them ever leaving your browser.
            </p>
          </div>
          
          <Converter />
        </main>
        
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default App;
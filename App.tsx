import React from 'react';
import { Converter } from './components/Converter';
import { ToastProvider } from './components/ui/toast';
import { Layers } from 'lucide-react';

const Navbar = () => (
  <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <Layers size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">Convertly</span>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-auto">
    <div className="container mx-auto px-4 flex justify-center text-center">
      <div className="text-slate-500 text-sm">
        Designed and Developed by Silvercrest Creative Studios
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
        
        <Navbar />
        
        <main className="flex-grow relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
          <div className="text-center space-y-4 mb-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Universal File Converter
            </h1>
            <p className="text-slate-500 text-lg">
              Secure, fast, and 100% client-side. Convert images, documents, and data files without your data ever leaving your browser.
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
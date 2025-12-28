import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-5 py-4 rounded-xl shadow-premium border min-w-[320px] animate-in slide-in-from-right-full transition-all glass-strong",
              toast.type === 'success' && "border-emerald-500/30 text-emerald-400",
              toast.type === 'error' && "border-red-500/30 text-red-400",
              toast.type === 'info' && "border-accent-indigo/30 text-text-primary"
            )}
          >
            {toast.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="shrink-0" />}
            <span className="flex-1 text-sm font-semibold">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:bg-white/10 p-1 rounded-full transition-colors text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

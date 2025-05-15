import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToasterContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) {
        setToasts((prev) => prev.slice(1));
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToasterContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-in min-w-80 rounded-md p-4 shadow-md ${
              toast.type === 'success' 
                ? 'bg-success text-success-foreground' 
                : toast.type === 'error'
                ? 'bg-error text-error-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 rounded-full p-1 hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
}

export function Toaster() {
  return (
    <ToasterProvider>
      {/* This is just a component to render the provider */}
    </ToasterProvider>
  );
}
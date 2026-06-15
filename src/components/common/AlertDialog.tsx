import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertCircle, HelpCircle, CheckCircle, X } from 'lucide-react';

interface DialogConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AlertDialogContextType {
  showAlert: (message: string, title?: string, type?: 'alert' | 'success') => Promise<void>;
  showConfirm: (message: string, title?: string, confirmLabel?: string, cancelLabel?: string) => Promise<boolean>;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const resolverRef = useRef<((value: any) => void) | null>(null);

  const showAlert = useCallback((message: string, title = 'Alert', type: 'alert' | 'success' = 'alert') => {
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
      setConfig({
        title,
        message,
        type,
        confirmLabel: 'OK',
        onConfirm: () => {
          setConfig(null);
          resolve();
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, title = 'Confirm Action', confirmLabel = 'Confirm', cancelLabel = 'Cancel') => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setConfig({
        title,
        message,
        type: 'confirm',
        confirmLabel,
        cancelLabel,
        onConfirm: () => {
          setConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  const handleClose = () => {
    if (config) {
      if (config.type === 'confirm') {
        config.onCancel?.();
      } else {
        config.onConfirm?.();
      }
    }
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {config && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center select-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-[3px] transition-opacity animate-in fade-in duration-200"
            onClick={handleClose}
          />

          {/* Dialog Container */}
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm shadow-2xl p-5 mx-4 transform transition-all scale-100 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-350 p-1 rounded-md hover:bg-zinc-800/80 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {config.type === 'confirm' && (
                  <div className="w-8 h-8 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-500 animate-pulse">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                )}
                {config.type === 'alert' && (
                  <div className="w-8 h-8 rounded-full bg-rose-600/10 flex items-center justify-center text-rose-500 animate-bounce">
                    <AlertCircle className="w-4.5 h-4.5" />
                  </div>
                )}
                {config.type === 'success' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-500 animate-bounce">
                    <CheckCircle className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>

              {/* Text details */}
              <div className="flex-1 space-y-1.5 pr-4">
                <h3 className="text-sm font-semibold text-zinc-150 leading-none">{config.title}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium select-text">{config.message}</p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-2 border-t border-zinc-800/40 pt-3.5 mt-4">
              {config.type === 'confirm' && (
                <button
                  onClick={config.onCancel}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {config.cancelLabel}
                </button>
              )}
              <button
                onClick={config.onConfirm}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold text-white transition-all cursor-pointer ${
                  config.type === 'alert' 
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/20' 
                    : config.type === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/20'
                      : 'bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-950/20'
                }`}
                autoFocus
              >
                {config.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialogProvider');
  }
  return context;
}

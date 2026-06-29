"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: { label: string; onClick: () => void },
    id?: string
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const activeTimeouts = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (activeTimeouts.current[id]) {
      window.clearTimeout(activeTimeouts.current[id]);
      delete activeTimeouts.current[id];
    }
  }, []);

  const toast = useCallback((
    message: string,
    type: ToastType = "info",
    duration = 4000,
    action?: { label: string; onClick: () => void },
    id?: string
  ) => {
    const finalId = id || Math.random().toString(36).substring(2, 9);

    if (activeTimeouts.current[finalId]) {
      window.clearTimeout(activeTimeouts.current[finalId]);
      delete activeTimeouts.current[finalId];
    }

    setToasts((prev) => {
      const filtered = prev.filter((t) => t.id !== finalId);
      return [...filtered, { id: finalId, message, type, duration, action }];
    });

    if (duration > 0) {
      const timerId = window.setTimeout(() => {
        removeToast(finalId);
      }, duration);
      activeTimeouts.current[finalId] = timerId as any;
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => {
          const styles = {
            success: "border-[#10b981]/30 bg-[#064e3b]/85 text-[#a7f3d0]",
            info: "border-[#3b82f6]/30 bg-[#1e3a8a]/85 text-[#bfdbfe]",
            warning: "border-[#f59e0b]/30 bg-[#78350f]/85 text-[#fde68a]",
            error: "border-[#ef4444]/30 bg-[#7f1d1d]/85 text-[#fecaca]",
          }[item.type];

          const Icon = {
            success: CheckCircle,
            info: Info,
            warning: AlertTriangle,
            error: AlertCircle,
          }[item.type];

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-3.5 border backdrop-blur-md rounded-xl p-4 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in duration-300 ${styles}`}
              role="alert"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="shrink-0 mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 text-sm font-semibold leading-snug">
                  {item.message}
                </div>

                <button
                  onClick={() => removeToast(item.id)}
                  className="sm:hidden cursor-pointer rounded-lg p-1 transition-colors hover:bg-white/10 shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 opacity-75 hover:opacity-100" />
                </button>
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:ml-auto w-full sm:w-auto">
                {item.action && (
                  <button
                    onClick={() => {
                      item.action?.onClick();
                      removeToast(item.id);
                    }}
                    className="cursor-pointer rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-1.5 transition-colors text-center w-full sm:w-auto"
                  >
                    {item.action.label}
                  </button>
                )}

                <button
                  onClick={() => removeToast(item.id)}
                  className="hidden sm:block cursor-pointer rounded-lg p-1 transition-colors hover:bg-white/10 shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 opacity-75 hover:opacity-100" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

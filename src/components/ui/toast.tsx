"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  addToast: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    const duration = toast.duration || 3000;
    setToasts((prev) => [...prev, { ...toast, id, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container — Top Right */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />,
    info: <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />,
  };

  const progressColors = {
    success: "bg-success",
    error: "bg-destructive",
    info: "bg-accent",
  };

  const type = toast.type || "success";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="pointer-events-auto w-full bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        {icons[type]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-xs text-[#6B6B6B] leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-[#F5F5F0] transition-colors cursor-pointer text-[#9CA3AF] hover:text-[#6B6B6B]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Shrinking progress bar */}
      <div className="h-0.5 bg-[#F5F5F0]">
        <div
          className={`h-full ${progressColors[type]} toast-progress`}
          style={{
            animationDuration: `${(toast.duration || 3000) / 1000}s`,
          }}
        />
      </div>
    </motion.div>
  );
}

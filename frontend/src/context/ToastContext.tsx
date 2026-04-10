"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => string;
  dismiss: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (type !== "loading") {
      setTimeout(() => dismiss(id), 5000);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const error = useCallback((msg: string) => toast(msg, "error"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, success, error }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[320px] max-w-md
                ${t.type === "success" ? "bg-card border-green-500/20 text-foreground" : ""}
                ${t.type === "error" ? "bg-card border-red-500/20 text-foreground" : ""}
                ${t.type === "info" ? "bg-card border-primary/20 text-foreground" : ""}
                ${t.type === "loading" ? "bg-card border-border text-foreground" : ""}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${t.type === "success" ? "bg-green-500/10 text-green-500" : ""}
                ${t.type === "error" ? "bg-red-500/10 text-red-500" : ""}
                ${t.type === "info" ? "bg-primary/10 text-primary" : ""}
                ${t.type === "loading" ? "bg-muted text-muted-foreground" : ""}
              `}>
                {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                {t.type === "info" && <Info className="w-5 h-5" />}
                {t.type === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
              
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-40">
                  {t.type === 'loading' ? 'Processing' : t.type}
                </span>
                <p className="text-sm font-bold leading-tight">{t.message}</p>
              </div>

              <button 
                onClick={() => dismiss(t.id)}
                className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

"use client";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(t => setTimeout(() => removeToast(t.id), 3500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm animate-fade-in-up transition-all ${toast.type === "error" ? "bg-red-600/90 border border-red-300/40" : toast.type === "success" ? "bg-green-600/90 border border-green-300/40" : "bg-blue-700/90 border border-blue-300/40"}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

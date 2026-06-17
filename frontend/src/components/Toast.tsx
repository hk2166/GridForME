"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onDismiss
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  // Animate in on mount, auto-dismiss after 3s.
  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 10);
    const hide = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => onDismiss(toast.id), 300);
    }, 3000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [toast.id, onDismiss]);

  const colors: Record<ToastType, string> = {
    success:
      "border-gridwars-success/40 bg-gridwars-success/10 text-gridwars-success",
    error:
      "border-gridwars-danger/40 bg-gridwars-danger/10 text-gridwars-danger",
    info: "border-gridwars-border bg-gridwars-panel/80 text-gridwars-muted"
  };

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ"
  };

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl",
        "transition-all duration-300",
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
        colors[toast.type]
      ].join(" ")}
    >
      <span className="font-bold">{icons[toast.type]}</span>
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-2 opacity-50 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

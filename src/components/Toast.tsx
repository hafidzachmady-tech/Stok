"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ActionResult } from "@/lib/types";
import { Icon } from "./Icon";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };

type ToastContextValue = {
  notify: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    counter.current += 1;
    const id = counter.current;
    setItems((prev) => [...prev.slice(-2), { id, message, kind }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, kind === "error" ? 6000 : 4000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              item.kind === "success"
                ? "border-brand-200 bg-white text-ink"
                : item.kind === "error"
                  ? "border-danger-line bg-danger-bg text-danger"
                  : "border-line bg-white text-ink"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                item.kind === "success"
                  ? "bg-brand-700 text-white"
                  : item.kind === "error"
                    ? "bg-danger text-white"
                    : "bg-cream-200 text-ink"
              }`}
            >
              <Icon name={item.kind === "error" ? "alert" : "check"} size={13} />
            </span>
            <p className="leading-snug">{item.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}

/** Menampilkan hasil server action sebagai notifikasi, sekali per hasil. */
export function useActionToast(
  state: ActionResult | null,
  onSuccess?: () => void,
): void {
  const { notify } = useToast();
  const handled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) {
      notify(state.message ?? "Berhasil disimpan.", "success");
      onSuccess?.();
    } else {
      notify(state.error, "error");
    }
    // onSuccess sengaja tidak masuk dependency agar tidak memicu toast ulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, notify]);
}

"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Icon } from "./Icon";

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.ok ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-3 text-sm font-medium text-danger"
        >
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="username">
          Username
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="user" size={18} />
          </span>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
            autoFocus
            placeholder="cth. admin"
            className="input pl-11"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="lock" size={18} />
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Masukkan password"
            className="input px-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-cream hover:text-ink"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={showPassword}
          >
            <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Memeriksa…
          </>
        ) : (
          <>
            Masuk
            <Icon name="arrow-up" size={17} className="rotate-90" />
          </>
        )}
      </button>

      {demoMode ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-xs leading-relaxed text-brand-900">
          <p className="font-semibold">Mode demo aktif</p>
          <p className="mt-0.5">
            Masuk dengan username <span className="font-mono font-bold">admin</span> dan password{" "}
            <span className="font-mono font-bold">admin</span>. Ganti password demo sebelum dipublikasikan.
          </p>
        </div>
      ) : null}

      <p className="pt-1 text-center text-xs text-muted">
        Lupa password? Hubungi admin toko untuk pengaturan ulang.
      </p>
    </form>
  );
}

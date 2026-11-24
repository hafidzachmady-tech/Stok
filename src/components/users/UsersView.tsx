"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  resetPasswordAction,
  toggleUserActiveAction,
  updateUserAction,
} from "@/lib/actions/users";
import { formatDate, roleLabel } from "@/lib/format";
import type { ActionResult, Profile } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { RoleBadge } from "@/components/StatusBadge";
import { useActionToast, useToast } from "@/components/Toast";

function ActiveBadge({ active }: { active: number }) {
  return active ? (
    <span className="badge bg-ok-bg text-ok">
      <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Aktif
    </span>
  ) : (
    <span className="badge bg-danger-bg text-danger">
      <span className="h-1.5 w-1.5 rounded-full bg-danger" /> Nonaktif
    </span>
  );
}

export function UsersView({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [resetting, setResetting] = useState<Profile | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startToggle] = useTransition();

  function toggleActive(user: Profile) {
    const next = !user.is_active;
    setPendingId(user.id);
    startToggle(async () => {
      const result = await toggleUserActiveAction(user.id, next);
      setPendingId(null);
      if (result.ok) {
        notify(result.message ?? "Status akun diperbarui.", "success");
        router.refresh();
      } else {
        notify(result.error, "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {users.length} akun terdaftar · {users.filter((user) => user.role === "admin").length} admin
        </p>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary">
          <Icon name="plus" size={17} />
          Tambah Akun
        </button>
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-cream/70">
              <tr>
                <th className="th">Nama lengkap</th>
                <th className="th">Username</th>
                <th className="th">Peran</th>
                <th className="th">Status</th>
                <th className="th">Dibuat</th>
                <th className="th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-cream/40">
                  <td className="td">
                    <p className="font-semibold">{user.full_name}</p>
                    {user.id === currentUserId ? (
                      <p className="text-[11px] text-muted">Akun Anda</p>
                    ) : null}
                  </td>
                  <td className="td font-mono text-xs text-muted">{user.username}</td>
                  <td className="td">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="td">
                    <ActiveBadge active={user.is_active} />
                  </td>
                  <td className="td whitespace-nowrap text-muted">{formatDate(user.created_at)}</td>
                  <td className="td">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button type="button" onClick={() => setEditing(user)} className="btn-ghost btn-sm">
                        <Icon name="edit" size={14} /> Ubah
                      </button>
                      <button type="button" onClick={() => setResetting(user)} className="btn-ghost btn-sm">
                        <Icon name="lock" size={14} /> Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(user)}
                        disabled={user.id === currentUserId || pendingId === user.id}
                        className={`btn-ghost btn-sm ${
                          user.is_active ? "text-danger hover:bg-danger-bg" : "text-brand-700"
                        }`}
                      >
                        <Icon name={user.is_active ? "close" : "check"} size={14} />
                        {pendingId === user.id ? "…" : user.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2.5 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.full_name}</p>
                <p className="font-mono text-[11px] text-muted">{user.username}</p>
              </div>
              <ActiveBadge active={user.is_active} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              <RoleBadge role={user.role} />
              <span>Dibuat {formatDate(user.created_at)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setEditing(user)} className="btn-secondary btn-sm">
                <Icon name="edit" size={14} /> Ubah
              </button>
              <button type="button" onClick={() => setResetting(user)} className="btn-secondary btn-sm">
                <Icon name="lock" size={14} /> Reset
              </button>
              <button
                type="button"
                onClick={() => toggleActive(user)}
                disabled={user.id === currentUserId || pendingId === user.id}
                className="btn-secondary btn-sm col-span-2"
              >
                {user.is_active ? "Nonaktifkan akun" : "Aktifkan akun"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs leading-relaxed text-muted">
        <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-brand-700" />
        Password tidak pernah ditampilkan dan disimpan dalam bentuk hash. Menonaktifkan akun langsung
        mengakhiri semua sesi login pengguna tersebut.
      </p>

      {createOpen ? <CreateUserModal onClose={() => setCreateOpen(false)} /> : null}
      {editing ? (
        <EditUserModal
          key={editing.id}
          user={editing}
          isSelf={editing.id === currentUserId}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {resetting ? (
        <ResetPasswordModal key={resetting.id} user={resetting} onClose={() => setResetting(null)} />
      ) : null}
    </div>
  );
}

function FormError({ state }: { state: ActionResult | null }) {
  if (!state || state.ok) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
    >
      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
      {state.error}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    createUserAction,
    null,
  );
  useActionToast(state, () => {
    onClose();
    router.refresh();
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Tambah akun"
      description="Buat akun penjaga toko atau admin baru."
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" form="create-user-form" className="btn-primary" disabled={pending}>
            {pending ? "Menyimpan…" : "Buat akun"}
          </button>
        </>
      }
    >
      <form id="create-user-form" action={formAction} className="space-y-3.5">
        <FormError state={state} />
        <div>
          <label className="label" htmlFor="new-full-name">
            Nama lengkap <span className="text-danger">*</span>
          </label>
          <input
            id="new-full-name"
            name="full_name"
            required
            maxLength={80}
            placeholder="cth. Siti Aminah"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="new-username">
            Username <span className="text-danger">*</span>
          </label>
          <input
            id="new-username"
            name="username"
            required
            minLength={3}
            maxLength={40}
            autoCapitalize="none"
            placeholder="cth. siti"
            className="input font-mono"
          />
          <p className="hint">Huruf, angka, titik, garis bawah, atau strip.</p>
        </div>
        <div>
          <label className="label" htmlFor="new-password">
            Password awal <span className="text-danger">*</span>
          </label>
          <input
            id="new-password"
            name="password"
            type="text"
            required
            minLength={6}
            maxLength={128}
            className="input font-mono"
            placeholder="Minimal 6 karakter"
          />
          <p className="hint">Sampaikan password ini langsung kepada pengguna, lalu minta segera diganti.</p>
        </div>
        <div>
          <label className="label" htmlFor="new-role">
            Peran
          </label>
          <select id="new-role" name="role" defaultValue="penjaga" className="input">
            <option value="penjaga">Penjaga Toko</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  isSelf,
  onClose,
}: {
  user: Profile;
  isSelf: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateUserAction,
    null,
  );
  useActionToast(state, () => {
    onClose();
    router.refresh();
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={`Ubah akun ${user.username}`}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" form="edit-user-form" className="btn-primary" disabled={pending}>
            {pending ? "Menyimpan…" : "Simpan perubahan"}
          </button>
        </>
      }
    >
      <form id="edit-user-form" action={formAction} className="space-y-3.5">
        <input type="hidden" name="id" value={user.id} />
        <FormError state={state} />
        <div>
          <label className="label" htmlFor="edit-full-name">
            Nama lengkap <span className="text-danger">*</span>
          </label>
          <input
            id="edit-full-name"
            name="full_name"
            defaultValue={user.full_name}
            required
            maxLength={80}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="edit-role">
            Peran
          </label>
          <select
            id="edit-role"
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            className="input"
          >
            <option value="penjaga">Penjaga Toko</option>
            <option value="admin">Admin</option>
          </select>
          {isSelf ? (
            <>
              <input type="hidden" name="role" value="admin" />
              <p className="hint">Anda tidak dapat menurunkan peran akun sendiri.</p>
            </>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="edit-status">
            Status akun
          </label>
          <select
            id="edit-status"
            name="is_active"
            defaultValue={user.is_active ? "1" : "0"}
            disabled={isSelf}
            className="input"
          >
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </select>
          {isSelf ? (
            <>
              <input type="hidden" name="is_active" value="1" />
              <p className="hint">Akun yang sedang digunakan tidak dapat dinonaktifkan.</p>
            </>
          ) : null}
        </div>
        <p className="rounded-xl bg-cream px-3.5 py-2.5 text-xs text-muted">
          Username <span className="font-mono font-semibold text-ink">{user.username}</span> tidak dapat
          diubah. Peran: {roleLabel(user.role)}.
        </p>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose }: { user: Profile; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    resetPasswordAction,
    null,
  );
  useActionToast(state, onClose);

  return (
    <Modal
      open
      onClose={onClose}
      title={`Reset password ${user.username}`}
      description="Semua sesi login pengguna ini akan diakhiri."
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" form="reset-password-form" className="btn-primary" disabled={pending}>
            {pending ? "Menyimpan…" : "Simpan password baru"}
          </button>
        </>
      }
    >
      <form id="reset-password-form" action={formAction} className="space-y-3.5">
        <input type="hidden" name="id" value={user.id} />
        <FormError state={state} />
        <div>
          <label className="label" htmlFor="reset-password">
            Password baru <span className="text-danger">*</span>
          </label>
          <input
            id="reset-password"
            name="password"
            type="text"
            required
            minLength={6}
            maxLength={128}
            className="input font-mono"
            placeholder="Minimal 6 karakter"
          />
        </div>
        <div>
          <label className="label" htmlFor="reset-password-confirm">
            Ulangi password baru <span className="text-danger">*</span>
          </label>
          <input
            id="reset-password-confirm"
            name="password_confirm"
            type="text"
            required
            minLength={6}
            maxLength={128}
            className="input font-mono"
          />
        </div>
      </form>
    </Modal>
  );
}

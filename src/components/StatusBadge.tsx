import { STATUS_LABEL, stockStatus } from "@/lib/format";
import type { StockStatus } from "@/lib/types";
import { Icon } from "./Icon";

const STYLES: Record<StockStatus, string> = {
  aman: "bg-ok-bg text-ok",
  menipis: "bg-warn-bg text-warn",
  habis: "bg-danger-bg text-danger",
};

export function StatusBadge({
  stock,
  minimum,
  status,
}: {
  stock: number;
  minimum?: number;
  status?: StockStatus;
}) {
  const value = status ?? stockStatus(stock, minimum ?? 0);
  return (
    <span className={`badge ${STYLES[value]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          value === "aman" ? "bg-ok" : value === "menipis" ? "bg-warn" : "bg-danger"
        }`}
      />
      {STATUS_LABEL[value]}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  if (type === "masuk") {
    return (
      <span className="badge bg-ok-bg text-ok">
        <Icon name="arrow-down" size={13} /> Masuk
      </span>
    );
  }
  if (type === "keluar") {
    return (
      <span className="badge bg-warn-bg text-warn">
        <Icon name="arrow-up" size={13} /> Keluar
      </span>
    );
  }
  return (
    <span className="badge bg-cream-200 text-muted">
      <Icon name="refresh" size={13} /> Koreksi
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <span className="badge bg-brand-50 text-brand-800">
      <Icon name="shield" size={13} /> Admin
    </span>
  ) : (
    <span className="badge bg-cream-200 text-muted">
      <Icon name="user" size={13} /> Penjaga
    </span>
  );
}

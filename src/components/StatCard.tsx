import { Icon, type IconName } from "./Icon";

const TONES = {
  brand: "bg-brand-50 text-brand-800",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-cream-200 text-ink",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  suffix,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: IconName;
  tone?: keyof typeof TONES;
  suffix?: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {value}
        {suffix ? <span className="ml-1 text-sm font-semibold text-muted">{suffix}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

interface StatusChipProps {
  label: string;
  variant?: "primary" | "accent" | "muted";
}

const variantClasses: Record<NonNullable<StatusChipProps["variant"]>, string> = {
  primary: "bg-emerald-100 text-emerald-700",
  accent: "bg-indigo-100 text-indigo-700",
  muted: "bg-slate-100 text-slate-600",
};

const StatusChip = ({ label, variant = "muted" }: StatusChipProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
};

export default StatusChip;

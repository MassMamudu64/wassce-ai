interface StatusChipProps {
  label: string;
  variant?: "primary" | "accent" | "muted";
}

const variantClasses: Record<NonNullable<StatusChipProps["variant"]>, string> = {
  primary: "bg-emerald-500/20 text-emerald-200",
  accent: "bg-indigo-500/20 text-indigo-200",
  muted: "bg-slate-800/60 text-slate-300",
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

interface RadialGaugeProps {
  /** 0–100. */
  value: number;
  size?: number;
  stroke?: number;
  /** Tailwind text-* colour class for the progress arc. */
  colorClass?: string;
  trackClass?: string;
  label?: string;
  sublabel?: string;
  labelClass?: string;
  sublabelClass?: string;
}

/**
 * Lightweight SVG progress ring used across the dashboard hero and stat tiles.
 * Pure presentational — no animation library, just a stroke-dashoffset arc so it
 * stays cheap on low-end devices.
 */
export default function RadialGauge({
  value,
  size = 96,
  stroke = 9,
  colorClass = "text-emerald-500",
  trackClass = "text-slate-200 dark:text-slate-700",
  label,
  sublabel,
  labelClass = "text-slate-900 dark:text-white",
  sublabelClass = "text-slate-500",
}: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className={`text-lg font-bold leading-none ${labelClass}`}>{label}</span>}
        {sublabel && <span className={`mt-0.5 text-[9px] font-semibold uppercase tracking-wide ${sublabelClass}`}>{sublabel}</span>}
      </div>
    </div>
  );
}

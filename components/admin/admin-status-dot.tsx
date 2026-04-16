const toneClass: Record<
  "active" | "inactive" | "pending" | "expired" | "overdue" | "neutral",
  string
> = {
  active: "bg-emerald-500",
  inactive: "bg-jc-gray-400",
  pending: "bg-amber-500",
  expired: "bg-red-500",
  overdue: "bg-orange-500",
  neutral: "bg-jc-gray-300",
};

export function AdminStatusDot({
  tone,
  label,
}: {
  tone: keyof typeof toneClass;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${toneClass[tone]}`} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

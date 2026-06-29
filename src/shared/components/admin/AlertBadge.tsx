const COLORS = {
  orange: "bg-[#e07b28]/15 text-[#e07b28] border-[#e07b28]/30",
  violet: "bg-[#7469F4]/15 text-[#7469F4] border-[#7469F4]/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function AlertBadge({ label, color }: { label: string; color: keyof typeof COLORS }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${COLORS[color]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

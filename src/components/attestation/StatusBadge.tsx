import { cn } from "@/lib/utils";

const STATUS_MAP = {
  en_attente: { label: "En attente", class: "status-pending border" },
  validee: { label: "Validée", class: "status-approved border" },
  rejetee: { label: "Rejetée", class: "status-rejected border" },
} as const;

interface StatusBadgeProps {
  statut: keyof typeof STATUS_MAP;
}

export function StatusBadge({ statut }: StatusBadgeProps) {
  const config = STATUS_MAP[statut];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", config.class)}>
      {config.label}
    </span>
  );
}

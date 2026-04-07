import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "default" | "pending" | "approved" | "rejected";
}

const variantStyles = {
  default: "border-border bg-card",
  pending: "border-orange-200 bg-orange-50",
  approved: "border-emerald-200 bg-emerald-50",
  rejected: "border-red-200 bg-red-50",
};

const iconStyles = {
  default: "text-foreground bg-secondary",
  pending: "text-orange-700 bg-orange-100",
  approved: "text-emerald-700 bg-emerald-100",
  rejected: "text-red-700 bg-red-100",
};

const valueStyles = {
  default: "text-foreground",
  pending: "text-orange-700",
  approved: "text-emerald-700",
  rejected: "text-red-700",
};

export function StatCard({ title, value, icon: Icon, variant }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border p-5 animate-fade-in", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold mt-1", valueStyles[variant])}>{value}</p>
        </div>
        <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center", iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

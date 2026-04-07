import { cn } from "@/lib/utils";

interface EmployeeAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function EmployeeAvatar({ initials, size = "md" }: EmployeeAvatarProps) {
  return (
    <div className={cn("rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center shrink-0", sizeMap[size])}>
      {initials}
    </div>
  );
}

<script setup lang="ts">
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: any; // We'll pass the lucide component
  variant: "default" | "pending" | "approved" | "rejected";
}

const props = defineProps<StatCardProps>();

const variantStyles = {
  default: "border-primary/20 bg-primary/5",
  pending: "border-orange-200 bg-orange-50",
  approved: "border-emerald-200 bg-emerald-50",
  rejected: "border-red-200 bg-red-50",
};

const iconStyles = {
  default: "text-primary bg-primary/10",
  pending: "text-orange-700 bg-orange-100",
  approved: "text-emerald-700 bg-emerald-100",
  rejected: "text-red-700 bg-red-100",
};

const valueStyles = {
  default: "text-primary",
  pending: "text-orange-700",
  approved: "text-emerald-700",
  rejected: "text-red-700",
};
</script>

<template>
  <div :class="cn('rounded-lg border p-5', variantStyles[props.variant])">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
        <p :class="cn('text-3xl font-bold mt-1', valueStyles[props.variant])">{{ value }}</p>
      </div>
      <div :class="cn('h-11 w-11 rounded-lg flex items-center justify-center', iconStyles[props.variant])">
        <component :is="icon" class="h-5 w-5" />
      </div>
    </div>
  </div>
</template>

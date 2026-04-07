<script setup lang="ts">
import { cn } from "@/lib/utils";

interface EmployeeAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<EmployeeAvatarProps>(), {
  size: "md"
});

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};
</script>

<template>
  <div :class="cn('rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center shrink-0', sizeMap[props.size])">
    {{ initials }}
  </div>
</template>

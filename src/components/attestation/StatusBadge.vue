<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

const STATUS_MAP = {
  en_attente: { label: "En attente", class: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))/0.2]" },
  validee: { label: "Validée", class: "bg-[hsl(var(--status-approved-bg))] text-[hsl(var(--status-approved))] border-[hsl(var(--status-approved))/0.2]" },
  rejetee: { label: "Rejetée", class: "bg-[hsl(var(--status-rejected-bg))] text-[hsl(var(--status-rejected))] border-[hsl(var(--status-rejected))/0.2]" },
} as const;

interface StatusBadgeProps {
  statut: keyof typeof STATUS_MAP;
}

const props = defineProps<StatusBadgeProps>();

const config = computed(() => STATUS_MAP[props.statut]);
</script>

<template>
  <span :class="cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config.class)">
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";
import { RouterLink } from "vue-router";

interface NavLinkProps {
  to: string | object;
  activeClassName?: string;
  class?: string;
}

const props = defineProps<NavLinkProps>();
</script>

<template>
  <RouterLink :to="to" custom v-slot="{ href, navigate, isActive, isExactActive }">
    <a :href="href" @click="navigate" :class="cn(props.class, (isActive || isExactActive) && activeClassName)">
      <slot />
    </a>
  </RouterLink>
</template>

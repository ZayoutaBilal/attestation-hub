<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner'
import { TooltipProvider } from 'radix-vue'
</script>

<template>
  <TooltipProvider>
    <Sonner />
    <router-view />
  </TooltipProvider>
</template>

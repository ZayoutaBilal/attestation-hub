<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();

onMounted(() => {
  console.error("404 Error: User attempted to access non-existent route:", route.path);
});

watch(() => route.path, (newPath) => {
  console.error("404 Error: User attempted to access non-existent route:", newPath);
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted">
    <div class="text-center">
      <h1 class="mb-4 text-4xl font-bold">404</h1>
      <p class="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
      <router-link to="/" class="text-primary underline hover:text-primary/90">
        Return to Home
      </router-link>
    </div>
  </div>
</template>

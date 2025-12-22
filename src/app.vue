<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { initializeTheme } = useTheme();

onMounted(() => {
  initializeTheme();
});
</script>

<style></style>

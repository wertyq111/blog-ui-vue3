<template>
  <div class="admin-split-workspace">
    <aside class="admin-split-workspace__sidebar">
      <slot name="sidebar" />
    </aside>

    <section class="admin-split-workspace__content">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

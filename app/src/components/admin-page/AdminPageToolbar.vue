<template>
  <div class="admin-page-toolbar">
    <div class="admin-page-toolbar__copy">
      <h2>{{ title }}</h2>
      <p v-if="description">
        {{ description }}
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="admin-page-toolbar__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

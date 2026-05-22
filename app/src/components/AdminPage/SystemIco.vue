<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="path"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number;
  }>(),
  {
    size: 14,
  }
);

const ICO_PATHS: Record<string, string> = {
  search: '<circle cx="10" cy="10" r="6"/><path d="M14 14l4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
  refresh:
    '<path d="M4 12a8 8 0 0114-5l3 3M20 12a8 8 0 01-14 5l-3-3"/><path d="M17 4v4h-4M7 20v-4h4"/>',
  full: '<path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/>',
  edit: '<path d="M4 16L15 5l3 3-11 11H4v-3z"/>',
  key: '<circle cx="8" cy="15" r="3"/><path d="M11 15l9-9-2-2-2 2-2-2-2 2"/>',
  density: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.4a7 7 0 000-2.8l2-1.6-2-3.4-2.4 1a7 7 0 00-2.4-1.4L14.2 2.5h-4l-.4 2.7a7 7 0 00-2.4 1.4l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.8l-2 1.6 2 3.4 2.4-1a7 7 0 002.4 1.4l.4 2.7h4l.4-2.7a7 7 0 002.4-1.4l2.4 1 2-3.4z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  expand: '<path d="M4 14v6h6M20 10V4h-6M4 4l6 6M20 20l-6-6"/>',
  collapse: '<path d="M9 4v6H3M15 20v-6h6M3 10l6-6M21 14l-6 6"/>',
  chevRight: '<path d="M9 6l6 6-6 6"/>',
};

const path = computed(() => ICO_PATHS[props.name] || "");
</script>

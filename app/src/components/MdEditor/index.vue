<template>
  <MdEditor
    v-model="modelValue"
    :theme="isDark ? 'dark' : 'light'"
    :style="{ height: height }"
    :disabled="!editable"
    :preview-only="previewOnly"
    :toolbars="toolbars"
    class="md-editor-wrapper"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { useSettingsStore } from "@/store/modules/settings";

const settingsStore = useSettingsStore();
const isDark = computed(() => settingsStore.effectiveDarkMode);

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "400px",
  },
  editable: {
    type: Boolean,
    default: true,
  },
  previewOnly: {
    type: Boolean,
    default: false,
  },
  toolbars: {
    type: Array,
    default: () => [
      "bold",
      "underline",
      "italic",
      "-",
      "title",
      "strikeThrough",
      "sub",
      "sup",
      "quote",
      "unorderedList",
      "orderedList",
      "task",
      "-",
      "codeComposite",
      "code",
      "link",
      "image",
      "table",
      "mermaid",
      "katex",
      "-",
      "revoke",
      "next",
      "save",
      "=",
      "pageFullscreen",
      "fullscreen",
      "preview",
      "htmlPreview",
      "catalog",
      "github",
    ],
  },
});

const emit = defineEmits(["update:modelValue"]);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style scoped>
.md-editor-wrapper {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
</style>

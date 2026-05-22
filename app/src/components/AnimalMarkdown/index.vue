<!-- 动森风 Markdown 编辑/预览组件：包装 md-editor-v3 + 动森皮肤 -->
<template>
  <MdEditor v-model="model" v-bind="editorAttrs" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { useSettingsStore } from "@/store/modules/settings";

const DEFAULT_TOOLBARS = [
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
  "code",
  "link",
  "image",
  "table",
  "mermaid",
  "katex",
  "-",
  "revoke",
  "next",
  "=",
  "pageFullscreen",
  "fullscreen",
  "preview",
  "catalog",
];

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    height?: string;
    editable?: boolean;
    previewOnly?: boolean;
    toolbars?: string[];
  }>(),
  {
    modelValue: "",
    height: "400px",
    editable: true,
    previewOnly: false,
  }
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const settingsStore = useSettingsStore();
const isDark = computed(() => settingsStore.effectiveDarkMode);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// md-editor-v3 prop 类型较复杂，用 Record 透传，避免逐 prop 严格校验
const editorAttrs = computed<Record<string, any>>(() => ({
  class: ["animal-md", { "animal-md--preview": props.previewOnly }],
  theme: isDark.value ? "dark" : "light",
  style: { height: props.height },
  previewOnly: props.previewOnly,
  disabled: !props.editable,
  toolbars: props.toolbars ?? DEFAULT_TOOLBARS,
}));
</script>

<style lang="scss" scoped>
.animal-md {
  --md-bk-color: #fdfdf5;
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  font-family: "M PLUS Rounded 1c", "Noto Sans SC", sans-serif;

  :deep(.md-editor-toolbar-wrapper) {
    background: rgba(230, 249, 246, 0.5);
    border-bottom: 1.5px solid var(--ai-border, #e8e2d6);
  }
  :deep(.md-editor-toolbar-item:hover) {
    background: rgba(25, 200, 185, 0.14);
    color: var(--ai-primary, #19c8b9);
  }
  :deep(.md-editor-preview) {
    color: var(--ai-text, #794f27);
  }
  :deep(.md-editor-preview a) {
    color: var(--ai-primary-active, #11a89b);
  }
  :deep(blockquote) {
    border-left-color: var(--ai-primary, #19c8b9);
  }
}

.animal-md--preview {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
</style>

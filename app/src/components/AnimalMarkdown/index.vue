<!-- 动森风 Markdown 编辑/预览组件：包装 md-editor-v3 + 动森皮肤 -->
<template>
  <MdPreview v-if="previewOnly" v-model="model" v-bind="previewAttrs" />
  <MdEditor v-else ref="editorRef" v-model="model" v-bind="editorAttrs" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { MdEditor, MdPreview, type ExposeParam } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import "md-editor-v3/lib/preview.css";
import { useSettingsStore } from "@/store/modules/settings";
import { registerWorkDailyIcons } from "@/utils/workDailyIcons";
import WorkDailyAPI from "@/api/develop/work-daily";

// 注册工作日常动森图标渲染（emoji → SVG），全局一次、幂等
registerWorkDailyIcons();

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
  // 用 pageFullscreen（页面内全屏，编辑器自身 position:fixed 铺满视口，无浏览器"按 esc"提示栏）。
  // 不用浏览器原生 fullscreen，避免弹出 esc 提示条。
  // 注意：fixed 全屏编辑器会被 animal-modal 祖先的 clip-path blob 裁切，
  // 已在下方全局样式里用 :has(.md-editor-fullscreen) 中和祖先的 clip-path/overflow。
  "pageFullscreen",
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

const editorRef = ref<ExposeParam>();

// 逐个上传，失败的丢弃（request 拦截器已弹错误提示），只把成功的地址交回编辑器
const uploadImages = async (files: File[]) => {
  const results = await Promise.all(
    files.map((file) =>
      WorkDailyAPI.uploadImage(file)
        .then((res) => res.url)
        .catch(() => null)
    )
  );
  return results.filter((url): url is string => !!url);
};

// 工具栏「上传图片」与粘贴图片都走这里：md-editor 拿到 urls 后自动插入 ![](url)
const handleUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  callback(await uploadImages(files));
};

// 拖拽图片：md-editor-v3 不内置，CodeMirror 默认会把文件当文本读（等于什么都不插）。
// 这里先 preventDefault 掐掉 CodeMirror 的默认 drop，再自己上传并在光标处插入。
const handleDrop = async (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
    file.type.startsWith("image/")
  );
  if (!files.length) {
    return;
  }
  event.preventDefault();
  const urls = await uploadImages(files);
  if (!urls.length) {
    return;
  }
  editorRef.value?.insert(() => ({
    targetValue: urls.map((url) => `![图片](${url})`).join("\n"),
    select: false,
    deviationStart: 0,
    deviationEnd: 0,
  }));
};

// md-editor-v3 prop 类型较复杂，用 Record 透传，避免逐 prop 严格校验
const editorAttrs = computed<Record<string, any>>(() => ({
  class: ["animal-md"],
  theme: isDark.value ? "dark" : "light",
  style: { height: props.height },
  previewOnly: false,
  disabled: !props.editable,
  toolbars: props.toolbars ?? DEFAULT_TOOLBARS,
  onUploadImg: handleUploadImg,
  onDrop: handleDrop,
}));

const previewAttrs = computed<Record<string, any>>(() => ({
  class: ["animal-md", "animal-md--preview"],
  theme: isDark.value ? "dark" : "light",
  style: { height: props.height },
  previewOnly: true,
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
  // 全局 reset 的 `ul, li { padding:0; list-style:none }` 会清掉预览区的项目符号/序号，
  // 这里只在 Markdown 预览内把列表标记和缩进补回来，避免 1)/- 等结构在预览里糊成一团。
  :deep(.md-editor-preview) ul {
    list-style: disc;
    padding-left: 1.6em;
  }
  :deep(.md-editor-preview) ol {
    list-style: decimal;
    padding-left: 1.6em;
  }
  :deep(.md-editor-preview) li {
    list-style: inherit;
  }
  :deep(.md-editor-preview a) {
    color: var(--ai-primary-active, #11a89b);
  }
  // 工作日常类别图标：把内容里的 emoji 升级成的行内 SVG（见 @/utils/workDailyIcons）
  // 用属性选择器兜底，避免 md-editor sanitize 去掉 class 后失效
  :deep(.md-editor-preview img.wd-cat-ico),
  :deep(.md-editor-preview img[src*="/icons/work-daily/"]) {
    display: inline-block;
    width: 1.18em;
    height: 1.18em;
    margin: 0 0.32em 0 0;
    vertical-align: -0.24em;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: none;
  }
  :deep(blockquote) {
    border-left-color: var(--ai-primary, #19c8b9);
  }
}

.animal-md--preview {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent !important;
}
</style>

<style lang="scss">
/*
 * md-editor 页面全屏（.md-editor-fullscreen = position:fixed inset:0 z-index:10000）时，
 * animal-modal 祖先的 blob clip-path 会把这个 fixed 编辑器裁成异形（露出一坨白 blob）。
 * position:fixed 逃不出祖先 clip-path，故在编辑器进入全屏时，
 * 用 :has() 反选并中和承载它的弹窗祖先的 clip-path / overflow，让全屏编辑器干净铺满视口。
 */
.animal-modal:has(.md-editor-fullscreen),
.animal-modal__body:has(.md-editor-fullscreen),
.animal-modal__content:has(.md-editor-fullscreen),
.admin-animal-modal__content:has(.md-editor-fullscreen) {
  clip-path: none !important;
  overflow: visible !important;
}
</style>


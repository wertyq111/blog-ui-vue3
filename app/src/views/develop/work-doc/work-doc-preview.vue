<!-- 工作文档预览组件 (动森风格) -->
<template>
  <AdminAnimalModal
    v-model:visible="visibleModel"
    :width="fullscreen ? '100vw' : '85%'"
    :show-footer="false"
    :class="['doc-preview-modal', { 'is-fullscreen': fullscreen }]"
    @close="closePreview"
  >
    <!-- 自定义头部 Title Slot -->
    <template #title>
      <div class="doc-preview-title">
        <div class="doc-preview-name">
          <div class="doc-preview-name__text">{{ previewDoc.title }}</div>
          <div class="doc-preview-meta">
            <div v-if="previewDoc.category" class="doc-preview-meta__item">
              <el-icon><Folder /></el-icon>
              <span>{{ previewDoc.category.name }}</span>
            </div>
            <div v-if="previewDoc.templateType" class="doc-preview-meta__item">
              <el-icon><Notebook /></el-icon>
              <span>{{ templateLabel(previewDoc.templateType) }}</span>
            </div>
            <div v-if="previewDoc.source" class="doc-preview-meta__item">
              <el-icon><Grid /></el-icon>
              <span>{{ previewDoc.source }}</span>
            </div>
            <div v-if="previewDoc.updateTime" class="doc-preview-meta__item">
              <el-icon><Clock /></el-icon>
              <span>{{ previewDoc.updateTime }}</span>
            </div>
          </div>
        </div>
        <div class="doc-preview-actions">
          <el-tooltip :content="fullscreen ? '退出全屏' : '全屏查看'" placement="top">
            <Button class="doc-icon-button" type="default" size="small" @click="toggleFullscreen">
              <div :class="'i-svg:' + (fullscreen ? 'fullscreen-exit' : 'fullscreen')" />
            </Button>
          </el-tooltip>
          <el-tooltip content="复制引用链接" placement="top">
            <Button class="doc-icon-button" type="primary" size="small" @click="copyMarkdownLink">
              <el-icon><DocumentCopy /></el-icon>
            </Button>
          </el-tooltip>
          <el-tooltip content="关闭详情" placement="top">
            <Button class="doc-icon-button" type="default" size="small" @click="closePreview">
              <el-icon><Close /></el-icon>
            </Button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 主体内容 -->
    <div
      v-loading="loading"
      class="doc-preview-shell-container"
      :class="{ 'is-fullscreen': fullscreen }"
    >
      <div class="doc-preview-shell">
        <div class="doc-preview-hero">
          <div class="doc-preview-hero__eyebrow">Work Doc</div>
          <div class="doc-preview-hero__summary">
            <span>{{ previewDoc.source || "未设置项目来源" }}</span>
            <span class="doc-preview-hero__divider">/</span>
            <span>{{ previewDoc.category ? previewDoc.category.name : "未分类" }}</span>
          </div>
          <div v-if="previewDoc.tags && previewDoc.tags.length" class="doc-preview-hero__tags">
            <AnimalTag
              v-for="(tag, index) in previewDoc.tags"
              :key="index"
              type="info"
              class="doc-preview-hero__tag"
            >
              {{ tag }}
            </AnimalTag>
          </div>
        </div>

        <div class="doc-preview-body">
          <AnimalMarkdown :model-value="previewDoc.content" preview-only height="auto" />
        </div>
      </div>
    </div>
  </AdminAnimalModal>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { computed, ref, watch } from "vue";

import { Button } from "animal-island-vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import WorkDocAPI from "@/api/develop/work-doc";
import type { WorkDocItem } from "@/types/api/work-doc";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";

const props = defineProps<{
  visible: boolean;
  data: WorkDocItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const visibleModel = computed<boolean>({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const previewDoc = ref<WorkDocItem>({ title: "", content: "" });
const loading = ref(false);
const fullscreen = ref(false);

const templates = [
  { label: "自定义", value: "custom" },
  { label: "故障排查", value: "troubleshooting" },
  { label: "方案设计", value: "design" },
  { label: "知识点", value: "knowledge" },
];

function templateLabel(value: string): string {
  const item = templates.find((t) => t.value === value);
  return item ? item.label : value;
}

function toggleFullscreen(): void {
  fullscreen.value = !fullscreen.value;
}

function closePreview(): void {
  emit("update:visible", false);
}

async function copyMarkdownLink(): Promise<void> {
  if (!previewDoc.value || !previewDoc.value.id) {
    message.error("文档未保存");
    return;
  }
  const link = `[${previewDoc.value.title}](/develop/work-doc?id=${previewDoc.value.id})`;

  // 兼容非 HTTPS 环境的复制实现 (避免 navigator.clipboard 在非安全上下文中为 undefined)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(link);
      message.success("Markdown 链接已复制");
    } catch {
      message.error("复制失败");
    }
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = link;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const success = document.execCommand("copy");
      if (success) {
        message.success("Markdown 链接已复制");
      } else {
        message.error("复制失败");
      }
    } catch {
      message.error("复制失败");
    }
    document.body.removeChild(textArea);
  }
}

watch(
  () => props.visible,
  async (visible) => {
    if (visible && props.data?.id) {
      loading.value = true;
      fullscreen.value = false; // 每次打开重置为非全屏
      try {
        const info = await WorkDocAPI.getInfo(props.data.id);
        previewDoc.value = info;
      } catch (e: any) {
        message.error(e.message || "获取文档详情失败");
      } finally {
        loading.value = false;
      }
    }
  }
);
</script>

<style lang="scss" scoped>
.doc-preview-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
}

.doc-preview-name {
  min-width: 0;
  flex: 1;
}

.doc-preview-name__text {
  font-size: 22px;
  font-weight: 800;
  color: var(--ai-text, #794f27);
  line-height: 1.4;
}

.doc-preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 10px;
}

.doc-preview-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid var(--ai-border, #e8e2d6);
  color: var(--ai-text-2, #9f927d);
  font-size: 12px;
  font-weight: 600;

  .el-icon {
    color: var(--ai-primary-active, #11a89b);
    font-size: 14px;
  }
}

.doc-preview-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}

.doc-icon-button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px #bdaea0;

  .el-icon {
    font-size: 16px;
  }

  /* 全屏切换用的 UnoCSS i-svg 图标（与导航栏同款），需显式尺寸 */
  :deep([class^="i-svg:"]) {
    width: 16px;
    height: 16px;
  }

  &.animal-btn--primary {
    box-shadow: 0 4px var(--ai-shadow-soft-strong, #a89878);
  }
}

.doc-preview-shell-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  box-sizing: border-box;
}

.doc-preview-shell {
  padding: 24px;
  background: linear-gradient(180deg, #fdfdfb 0%, #f7f3df 100%);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  width: 100%;
  box-sizing: border-box;
}

.doc-preview-hero {
  margin-bottom: 20px;
  padding: 18px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(25, 200, 185, 0.12), rgba(134, 214, 122, 0.08));
  border: 2px solid rgba(25, 200, 185, 0.18);
}

.doc-preview-hero__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ai-primary-active, #11a89b);
}

.doc-preview-hero__summary {
  margin-top: 8px;
  color: var(--ai-text, #794f27);
  font-size: 14px;
  font-weight: 600;
}

.doc-preview-hero__divider {
  margin: 0 10px;
  color: var(--ai-border, #e8e2d6);
}

.doc-preview-hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.doc-preview-hero__tag {
  background: rgba(255, 255, 255, 0.95) !important;
}

.doc-preview-body {
  background: #fdfdf5;
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 20px;
  padding: 24px;
  min-height: 350px;
}
</style>

<style lang="scss">
/*
 * 动森 Modal 根节点是 <Teleport to="body">，外部传入的 class（.doc-preview-modal）
 * 会被 Vue 当作 fallthrough 属性丢弃，无法落到任何 DOM 元素上；同时库默认
 * .animal-modal__body 的 padding(48px 48px 32px) 是 scoped 选择器。
 * 因此改用 :has() 通过弹窗内唯一内容标记 .doc-preview-shell-container 反选到本弹窗，
 * 既能精准命中又不影响其它动森弹窗。
 */
.animal-modal:has(.doc-preview-shell-container) {
  max-width: 90vw !important;
  max-height: 90vh !important;
  width: 90vw !important;
  height: 90vh !important;

  .animal-modal__body {
    padding: 66px 154px 52px 155px !important;
    /* 去掉动森 blob 异形裁剪，避免标题/四角内容被弯角切掉；改用普通圆角 */
    clip-path: none !important;
    border-radius: 32px !important;
  }

  .animal-modal__header {
    padding-bottom: 20px;
    border-bottom: 2px dashed var(--ai-border, #e8e2d6);
    margin-bottom: 16px;
    flex-shrink: 0;

    /* 隐藏原生 close，使用自定义关闭按钮 */
    .animal-modal__close {
      display: none;
    }
  }

  .animal-modal__content {
    flex: 1 !important;
    overflow-y: auto !important;
    font-size: 14px !important;
    font-weight: normal !important;
    color: var(--ai-text, #794f27) !important;
    padding-bottom: 0 !important;

    /* 动森风格浅黄极细滚动条 */
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background: #f7f5ee;
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e6dfcb;
      border-radius: 10px;
      &:hover {
        background: #c8bd9f;
      }
    }
  }

  .admin-animal-modal__content {
    max-height: none !important; /* 移除 55vh 限制，由外层弹性展示 */
    overflow-y: visible !important;
    padding-right: 0 !important;
  }
}

/* 全屏态：通过内容容器上的 is-fullscreen 标记反选 */
.animal-modal:has(.doc-preview-shell-container.is-fullscreen) {
  max-width: 100vw !important;
  max-height: 100vh !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;

  .animal-modal__body {
    padding: 32px 48px !important;
    border-radius: 0 !important;
    clip-path: none !important;
  }

  .animal-modal__content .doc-preview-body {
    min-height: calc(100vh - 280px) !important;
  }
}
</style>

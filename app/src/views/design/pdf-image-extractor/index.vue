<!-- PDF 图片提取 -->
<template>
  <div
    class="page-card pdf-extractor-page animate__animated animate__fadeIn"
    :class="{ 'is-dragging': dragging }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="page-head">
      <div class="page-eyebrow">DESIGN TOOLING</div>
      <h1 class="page-title">PDF 图片提取</h1>
      <p class="page-desc">
        在浏览器本地解析 PDF，文件不会上传；按页取出其中嵌入的原图，勾选后打包下载。
      </p>
    </div>

    <div class="filter-bar pdf-extractor-query">
      <div class="filter-field pdf-extractor-file-field">
        <label class="filter-label">PDF 文件：</label>
        <Button
          type="default"
          size="small"
          :disabled="opening || extracting"
          @click="openFilePicker"
        >
          {{ pdfFile ? "更换文件" : "选择文件" }}
        </Button>
        <input
          ref="fileInput"
          class="pdf-extractor-file-input"
          type="file"
          accept=".pdf,application/pdf"
          @change="handleFileChange"
        />
        <span v-if="pdfFile" class="pdf-extractor-file-name" :title="pdfFile.name">
          {{ pdfFile.name }}
        </span>
        <span v-if="pdfFile" class="pdf-extractor-file-meta">
          {{ formatSize(pdfFile.size) }}
          <template v-if="pageCount">· 共 {{ pageCount }} 页</template>
        </span>
        <span v-else class="pdf-extractor-file-meta">也可以把 PDF 直接拖进页面</span>
      </div>
      <div class="filter-field pdf-extractor-range-field">
        <label class="filter-label">页码：</label>
        <Input
          v-model="pageRange"
          class="pdf-extractor-range-input"
          placeholder="留空提取全部，如 3,5-8"
          allow-clear
          :disabled="extracting"
          @keyup.enter="handleExtract"
        />
      </div>
      <Button
        v-if="extracting"
        type="default"
        size="small"
        :disabled="stopping"
        @click="handleStop"
      >
        {{ stopping ? "停止中" : "停止" }}
      </Button>
      <Button v-else type="primary" size="small" :disabled="!pageCount" @click="handleExtract">
        <SystemIco name="search" :size="13" />
        开始提取
      </Button>
    </div>

    <div v-loading="opening" class="list-card pdf-extractor-result">
      <div class="list-head">
        <div>
          <div class="list-title">提取结果</div>
          <div class="list-sub">
            <template v-if="extracting">
              正在解析第 {{ progress.done + 1 }} / {{ progress.total }} 页，已取出
              {{ images.length }} 张图片
            </template>
            <template v-else-if="progress.total">
              已解析 {{ progress.done }} 页 · {{ images.length }} 张图片（重复出现的只保留一张）
              <template v-if="failedCount">· {{ failedCount }} 张无法解码</template>
            </template>
            <template v-else>选择 PDF 后填写页码，留空则提取全部页。</template>
          </div>
        </div>
        <AnimalTag v-if="pageCount" type="primary">本地解析</AnimalTag>
      </div>

      <div v-if="extracting" class="pdf-extractor-progress">
        <div class="pdf-extractor-progress-bar" :style="{ width: `${progressPercent}%` }" />
      </div>

      <div
        v-if="!pdfFile"
        class="pdf-extractor-dropzone"
        :class="{ 'is-dragging': dragging }"
        @click="openFilePicker"
      >
        <AnimalEmpty
          :image-size="72"
          :description="dragging ? '松开导入 PDF' : '点击选择或把 PDF 拖到这里'"
        />
      </div>

      <AnimalEmpty
        v-else-if="images.length === 0 && !extracting"
        :image-size="72"
        :description="progress.total ? '所选页面里没有嵌入图片' : '填写页码后点击开始提取'"
      />

      <template v-else-if="images.length > 0">
        <div class="toolbar pdf-extractor-toolbar">
          <Button type="default" size="small" @click="selectAllImages">全选</Button>
          <Button type="default" size="small" @click="clearSelection">清空</Button>
          <span class="pdf-extractor-selection">
            已选择
            <strong>{{ selectedCount }}</strong>
            / {{ images.length }} 张
          </span>
          <div class="toolbar-spacer" />
          <span class="pdf-extractor-format-label">导出格式：</span>
          <Button
            v-for="option in FORMAT_OPTIONS"
            :key="option.value"
            :type="exportFormat === option.value ? 'primary' : 'default'"
            size="small"
            :title="option.hint"
            @click="exportFormat = option.value"
          >
            {{ option.label }}
          </Button>
        </div>

        <div class="pdf-extractor-groups">
          <section v-for="group in pageGroups" :key="group.page" class="pdf-extractor-group">
            <div class="pdf-extractor-group-head">
              <span
                class="cbx"
                :class="{ 'is-checked': isGroupAllSelected(group) }"
                :title="isGroupAllSelected(group) ? '取消选择该页' : '选择该页全部图片'"
                @click="toggleGroup(group)"
              >
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4">
                  <path d="M2.5 6.5l2.5 2.5 5-6" />
                </svg>
              </span>
              <div>
                <div class="pdf-extractor-group-name">第 {{ group.page }} 页</div>
                <div class="pdf-extractor-group-meta">
                  已选 {{ getGroupSelectedCount(group) }} / {{ group.images.length }} 张
                </div>
              </div>
            </div>

            <div class="pdf-extractor-grid">
              <article
                v-for="(image, imagePosition) in group.images"
                :key="image.id"
                class="pdf-extractor-image-card"
                :class="{ 'is-selected': isChecked(image.id) }"
              >
                <div class="pdf-extractor-image-top">
                  <span class="pdf-extractor-index">第 {{ image.index }} 张</span>
                  <span
                    class="cbx"
                    :class="{ 'is-checked': isChecked(image.id) }"
                    :title="isChecked(image.id) ? '取消选择' : '选择图片'"
                    @click="toggleRow(image.id)"
                  >
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4">
                      <path d="M2.5 6.5l2.5 2.5 5-6" />
                    </svg>
                  </span>
                </div>

                <el-image
                  class="pdf-extractor-image"
                  :src="image.thumbUrl"
                  :preview-src-list="group.images.map((item) => item.url)"
                  :initial-index="imagePosition"
                  fit="contain"
                  preview-teleported
                  hide-on-click-modal
                >
                  <template #error>
                    <div class="pdf-extractor-image-state">图片加载失败</div>
                  </template>
                </el-image>

                <div class="pdf-extractor-image-info">
                  <span>{{ image.width }} × {{ image.height }}</span>
                  <span>{{ image.hasAlpha ? "含透明" : formatSize(image.blob.size) }}</span>
                </div>
                <div v-if="image.otherPages.length" class="pdf-extractor-image-note">
                  第 {{ image.otherPages.join("、") }} 页也用了这张
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="pdf-extractor-download-bar">
          <span>
            已选择
            <strong>{{ selectedCount }}</strong>
            张 · PNG 合计 {{ formatSize(selectedSize) }}
          </span>
          <Button
            type="primary"
            :loading="downloading"
            :disabled="selectedCount === 0 || extracting"
            @click="handleDownload"
          >
            下载所选 ZIP
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, shallowRef, triggerRef } from "vue";
import { Button, Input } from "animal-island-vue";
import { downloadZip } from "client-zip";

import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalEmpty from "@/components/AnimalEmpty/index.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import { useTableSelection } from "@/composables/useTableSelection";
import { downloadBlob } from "@/utils/download";
import { message } from "@/utils/feedback";
import {
  canvasToBlob,
  closePdf,
  convertPngToJpeg,
  createThumbnail,
  extractPageImages,
  openLocalPdf,
  parsePageRange,
  type PdfDocument,
} from "@/utils/pdfImageExtractor";

defineOptions({ name: "PdfImageExtractor", inheritAttrs: false });

type ExportFormat = "png" | "jpg";

interface ExtractedImage {
  id: string;
  /** 首次出现的页码 */
  page: number;
  /** 在该页内的序号 */
  index: number;
  /** 同一张图还出现在哪些页 */
  otherPages: number[];
  width: number;
  height: number;
  hasAlpha: boolean;
  /** 无损 PNG 原图 */
  blob: Blob;
  url: string;
  thumbUrl: string;
}

interface PageGroup {
  page: number;
  images: ExtractedImage[];
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: "png", label: "PNG 无损", hint: "像素无损，文件较大" },
  { value: "jpg", label: "JPG 小体积", hint: "高质量 JPG，体积小；含透明的图片仍导出 PNG" },
];

const fileInput = ref<HTMLInputElement | null>(null);
const pdfFile = shallowRef<File | null>(null);
const pageCount = ref(0);
const pageRange = ref("");
const opening = ref(false);
const extracting = ref(false);
const stopping = ref(false);
const downloading = ref(false);
const dragging = ref(false);
const failedCount = ref(0);
const exportFormat = ref<ExportFormat>("png");
const progress = reactive({ done: 0, total: 0 });
// Blob 不能被深层代理，图片列表只做浅层响应
const images = shallowRef<ExtractedImage[]>([]);

// pdf.js 文档对象同样不能进响应式系统
let pdfDoc: PdfDocument | null = null;
// 组件卸载后，还在跑的解析任务据此静默退出
let disposed = false;
let dragDepth = 0;

const { checkedIds, selectedCount, isChecked, toggleRow, clearSelection } =
  useTableSelection<ExtractedImage>(images, (image) => image.id);

const pageGroups = computed<PageGroup[]>(() => {
  const groups = new Map<number, ExtractedImage[]>();
  images.value.forEach((image) => {
    const list = groups.get(image.page);
    if (list) list.push(image);
    else groups.set(image.page, [image]);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([page, list]) => ({ page, images: list }));
});

const selectedImages = computed(() => images.value.filter((image) => isChecked(image.id)));

const selectedSize = computed(() =>
  selectedImages.value.reduce((sum, image) => sum + image.blob.size, 0)
);

const progressPercent = computed(() =>
  progress.total ? Math.round((progress.done / progress.total) * 100) : 0
);

onBeforeUnmount(() => {
  disposed = true;
  releaseImages();
  releaseDocument();
});

function openFilePicker(): void {
  fileInput.value?.click();
}

function handleFileChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (file) loadFile(file);
}

function handleDragEnter(): void {
  dragDepth += 1;
  dragging.value = true;
}

function handleDragLeave(): void {
  dragDepth = Math.max(dragDepth - 1, 0);
  dragging.value = dragDepth > 0;
}

function handleDrop(event: DragEvent): void {
  dragDepth = 0;
  dragging.value = false;
  if (opening.value || extracting.value) {
    message.error("正在解析中，请先停止再更换文件");
    return;
  }
  const file = event.dataTransfer?.files?.[0];
  if (file) loadFile(file);
}

async function loadFile(file: File): Promise<void> {
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
    message.error("请选择 PDF 文件");
    return;
  }

  releaseImages();
  releaseDocument();
  pdfFile.value = file;
  pageCount.value = 0;
  pageRange.value = "";

  opening.value = true;
  try {
    const doc = await openLocalPdf(file);
    if (disposed) {
      closePdf(doc);
      return;
    }
    pdfDoc = doc;
    pageCount.value = doc.numPages;
  } catch (error) {
    pdfFile.value = null;
    message.error(describeOpenError(error));
  } finally {
    opening.value = false;
  }
}

async function handleExtract(): Promise<void> {
  if (!pdfDoc || extracting.value) return;

  let pages: number[];
  try {
    pages = parsePageRange(pageRange.value, pageCount.value);
  } catch (error) {
    message.error((error as Error).message);
    return;
  }

  const doc = pdfDoc;
  releaseImages();
  progress.total = pages.length;
  stopping.value = false;
  extracting.value = true;

  // 指纹 → 已收下的图片，用于跨页去重
  const known = new Map<string, ExtractedImage>();
  const countByPage = new Map<number, number>();

  try {
    for (const page of pages) {
      if (consumeStop()) return;
      for await (const raw of extractPageImages(doc, page)) {
        if (disposed || consumeStop()) return;
        if (!raw) {
          failedCount.value += 1;
          continue;
        }

        const duplicate = known.get(raw.fingerprint);
        if (duplicate) {
          if (duplicate.page !== page && !duplicate.otherPages.includes(page)) {
            duplicate.otherPages.push(page);
            triggerRef(images);
          }
          continue;
        }

        const [blob, thumbnail] = await Promise.all([
          canvasToBlob(raw.canvas, "image/png"),
          createThumbnail(raw),
        ]);
        if (disposed) return;

        const index = (countByPage.get(page) ?? 0) + 1;
        countByPage.set(page, index);
        const url = URL.createObjectURL(blob);
        const image: ExtractedImage = {
          id: `p${page}-${index}`,
          page,
          index,
          otherPages: [],
          width: raw.width,
          height: raw.height,
          hasAlpha: raw.hasAlpha,
          blob,
          url,
          thumbUrl: thumbnail ? URL.createObjectURL(thumbnail) : url,
        };
        known.set(raw.fingerprint, image);
        images.value = [...images.value, image];
        checkedIds.value.push(image.id);
      }
      progress.done += 1;
    }

    if (images.value.length === 0) {
      message.error(failedCount.value ? "所选页面的图片都无法解码" : "所选页面里没有嵌入图片");
    } else {
      message.success(`已从 ${pages.length} 页中提取 ${images.value.length} 张图片`);
    }
  } catch (error) {
    if (disposed) return;
    console.error("PDF 图片提取失败:", error);
    message.error(`提取中断：${(error as Error).message || "PDF 解析失败"}`);
  } finally {
    extracting.value = false;
    stopping.value = false;
  }
}

/** 只打标记，解析循环在下一张图片或下一页处自己退出，避免和新一轮提取抢同一页 */
function handleStop(): void {
  stopping.value = true;
}

function consumeStop(): boolean {
  if (!stopping.value) return false;
  message.success(`已停止，保留已取出的 ${images.value.length} 张图片`);
  return true;
}

async function handleDownload(): Promise<void> {
  const selected = selectedImages.value;
  if (!pdfFile.value || selected.length === 0) {
    message.error("请至少选择一张图片");
    return;
  }

  const format = exportFormat.value;
  downloading.value = true;
  try {
    const zip = await downloadZip(buildZipEntries(selected, format)).blob();
    downloadBlob(zip, `${pdfFile.value.name.replace(/\.pdf$/i, "")}-图片.zip`);
    message.success("ZIP 下载已开始");
  } catch (error) {
    console.error("图片打包失败:", error);
    message.error(`打包失败：${(error as Error).message || "未知错误"}`);
  } finally {
    downloading.value = false;
  }
}

/** 逐张产出压缩包条目，JPG 在这里现转，不提前占内存 */
async function* buildZipEntries(selected: ExtractedImage[], format: ExportFormat) {
  const lastModified = new Date();
  for (const image of selected) {
    const asJpeg = format === "jpg" && !image.hasAlpha;
    yield {
      name: `p${padNumber(image.page)}-${padNumber(image.index)}.${asJpeg ? "jpg" : "png"}`,
      lastModified,
      input: asJpeg ? await convertPngToJpeg(image.blob) : image.blob,
    };
  }
}

function selectAllImages(): void {
  checkedIds.value = images.value.map((image) => image.id);
}

function isGroupAllSelected(group: PageGroup): boolean {
  return group.images.every((image) => isChecked(image.id));
}

function getGroupSelectedCount(group: PageGroup): number {
  return group.images.filter((image) => isChecked(image.id)).length;
}

function toggleGroup(group: PageGroup): void {
  const groupIds = new Set(group.images.map((image) => image.id));
  if (isGroupAllSelected(group)) {
    checkedIds.value = checkedIds.value.filter((id) => !groupIds.has(id));
    return;
  }
  checkedIds.value = Array.from(new Set([...checkedIds.value, ...groupIds]));
}

function releaseImages(): void {
  images.value.forEach((image) => {
    URL.revokeObjectURL(image.url);
    if (image.thumbUrl !== image.url) URL.revokeObjectURL(image.thumbUrl);
  });
  images.value = [];
  clearSelection();
  failedCount.value = 0;
  progress.done = 0;
  progress.total = 0;
}

function releaseDocument(): void {
  if (!pdfDoc) return;
  closePdf(pdfDoc);
  pdfDoc = null;
}

function describeOpenError(error: unknown): string {
  const { name, message: detail } = error as Error;
  if (name === "PasswordException") return "这个 PDF 设有打开密码，无法解析";
  if (name === "InvalidPDFException") return "文件不是有效的 PDF";
  return `PDF 打开失败：${detail || "未知错误"}`;
}

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<style scoped lang="scss">
.pdf-extractor-page {
  min-height: 100%;
}

.pdf-extractor-query {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(260px, 340px) auto;
}

.pdf-extractor-file-field,
.pdf-extractor-range-field {
  min-width: 0;
}

.pdf-extractor-file-input {
  display: none;
}

.pdf-extractor-file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 800;
  color: var(--ai-text);
  white-space: nowrap;
}

.pdf-extractor-file-meta {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2);
  white-space: nowrap;
}

.pdf-extractor-range-input {
  flex: 1;
  min-width: 0;
}

.pdf-extractor-result {
  min-height: 360px;
}

.pdf-extractor-progress {
  height: 8px;
  margin-bottom: 14px;
  overflow: hidden;
  background: color-mix(in srgb, var(--ai-leaf) 16%, transparent);
  border-radius: 999px;
}

.pdf-extractor-progress-bar {
  height: 100%;
  background: var(--ai-leaf);
  border-radius: 999px;
  transition: width 0.25s ease;
}

.pdf-extractor-dropzone {
  padding: 28px 16px;
  cursor: pointer;
  border: 2px dashed color-mix(in srgb, var(--ai-leaf) 42%, transparent);
  border-radius: 20px;
  transition:
    background 0.18s ease,
    border-color 0.18s ease;
}

.pdf-extractor-dropzone:hover,
.pdf-extractor-dropzone.is-dragging {
  background: color-mix(in srgb, var(--ai-primary-bg) 60%, transparent);
  border-color: var(--ai-leaf);
}

.pdf-extractor-toolbar {
  background: color-mix(in srgb, var(--ai-primary-bg) 45%, transparent);
  border: 1.5px dashed color-mix(in srgb, var(--ai-leaf) 42%, transparent);
}

.pdf-extractor-selection,
.pdf-extractor-format-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text-2);
}

.pdf-extractor-selection strong,
.pdf-extractor-download-bar strong {
  font-family: "Mochiy Pop One", sans-serif;
  color: var(--ai-leaf-d);
}

.pdf-extractor-groups {
  display: grid;
  gap: 18px;
}

.pdf-extractor-group {
  padding: 18px;
  background: color-mix(in srgb, var(--ai-paper) 92%, transparent);
  border: 1.5px solid var(--ai-border);
  border-radius: 20px;
  box-shadow: 0 5px 14px color-mix(in srgb, var(--ai-shadow-color) 10%, transparent);
}

.pdf-extractor-group-head {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px dashed var(--ai-border);
}

.pdf-extractor-group-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--ai-text);
}

.pdf-extractor-group-meta {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2);
}

.pdf-extractor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.pdf-extractor-image-card {
  min-width: 0;
  padding: 10px;
  background: var(--ai-bg-card);
  border: 2px solid var(--ai-border);
  border-radius: 17px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.pdf-extractor-image-card:hover {
  border-color: var(--ai-leaf);
  transform: translateY(-2px);
}

.pdf-extractor-image-card.is-selected {
  border-color: var(--ai-leaf);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ai-leaf) 16%, transparent);
}

.pdf-extractor-image-top,
.pdf-extractor-image-info,
.pdf-extractor-download-bar {
  display: flex;
  align-items: center;
}

.pdf-extractor-image-top {
  justify-content: space-between;
  margin-bottom: 8px;
}

.pdf-extractor-index {
  font-size: 12px;
  font-weight: 800;
  color: var(--ai-text);
}

// 棋盘格底纹，让带透明通道的图片看得出边界
.pdf-extractor-image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  cursor: zoom-in;
  background:
    linear-gradient(45deg, var(--ai-bg-2) 25%, transparent 25%),
    linear-gradient(-45deg, var(--ai-bg-2) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--ai-bg-2) 75%),
    linear-gradient(-45deg, transparent 75%, var(--ai-bg-2) 75%), var(--ai-paper);
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  background-size: 16px 16px;
  border-radius: 12px;
}

.pdf-extractor-image-state {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text-2);
  background: color-mix(in srgb, var(--ai-paper) 90%, transparent);
}

.pdf-extractor-image-info {
  gap: 8px;
  justify-content: space-between;
  min-height: 20px;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2);
}

.pdf-extractor-image-note {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ai-text-3);
}

.pdf-extractor-download-bar {
  position: sticky;
  bottom: 8px;
  z-index: 4;
  gap: 18px;
  justify-content: flex-end;
  padding: 12px 16px;
  margin-top: 18px;
  font-weight: 700;
  color: var(--ai-text-2);
  background: color-mix(in srgb, var(--ai-paper) 96%, transparent);
  border: 1.5px solid var(--ai-border);
  border-radius: 16px;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--ai-shadow-color) 20%, transparent);
}

@media (max-width: 1100px) {
  .pdf-extractor-query {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pdf-extractor-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pdf-extractor-download-bar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .pdf-extractor-grid {
    grid-template-columns: 1fr;
  }
}
</style>

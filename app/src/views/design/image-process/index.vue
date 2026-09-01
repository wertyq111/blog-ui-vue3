<template>
  <div
    class="page-card develop-page admin-workspace-page image-process-page animate__animated animate__fadeIn"
  >
    <!-- 头部区域，动森风标头 -->
    <div class="page-head">
      <span class="page-eyebrow">DESIGN TOOLING</span>
      <h1 class="page-title">图片处理</h1>
      <p class="page-desc">
        识别文本里的图片地址，批量替换图片资源，并统一调整图片定位和热区坐标。
      </p>
    </div>

    <!-- 主体工具卡片 -->
    <section class="image-tool-layout">
      <!-- 左侧：大型输入和结果区 -->
      <div class="image-tool-main">
        <section class="image-tool-panel image-tool-panel--source">
          <div class="image-tool-panel__header">
            <div>
              <div class="image-tool-panel__title">原文本</div>
              <div class="image-tool-panel__desc">
                支持粘贴文本，也可以点击选择或把 txt/html/css 文件拖进来。
              </div>
            </div>
            <Button size="small" type="primary" @click="openFilePicker">导入文件</Button>
            <input
              ref="fileInput"
              class="image-tool-file-input"
              type="file"
              accept=".txt,.html,.htm,.css,text/plain,text/html,text/css"
              @change="handleFileChange"
            />
          </div>

          <!-- 拖拽上传区域 -->
          <div
            class="image-tool-dropzone"
            :class="{ 'image-tool-dropzone--dragging': draggingFile }"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <svg
              class="dropzone-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>{{ draggingFile ? "松开导入文件" : "拖拽文件到这里导入" }}</span>
          </div>

          <AnimalTextarea
            v-model="sourceText"
            class="image-tool-textarea-wrapper"
            :rows="8"
            resize="none"
            placeholder="把文本内容粘贴到这里（例如 HTML/CSS 源码）"
            @input="handleSourceInput"
          />
        </section>

        <section class="image-tool-panel image-tool-panel--output">
          <div class="image-tool-panel__header">
            <div>
              <div class="image-tool-panel__title">替换结果</div>
              <div class="image-tool-panel__desc">
                {{ statusText || "生成后的文本会显示在这里。" }}
              </div>
            </div>
          </div>
          <AnimalTextarea
            v-model="resultText"
            class="image-tool-textarea-wrapper"
            :rows="7"
            resize="none"
            readonly
            placeholder="替换后的内容会显示在这里"
          />
        </section>
      </div>

      <!-- 右侧：侧边栏（地址列表与操作区） -->
      <aside class="image-tool-side">
        <div class="image-tool-side__header">
          <div>
            <div class="image-tool-side__title">图片地址</div>
            <div class="image-tool-side__desc">识别结果按出现顺序替换，留空则保留原地址。</div>
          </div>
          <Button size="small" type="primary" @click="scanImageUrls">识别地址</Button>
        </div>

        <!-- 识别地址列表 -->
        <div class="image-tool-url-list">
          <AnimalEmpty
            v-if="foundUrls.length === 0"
            :image-size="64"
            description="没有识别到图片地址"
          />
          <div
            v-for="(item, index) in foundUrls"
            :key="`${item.start}-${item.end}`"
            class="image-tool-url-item"
          >
            <div class="image-tool-url-item__label">第 {{ index + 1 }} 条</div>
            <div class="image-tool-url-old-box" :title="item.url">
              {{ item.url }}
            </div>
            <Input v-model="replacementUrls[index]" placeholder="填写新的图片地址" allow-clear/>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="image-tool-actions">
          <div class="image-tool-move">
            <div class="image-tool-move__header">
              <strong>左右位移</strong>
              <span class="move-summary">{{ moveSummary }}</span>
            </div>

            <!-- 创新的动森数值加减微调器 -->
            <div class="ani-num-adjuster">
              <button class="ani-num-btn minus-btn" title="减 10" @click="adjustOffset(-10)">
                -10
              </button>
              <button class="ani-num-btn minus-btn" title="减 1" @click="adjustOffset(-1)">
                -1
              </button>
              <input v-model.number="offset" type="number" class="ani-num-input" min="0" step="1"/>
              <button class="ani-num-btn plus-btn" title="加 1" @click="adjustOffset(1)">+1</button>
              <button class="ani-num-btn plus-btn" title="加 10" @click="adjustOffset(10)">
                +10
              </button>
            </div>

            <div class="image-tool-action-grid">
              <Button size="small" @click="generateResult(0)">仅替换</Button>
              <Button size="small" type="primary" @click="generateResult(-1)">左移生成</Button>
              <Button size="small" type="primary" @click="generateResult(1)">右移生成</Button>
            </div>
          </div>

          <div class="image-tool-action-grid image-tool-action-grid--bottom">
            <Button size="small" @click="copyResult">复制结果</Button>
            <Button size="small" type="primary" @click="downloadResult">导出 TXT</Button>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import {ref} from "vue";
import {Button, Input} from "animal-island-vue";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import AnimalEmpty from "@/components/AnimalEmpty/index.vue";

interface ScannedUrl {
  url: string;
  start: number;
  end: number;
}

// 核心匹配正则
const IMAGE_URL_PATTERN =
  /(?:url\(\s*(['"]?)([^'")\s]+?\.(?:jpg|jpeg|png|gif|webp|bmp|svg)(?:\?[^'")\s]*)?)\1\s*\))|(?:(?:src|data-src|data-original)=["']([^"']+?\.(?:jpg|jpeg|png|gif|webp|bmp|svg)(?:\?[^"']*)?)["'])/gi;
const POSITION_PATTERN = /(data-w="(?:area|img)"[^>]*?style="[^"]*?left:)(-?\d+)px/gi;
const MAP_COORDS_PATTERN = /(<area\b[^>]*\bcoords=")([^"]+)(")/gi;
const ACCEPTED_EXTENSIONS = ["txt", "html", "htm", "css"];

const fileInput = ref<HTMLInputElement | null>(null);

const sourceText = ref("");
const resultText = ref("");
const statusText = ref("");
const foundUrls = ref<ScannedUrl[]>([]);
const replacementUrls = ref<string[]>([]);
const scannedText = ref("");
const offset = ref(360);
const moveSummary = ref("定位节点 0 个，坐标热区 0 个");
const draggingFile = ref(false);

let dragDepth = 0;

// 打开文件选择器
function openFilePicker() {
  fileInput.value?.click();
}

// 文件选择回调
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  readTextFile(file);
  target.value = "";
}

// 拖拽事件处理
function handleDragEnter() {
  dragDepth += 1;
  draggingFile.value = true;
}

function handleDragLeave() {
  dragDepth = Math.max(dragDepth - 1, 0);
  draggingFile.value = dragDepth > 0;
}

function handleDrop(event: DragEvent) {
  dragDepth = 0;
  draggingFile.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  readTextFile(file);
}

// 读取文本文件
function readTextFile(file: File) {
  const extension = getFileExtension(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    message.error("只能导入 txt、html、htm、css 文件");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    sourceText.value = String(reader.result || "");
    scanImageUrls();
  };
  reader.onerror = () => {
    message.error("文件读取失败");
  };
  reader.readAsText(file, "utf-8");
}

function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() as string) : "";
}

// 识别图片地址
function scanImageUrls() {
  foundUrls.value = [];
  IMAGE_URL_PATTERN.lastIndex = 0;

  let match = IMAGE_URL_PATTERN.exec(sourceText.value);
  while (match) {
    const url = match[2] || match[3];
    const start = match.index + match[0].indexOf(url);
    foundUrls.value.push({
      url,
      start,
      end: start + url.length,
    });
    match = IMAGE_URL_PATTERN.exec(sourceText.value);
  }

  scannedText.value = sourceText.value;
  replacementUrls.value = foundUrls.value.map(() => "");
  statusText.value = `识别到 ${foundUrls.value.length} 条图片地址`;
  updateMoveSummary();
}

// 文本源更改
function handleSourceInput() {
  updateMoveSummary();
  if (foundUrls.value.length > 0 && scannedText.value !== sourceText.value) {
    foundUrls.value = [];
    replacementUrls.value = [];
    scannedText.value = "";
    statusText.value = "文本已变更，请重新识别地址";
  }
}

// 应用图片地址替换
function applyUrlReplacements(text: string): string {
  let output = "";
  let cursor = 0;

  foundUrls.value.forEach((item, index) => {
    const replacement = (replacementUrls.value[index] || "").trim();
    output += text.slice(cursor, item.start);
    output += replacement || item.url;
    cursor = item.end;
  });
  output += text.slice(cursor);

  return output;
}

// 热区坐标平移
function shiftMapCoords(coordsText: string, delta: number): string {
  const values = coordsText.split(",").map((item) => item.trim());
  if (values.length === 0 || values.some((item) => item === "" || Number.isNaN(Number(item)))) {
    return coordsText;
  }

  return values
    .map((value, index) => (index % 2 === 0 ? String(Number(value) + delta) : value))
    .join(",");
}

// 左右平移像素
function applyHorizontalShift(text: string, delta: number) {
  let movedBlocks = 0;
  let movedMaps = 0;
  POSITION_PATTERN.lastIndex = 0;
  MAP_COORDS_PATTERN.lastIndex = 0;

  const withLeftMoved = text.replace(POSITION_PATTERN, (_, prefix, left) => {
    movedBlocks += 1;
    return `${prefix}${Number(left) + delta}px`;
  });

  const withCoordsMoved = withLeftMoved.replace(MAP_COORDS_PATTERN, (_, start, coords, end) => {
    movedMaps += 1;
    return `${start}${shiftMapCoords(coords, delta)}${end}`;
  });

  return {
    text: withCoordsMoved,
    movedBlocks,
    movedMaps,
  };
}

// 更新定位节点统计数
function updateMoveSummary() {
  POSITION_PATTERN.lastIndex = 0;
  MAP_COORDS_PATTERN.lastIndex = 0;
  const blockCount = (sourceText.value.match(POSITION_PATTERN) || []).length;
  const mapCount = (sourceText.value.match(MAP_COORDS_PATTERN) || []).length;
  moveSummary.value = `定位节点 ${blockCount} 个，坐标热区 ${mapCount} 个`;
}

// 动森数字微调加减
function adjustOffset(amount: number) {
  const current = Number(offset.value) || 0;
  offset.value = Math.max(0, current + amount);
}

// 生成结果
function generateResult(direction: number) {
  const offsetNum = Number(offset.value);
  if (!Number.isFinite(offsetNum) || Number.isNaN(offsetNum)) {
    message.error("请输入有效位移像素");
    return;
  }
  const replacedText = applyUrlReplacements(sourceText.value);
  const delta = direction === 0 ? 0 : offsetNum * direction;
  const replacedCount = replacementUrls.value.filter((item) => item && item.trim() !== "").length;
  const shiftResult = applyHorizontalShift(replacedText, delta);
  const parts = [`已替换 ${replacedCount} 条图片地址`];

  resultText.value = shiftResult.text;

  if (delta !== 0) {
    parts.push(`已${delta > 0 ? "右移" : "左移"} ${Math.abs(delta)}px`);
    parts.push(`定位节点 ${shiftResult.movedBlocks} 个`);
    parts.push(`坐标热区 ${shiftResult.movedMaps} 个`);
  }
  statusText.value = parts.join("，");
}

// 复制结果
function copyResult() {
  if (!resultText.value) {
    message.error("没有可复制的结果");
    return;
  }
  navigator.clipboard.writeText(resultText.value).then(
    () => {
      message.success("结果已复制到剪贴板");
    },
    () => {
      message.error("复制失败");
    }
  );
}

// 导出文本
function downloadResult() {
  if (!resultText.value) {
    message.error("没有可导出的结果");
    return;
  }
  const blob = new Blob([resultText.value], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "替换后的文本.txt";
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped lang="scss">
.image-process-page {
  font-family: "M PLUS Rounded 1c",
  -apple-system,
  sans-serif;
  color: var(--ai-text);
}

.image-tool-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 20px;
  margin-top: 24px;
}

.image-tool-main {
  display: grid;
  grid-template-rows: minmax(320px, 1fr) minmax(260px, 0.8fr);
  gap: 20px;
  min-width: 0;
}

.image-tool-panel {
  display: flex;
  flex-direction: column;
  background: #fffdf8;
  border: 2px solid #e8dcc8;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(121, 79, 39, 0.04);
  gap: 14px;
}

.image-tool-panel__header,
.image-tool-side__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.image-tool-panel__title,
.image-tool-side__title {
  color: var(--ai-text);
  font-family: "Mochiy Pop One", sans-serif;
  font-size: 16px;
  font-weight: 700;
}

.image-tool-panel__desc,
.image-tool-side__desc {
  margin-top: 4px;
  color: #a09080;
  font-size: 13px;
  line-height: 1.5;
}

.image-tool-file-input {
  display: none;
}

.image-tool-dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 60px;
  border: 2px dashed #e8dcc8;
  border-radius: 16px;
  background: rgba(248, 244, 236, 0.4);
  color: #a09080;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;

  .dropzone-icon {
    width: 20px;
    height: 20px;
    color: #a09080;
    transition: transform 0.2s ease;
  }
}

.image-tool-dropzone--dragging {
  border-color: var(--ai-primary);
  background: rgba(25, 200, 185, 0.08);
  color: var(--ai-primary);

  .dropzone-icon {
    color: var(--ai-primary);
    transform: translateY(-2px);
  }
}

.image-tool-textarea-wrapper {
  flex: 1;
  min-height: 0;

  :deep(.ata__inner) {
    font-family: Consolas, "Courier New", monospace !important;
    font-size: 13px;
    background: #fff;
    border-color: #e8dcc8;
    color: #554433;
    line-height: 1.6;
    padding: 12px;
  }
}

.image-tool-side {
  display: flex;
  flex-direction: column;
  background: #fffdf8;
  border: 2px solid #e8dcc8;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(121, 79, 39, 0.04);
  max-height: calc(100vh - 220px);
}

.image-tool-url-list {
  flex: 1;
  min-height: 0;
  margin: 14px -6px 0;
  padding: 0 6px 14px;
  overflow-y: auto;

  /* 美带动森风滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e8dcc8;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.image-tool-url-item {
  display: grid;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(248, 244, 236, 0.35);
  border: 2px solid #f2ece0;
  border-radius: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #e8dcc8;
    background: rgba(248, 244, 236, 0.55);
  }
}

.image-tool-url-item__label {
  color: var(--ai-text);
  font-weight: 800;
  font-size: 12px;
}

.image-tool-url-old-box {
  padding: 8px 10px;
  background: #f8f4ec;
  border-radius: 10px;
  color: #8c7860;
  font-family: Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
  max-height: 64px;
  overflow-y: auto;
  border: 1px solid #eadecf;
}

.image-tool-actions {
  display: grid;
  gap: 16px;
  padding-top: 16px;
  border-top: 2px solid #e8dcc8;
}

.image-tool-move {
  display: grid;
  gap: 12px;
}

.image-tool-move__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--ai-text);
  font-size: 14px;

  strong {
    font-family: "Mochiy Pop One", sans-serif;
  }
}

.move-summary {
  color: #a09080;
  font-size: 12px;
}

/* 动森风数值加减微调器 */
.ani-num-adjuster {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e8dcc8;
  border-radius: 16px;
  padding: 4px;
  gap: 4px;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--ai-primary);
    box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.12);
  }
}

.ani-num-btn {
  border: 0;
  outline: 0;
  height: 32px;
  padding: 0 10px;
  font-family: "Mochiy Pop One", sans-serif;
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;

  &.minus-btn {
    background: #f5eae0;
    color: #a67d58;

    &:hover {
      background: #eddccb;
      color: #946944;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &.plus-btn {
    background: #e1f4ed;
    color: #4a9e86;

    &:hover {
      background: #d0edd4;
      color: #3b8770;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.ani-num-input {
  flex: 1;
  border: 0;
  outline: 0;
  text-align: center;
  font-family: "Mochiy Pop One", sans-serif;
  font-size: 14px;
  color: var(--ai-text);
  width: 50px;
  background: transparent;

  /* 移除 HTML5 默认数字增减按钮 */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.image-tool-action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.image-tool-action-grid--bottom {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1180px) {
  .image-tool-layout {
    grid-template-columns: 1fr;
  }

  .image-tool-side {
    max-height: none;
    min-height: 520px;
  }
}

@media (max-width: 768px) {
  .image-tool-main {
    grid-template-rows: 360px 300px;
  }

  .image-tool-panel__header,
  .image-tool-side__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .image-tool-action-grid,
  .image-tool-action-grid--bottom {
    grid-template-columns: 1fr;
  }
}
</style>

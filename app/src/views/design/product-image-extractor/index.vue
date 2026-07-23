<template>
  <div class="page-card product-extractor-page animate__animated animate__fadeIn">
    <div class="page-head">
      <div class="page-eyebrow">DESIGN TOOLING</div>
      <h1 class="page-title">商品图片提取</h1>
      <p class="page-desc">从商品页面解析不同 SKU 与颜色的轮播原图，按需排除并批量打包下载。</p>
    </div>

    <div class="filter-bar product-extractor-query">
      <div class="filter-field product-extractor-platform-field">
        <label class="filter-label">平台：</label>
        <AnimalSelect
          v-model="selectedPlatform"
          class="filter-select"
          :options="platformOptions"
          :disabled="platformLoading || parsing"
          placeholder="请选择平台"
        />
      </div>
      <div class="filter-field product-extractor-url-field">
        <label class="filter-label">商品 URL：</label>
        <Input
          v-model="productUrl"
          class="product-extractor-url-input"
          placeholder="请输入完整商品页面地址"
          allow-clear
          :disabled="parsing"
          @keyup.enter="handleParse"
        />
      </div>
      <Button type="primary" size="small" :loading="parsing" @click="handleParse">
        <SystemIco name="search" :size="13" />
        {{ parsing ? "解析中" : "开始解析" }}
      </Button>
    </div>

    <div v-loading="parsing" class="list-card product-extractor-result">
      <div class="list-head">
        <div>
          <div class="list-title">解析结果</div>
          <div class="list-sub">
            <template v-if="extraction">
              {{ extraction.product.title }} · {{ extraction.variants.length }} 个分组 ·
              {{ allImages.length }} 张图片
            </template>
            <template v-else>解析后将按 SKU 或颜色显示商品轮播图。</template>
          </div>
        </div>
        <AnimalTag v-if="activePlatformName" type="primary">
          {{ activePlatformName }}
        </AnimalTag>
      </div>

      <AnimalEmpty
        v-if="!parsing && !extraction"
        :image-size="72"
        description="请选择平台并输入商品地址"
      />

      <template v-else-if="extraction">
        <div class="toolbar product-extractor-toolbar">
          <Button type="default" size="small" @click="selectAllImages">全选</Button>
          <Button type="default" size="small" @click="clearSelection">清空</Button>
          <span class="product-extractor-selection">
            已选择
            <strong>{{ selectedCount }}</strong>
            / {{ allImages.length }} 张
          </span>
          <div class="toolbar-spacer" />
          <Button
            type="primary"
            size="small"
            :loading="downloading"
            :disabled="selectedCount === 0"
            @click="handleDownload"
          >
            下载所选 ZIP
          </Button>
        </div>

        <div class="product-extractor-groups">
          <section
            v-for="variant in extraction.variants"
            :key="variant.id"
            class="product-extractor-group"
          >
            <div class="product-extractor-group-head">
              <div class="product-extractor-group-title">
                <span
                  class="cbx"
                  :class="{ 'is-checked': isVariantAllSelected(variant) }"
                  :title="isVariantAllSelected(variant) ? '取消选择该组' : '选择该组全部图片'"
                  @click="toggleVariant(variant)"
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4">
                    <path d="M2.5 6.5l2.5 2.5 5-6" />
                  </svg>
                </span>
                <div>
                  <div class="product-extractor-group-name">{{ variant.name }}</div>
                  <div class="product-extractor-group-meta">
                    <span v-for="(value, key) in variant.attributes" :key="key">
                      {{ key }}：{{ value }}
                    </span>
                    <span v-if="variant.skuId">SKU：{{ variant.skuId }}</span>
                    <span>
                      已选 {{ getVariantSelectedCount(variant) }} / {{ variant.images.length }} 张
                    </span>
                  </div>
                </div>
              </div>

              <div class="product-extractor-exclude">
                <Input
                  v-model="excludeInputs[variant.id]"
                  class="product-extractor-exclude-input"
                  placeholder="排除序号，如 1,4"
                  allow-clear
                  @keyup.enter="applyExcludedIndexes(variant)"
                />
                <Button type="default" size="small" @click="applyExcludedIndexes(variant)">
                  应用排除
                </Button>
              </div>
            </div>

            <AnimalEmpty
              v-if="variant.images.length === 0"
              :image-size="56"
              description="该分组没有图片"
            />
            <div v-else class="product-extractor-grid">
              <article
                v-for="(image, imagePosition) in variant.images"
                :key="image.id"
                class="product-extractor-image-card"
                :class="{ 'is-selected': isChecked(image.id) }"
              >
                <div class="product-extractor-image-top">
                  <span class="product-extractor-index">第 {{ image.index }} 张</span>
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
                  class="product-extractor-image"
                  :src="image.thumbnailUrl || image.url"
                  :preview-src-list="variant.images.map((item) => item.url)"
                  :initial-index="imagePosition"
                  fit="contain"
                  preview-teleported
                  hide-on-click-modal
                  referrer-policy="no-referrer"
                >
                  <template #placeholder>
                    <div class="product-extractor-image-state">加载中…</div>
                  </template>
                  <template #error>
                    <div class="product-extractor-image-state">图片加载失败</div>
                  </template>
                </el-image>

                <div class="product-extractor-image-info">
                  <span v-if="image.width && image.height">
                    {{ image.width }} × {{ image.height }}
                  </span>
                  <span v-if="image.mimeType">{{ formatMimeType(image.mimeType) }}</span>
                  <span v-if="!image.width && !image.height && !image.mimeType">原图</span>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="product-extractor-download-bar">
          <span>
            已选择
            <strong>{{ selectedCount }}</strong>
            张原图
          </span>
          <Button
            type="primary"
            :loading="downloading"
            :disabled="selectedCount === 0"
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Button, Input } from "animal-island-vue";

import ProductImageExtractorAPI from "@/api/design/product-image-extractor";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalEmpty from "@/components/AnimalEmpty/index.vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import { useTableSelection } from "@/composables/useTableSelection";
import type {
  ProductImageExtraction,
  ProductImageItem,
  ProductImagePlatform,
  ProductImageVariant,
} from "@/types/api/product-image-extractor";
import { downloadFile } from "@/utils/download";
import { message } from "@/utils/feedback";

defineOptions({ name: "ProductImageExtractor", inheritAttrs: false });

const platforms = ref<ProductImagePlatform[]>([]);
const selectedPlatform = ref("");
const productUrl = ref("");
const extraction = ref<ProductImageExtraction | null>(null);
const platformLoading = ref(false);
const parsing = ref(false);
const downloading = ref(false);
const excludeInputs = reactive<Record<string, string>>({});

const platformOptions = computed(() =>
  platforms.value.map((platform) => ({ key: platform.code, label: platform.name }))
);

const activePlatformName = computed(
  () =>
    extraction.value?.platform.name ||
    platforms.value.find((platform) => platform.code === selectedPlatform.value)?.name ||
    ""
);

const allImages = computed<ProductImageItem[]>(
  () => extraction.value?.variants.flatMap((variant) => variant.images) ?? []
);

const { checkedIds, selectedCount, isChecked, toggleRow, clearSelection } =
  useTableSelection<ProductImageItem>(allImages, (image) => image.id);

onMounted(fetchPlatforms);

watch([selectedPlatform, productUrl], () => {
  if (!extraction.value) return;
  clearExtraction();
});

async function fetchPlatforms(): Promise<void> {
  platformLoading.value = true;
  try {
    platforms.value = await ProductImageExtractorAPI.getPlatforms();
    if (!selectedPlatform.value && platforms.value.length > 0) {
      selectedPlatform.value = platforms.value[0].code;
    }
  } finally {
    platformLoading.value = false;
  }
}

async function handleParse(): Promise<void> {
  if (!selectedPlatform.value) {
    message.error("请选择商品平台");
    return;
  }

  const normalizedUrl = validateProductUrl(productUrl.value);
  if (!normalizedUrl) return;

  parsing.value = true;
  clearExtraction();
  try {
    const result = await ProductImageExtractorAPI.extract({
      platform: selectedPlatform.value,
      url: normalizedUrl,
    });
    const imageCount = result.variants.reduce((sum, variant) => sum + variant.images.length, 0);
    if (imageCount === 0) {
      message.error("商品页面没有解析到图片");
      return;
    }

    extraction.value = result;
    checkedIds.value = result.variants.flatMap((variant) =>
      variant.images.map((image) => String(image.id))
    );
    result.variants.forEach((variant) => {
      excludeInputs[variant.id] = "";
    });
    message.success(`已解析 ${result.variants.length} 个分组，共 ${imageCount} 张图片`);
  } finally {
    parsing.value = false;
  }
}

function validateProductUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) {
    message.error("请输入商品 URL");
    return null;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") {
      message.error("商品 URL 只支持 HTTPS 地址");
      return null;
    }
    return parsed.toString();
  } catch {
    message.error("请输入完整有效的商品 URL");
    return null;
  }
}

function clearExtraction(): void {
  extraction.value = null;
  clearSelection();
  Object.keys(excludeInputs).forEach((key) => delete excludeInputs[key]);
}

function selectAllImages(): void {
  checkedIds.value = allImages.value.map((image) => String(image.id));
}

function isVariantAllSelected(variant: ProductImageVariant): boolean {
  return variant.images.length > 0 && variant.images.every((image) => isChecked(image.id));
}

function getVariantSelectedCount(variant: ProductImageVariant): number {
  return variant.images.filter((image) => isChecked(image.id)).length;
}

function toggleVariant(variant: ProductImageVariant): void {
  const variantIds = new Set(variant.images.map((image) => String(image.id)));
  if (isVariantAllSelected(variant)) {
    checkedIds.value = checkedIds.value.filter((id) => !variantIds.has(id));
    return;
  }

  checkedIds.value = Array.from(new Set([...checkedIds.value, ...variantIds]));
}

function applyExcludedIndexes(variant: ProductImageVariant): void {
  const input = (excludeInputs[variant.id] || "").trim();
  if (!input) {
    message.error(`请填写“${variant.name}”要排除的图片序号`);
    return;
  }

  if (!/^[1-9]\d*(?:\s*[,，]\s*[1-9]\d*)*$/.test(input)) {
    message.error("排除序号只能填写正整数，并使用逗号分隔，例如 1,4");
    return;
  }

  const indexes = input.split(/[,，]/).map((part) => Number(part.trim()));
  if (new Set(indexes).size !== indexes.length) {
    message.error("排除序号不能重复");
    return;
  }

  const availableIndexes = new Set(variant.images.map((image) => image.index));
  const invalidIndexes = indexes.filter((index) => !availableIndexes.has(index));
  if (invalidIndexes.length > 0) {
    message.error(`序号 ${invalidIndexes.join("、")} 不在“${variant.name}”的图片范围内`);
    return;
  }

  const excludedIds = new Set(
    variant.images.filter((image) => indexes.includes(image.index)).map((image) => String(image.id))
  );
  checkedIds.value = checkedIds.value.filter((id) => !excludedIds.has(id));
  message.success(`已从“${variant.name}”排除 ${indexes.length} 张图片`);
}

async function handleDownload(): Promise<void> {
  if (!extraction.value || checkedIds.value.length === 0) {
    message.error("请至少选择一张图片");
    return;
  }

  downloading.value = true;
  try {
    const response = await ProductImageExtractorAPI.download({
      platform: extraction.value.platform.code,
      url: extraction.value.product.sourceUrl,
      imageIds: [...checkedIds.value],
    });
    downloadFile(response);
    message.success("ZIP 下载已开始");
  } finally {
    downloading.value = false;
  }
}

function formatMimeType(mimeType: string): string {
  return mimeType.replace(/^image\//i, "").toUpperCase();
}
</script>

<style scoped lang="scss">
.product-extractor-page {
  min-height: 100%;
}

.product-extractor-query {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(420px, 1fr) auto;
}

.product-extractor-platform-field,
.product-extractor-url-field {
  min-width: 0;
}

.product-extractor-url-input {
  flex: 1;
  min-width: 0;
}

.product-extractor-result {
  min-height: 360px;
}

.product-extractor-toolbar {
  background: color-mix(in srgb, var(--ai-primary-bg) 45%, transparent);
  border: 1.5px dashed color-mix(in srgb, var(--ai-leaf) 42%, transparent);
}

.product-extractor-selection {
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text-2);
}

.product-extractor-selection strong,
.product-extractor-download-bar strong {
  font-family: "Mochiy Pop One", sans-serif;
  color: var(--ai-leaf-d);
}

.product-extractor-groups {
  display: grid;
  gap: 18px;
}

.product-extractor-group {
  padding: 18px;
  background: color-mix(in srgb, var(--ai-paper) 92%, transparent);
  border: 1.5px solid var(--ai-border);
  border-radius: 20px;
  box-shadow: 0 5px 14px color-mix(in srgb, var(--ai-shadow-color) 10%, transparent);
}

.product-extractor-group-head {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px dashed var(--ai-border);
}

.product-extractor-group-title,
.product-extractor-exclude,
.product-extractor-image-top,
.product-extractor-image-info,
.product-extractor-download-bar {
  display: flex;
  align-items: center;
}

.product-extractor-group-title {
  gap: 12px;
  min-width: 0;
}

.product-extractor-group-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--ai-text);
}

.product-extractor-group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2);
}

.product-extractor-exclude {
  flex: 0 1 390px;
  gap: 8px;
  justify-content: flex-end;
}

.product-extractor-exclude-input {
  min-width: 180px;
}

.product-extractor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.product-extractor-image-card {
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

.product-extractor-image-card:hover {
  border-color: var(--ai-leaf);
  transform: translateY(-2px);
}

.product-extractor-image-card.is-selected {
  border-color: var(--ai-leaf);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ai-leaf) 16%, transparent);
}

.product-extractor-image-top {
  justify-content: space-between;
  margin-bottom: 8px;
}

.product-extractor-index {
  font-size: 12px;
  font-weight: 800;
  color: var(--ai-text);
}

.product-extractor-image {
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

.product-extractor-image-state {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text-2);
  background: color-mix(in srgb, var(--ai-paper) 90%, transparent);
}

.product-extractor-image-info {
  gap: 8px;
  justify-content: space-between;
  min-height: 20px;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2);
}

.product-extractor-download-bar {
  position: sticky;
  bottom: 8px;
  z-index: 4;
  gap: 18px;
  justify-content: flex-end;
  padding: 12px 16px;
  margin-top: 18px;
  font-weight: 700;
  color: var(--ai-text-2);
  background: color-mix(in srgb, var(--ai-paper) 94%, transparent);
  border: 1.5px solid var(--ai-border);
  border-radius: 16px;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--ai-shadow-color) 20%, transparent);
  backdrop-filter: blur(10px);
}

@media (max-width: 1100px) {
  .product-extractor-query {
    grid-template-columns: 1fr;
  }

  .product-extractor-query :deep(.filter-select) {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .product-extractor-group-head {
    flex-direction: column;
    align-items: stretch;
  }

  .product-extractor-exclude {
    flex: none;
    justify-content: stretch;
  }

  .product-extractor-exclude-input {
    flex: 1;
    min-width: 0;
  }

  .product-extractor-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-extractor-download-bar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .product-extractor-grid {
    grid-template-columns: 1fr;
  }

  .product-extractor-exclude {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

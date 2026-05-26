<!-- 动森风格专属分页组件：完全独立于 element-plus，使用纯原生 HTML + SCSS 与自带 select / input 完成高品质圆润奶油纸片换页 -->
<template>
  <div :class="{ hidden: hidden }" class="animal-pagination-container">
    <div class="pagination animal-pagination">
      <!-- 1. 共 X 条 -->
      <span class="animal-pagination__total">共 {{ total }} 条</span>

      <!-- 2. sizes 每页几条选择器 -->
      <div class="animal-pagination__sizes">
        <Select
          v-model="pageSizeModel"
          :options="sizeOptions"
          class="animal-pagination__select"
          style="width: 110px;"
        />
      </div>

      <!-- 3. 上一页 -->
      <button
        class="animal-page-btn btn-prev"
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- 4. 页码列表 -->
      <ul class="animal-pager">
        <li
          v-for="(page, idx) in pageList"
          :key="idx"
          :class="{
            active: page === currentPage,
            disabled: page === '...'
          }"
          class="animal-pager-item"
          @click="page !== '...' && handlePageChange(Number(page))"
        >
          {{ page }}
        </li>
      </ul>

      <!-- 5. 下一页 -->
      <button
        class="animal-page-btn btn-next"
        :disabled="currentPage === totalPages || totalPages === 0"
        @click="handlePageChange(currentPage + 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- 6. jumper 跳转 -->
      <div class="animal-pagination__jumper">
        前往
        <input
          type="text"
          v-model="jumperValue"
          @keyup.enter="handleJumperSubmit"
          @blur="handleJumperSubmit"
          class="animal-jumper-input"
        />
        页
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PropType } from "vue";
import { Select } from "animal-island-vue";

defineOptions({
  name: "Pagination",
});

const props = defineProps({
  total: {
    type: Number as PropType<number>,
    default: 0,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default() {
      return [10, 20, 30, 50];
    },
  },
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper",
  },
  background: {
    type: Boolean,
    default: true,
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["pagination"]);

const currentPage = defineModel("page", {
  type: Number,
  required: true,
  default: 1,
});

const pageSize = defineModel("limit", {
  type: Number,
  required: true,
  default: 10,
});

// 计算总页数
const totalPages = computed(() => Math.ceil(props.total / pageSize.value));

// 生成每页数量的下拉数据格式
const sizeOptions = computed(() => {
  return props.pageSizes.map((size) => ({
    key: String(size),
    label: `${size}条/页`,
  }));
});

// 绑定 sizes 下拉框的 computed
const pageSizeModel = computed<string>({
  get: () => String(pageSize.value),
  set: (val) => {
    handleSizeChange(Number(val));
  },
});

// 页码展示算法逻辑（核心页码切片）
const pageList = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
});

// 跳页逻辑
const jumperValue = ref(String(currentPage.value));

watch(currentPage, (val) => {
  jumperValue.value = String(val);
});

function handleJumperSubmit() {
  let val = parseInt(jumperValue.value, 10);
  if (isNaN(val)) {
    jumperValue.value = String(currentPage.value);
    return;
  }

  const total = totalPages.value;
  if (val < 1) val = 1;
  if (val > total) val = total;

  jumperValue.value = String(val);
  handlePageChange(val);
}

// 边界检查
watch(
  () => props.total,
  (newVal: number) => {
    const lastPage = Math.ceil(newVal / pageSize.value);
    if (newVal > 0 && currentPage.value > lastPage) {
      currentPage.value = lastPage;
      emit("pagination", { page: currentPage.value, limit: pageSize.value });
    }
  }
);

function handleSizeChange(val: number) {
  currentPage.value = 1;
  emit("pagination", { page: currentPage.value, limit: val });
}

function handlePageChange(val: number) {
  currentPage.value = val;
  emit("pagination", { page: val, limit: pageSize.value });
}
</script>

<style lang="scss" scoped>
.animal-pagination-container {
  padding-top: 12px;
  padding-bottom: 72px; /* 提供充足的底部溢出安全空间，彻底防遮挡 */
  display: flex;
  justify-content: center;
  width: 100%;
}

.pagination {
  &.hidden {
    display: none;
  }
}

.animal-pagination {
  background: #fdfbf7;
  border: 2px solid #e8e2d6;
  border-radius: 20px;
  padding: 10px 18px;
  min-height: 48px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  box-shadow: inset 0 2px 4px rgba(61, 52, 40, 0.02);
  font-family: inherit;
  color: #794f27;
  font-weight: 700;
  font-size: 13px;

  /* 深度选择器，微调自带 Select 使其适配分页小尺寸 */
  ::v-deep(.animal-select) {
    height: 28px !important;
    line-height: 28px !important;

    .animal-select-inner {
      height: 28px !important;
      padding: 0 12px !important;
      font-size: 12px !important;
      border-radius: 10px !important;
      background-color: #f7f3df !important;
      border-color: #c4b89e !important;
    }
  }
}

.animal-pagination__total {
  color: #9f927d;
  font-size: 12px;
}

.animal-pagination__sizes {
  display: flex;
  align-items: center;
}

/* 前后页按钮 */
.animal-page-btn {
  display: inline-grid;
  place-items: center;
  background-color: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 10px;
  color: #794f27;
  min-width: 28px;
  height: 28px;
  padding: 0;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #19c8b9;
    background-color: rgba(25, 200, 185, 0.06);
    color: #19c8b9;
  }

  &:disabled {
    opacity: 0.5;
    background-color: #f8f8f0;
    cursor: not-allowed;
  }
}

/* 页码 */
.animal-pager {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.animal-pager-item {
  display: inline-grid;
  place-items: center;
  background-color: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 10px;
  color: #794f27;
  min-width: 28px;
  height: 28px;
  font-weight: 800;
  margin: 0 3px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;

  &:hover:not(.disabled) {
    border-color: #19c8b9;
    background-color: rgba(25, 200, 185, 0.06);
    color: #19c8b9;
  }

  &.disabled {
    background: transparent;
    border-color: transparent;
    cursor: default;
    color: #9f927d;
  }

  &.active {
    background-color: #7cba70;
    border-color: #7cba70;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(124, 186, 112, 0.3);
  }
}

/* jumper 跳页 */
.animal-pagination__jumper {
  display: flex;
  align-items: center;
  color: #9f927d;
  font-size: 12px;

  .animal-jumper-input {
    width: 40px;
    height: 28px;
    border: 1.5px solid #c4b89e;
    background: #f7f3df;
    border-radius: 10px;
    text-align: center;
    font-family: inherit;
    font-weight: 700;
    color: #725d42;
    margin: 0 6px;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    font-size: 12px;

    &:focus {
      border-color: #19c8b9;
      background: #fff;
    }
  }
}
</style>

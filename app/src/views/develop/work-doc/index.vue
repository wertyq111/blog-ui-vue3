<!-- 工作文档 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">工作文档</h1>
      <p class="page-desc">分类管理工作文档，支持 Markdown 编辑、预览与拖拽调整分类层级。</p>
    </div>

    <div class="wd-layout">
      <!-- 左侧分类树 -->
      <aside class="wd-sidebar">
        <div class="wd-tree-head">
          <div class="wd-tree-title">分类目录</div>
          <Button
            type="primary"
            size="small"
            class="btn-icon"
            title="新增分类"
            @click="handleCreateCategory"
          >
            <SystemIco name="plus" :size="14" />
          </Button>
        </div>
        <div class="wd-tree-tips">拖到节点上变为子目录，拖到节点前后调整同级顺序。</div>

        <AnimalTree
          :nodes="categoryTree"
          :selected-id="queryParams.categoryId ?? null"
          @select="handleCategorySelect"
          @reorder="handleCategoryReorder"
        >
          <template #actions="{ node }">
            <span class="wd-node-act act-edit" title="编辑" @click="handleEditCategory(node)">
              <SystemIco name="edit" :size="12" />
            </span>
            <span class="wd-node-act act-del" title="删除" @click="handleDeleteCategory(node.id)">
              <SystemIco name="trash" :size="12" />
            </span>
          </template>
        </AnimalTree>

        <div
          class="wd-show-all"
          :class="{ 'is-active': queryParams.categoryId == null }"
          @click="handleShowAll"
        >
          显示全部
        </div>
      </aside>

      <!-- 右侧文档列表 -->
      <section class="wd-main">
        <div class="filter-bar">
          <div class="filter-field">
            <label class="filter-label">关键字：</label>
            <Input
              v-model="queryParams.keyword"
              class="filter-input"
              placeholder="标题/内容"
              allow-clear
              @keyup.enter="handleQuery"
            />
          </div>
          <div class="filter-field">
            <label class="filter-label">状态：</label>
            <Select
              v-model="statusModel"
              class="filter-select"
              placeholder="全部"
              :options="statusOptions"
            />
          </div>
          <div class="filter-field">
            <label class="filter-label">模板：</label>
            <Select
              v-model="templateModel"
              class="filter-select"
              placeholder="全部"
              :options="templateFilterOptions"
            />
          </div>
          <Button type="primary" size="small" @click="handleQuery">
            <SystemIco name="search" :size="13" />
            查询
          </Button>
          <Button type="default" size="small" @click="handleResetQuery">重置</Button>
        </div>

        <div class="list-card">
          <div class="list-head">
            <div>
              <div class="list-title">文档管理</div>
              <div class="list-sub">点击标题预览文档，点击链接复制 Markdown 引用。</div>
            </div>
          </div>

          <div class="toolbar">
            <Button type="primary" size="small" @click="handleCreateClick">
              <SystemIco name="plus" :size="13" />
              添加
            </Button>
            <div class="toolbar-spacer" />
            <div class="tool-group">
              <Button class="btn-icon" type="default" size="small" title="刷新" @click="fetchList">
                <SystemIco name="refresh" :size="14" />
              </Button>
            </div>
          </div>

          <div v-loading="loading" class="tbl-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>标题</th>
                  <th style="width: 120px">分类</th>
                  <th style="width: 180px">标签</th>
                  <th style="width: 90px">优先级</th>
                  <th style="width: 90px">状态</th>
                  <th style="width: 170px">更新时间</th>
                  <th style="width: 200px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in dataList" :key="row.id">
                  <td>
                    <AnimalTag v-if="row.isPin === 1" type="danger" dot>置顶</AnimalTag>
                    <a class="action-link act-edit doc-title" @click="handlePreview(row)">
                      {{ row.title }}
                    </a>
                  </td>
                  <td>{{ row.category?.name || "-" }}</td>
                  <td>
                    <span v-if="row.tags?.length" class="doc-tags">
                      <AnimalTag v-for="tag in row.tags" :key="tag" type="info">
                        {{ tag }}
                      </AnimalTag>
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <AnimalTag :type="priorityType(row.priority)">{{ row.priority }}</AnimalTag>
                  </td>
                  <td>
                    <AnimalTag
                      :type="row.status === 1 ? 'success' : 'info'"
                      :dot="row.status === 1"
                    >
                      {{ row.status === 1 ? "启用" : "停用" }}
                    </AnimalTag>
                  </td>
                  <td class="cell-mono">{{ row.updateTime }}</td>
                  <td>
                    <span class="tbl-actions">
                      <span class="action-link act-edit" @click="handleEditClick(row)">
                        <SystemIco name="edit" :size="12" />
                        修改
                      </span>
                      <span class="action-link act-assign" @click="copyMarkdownLink(row)">
                        <SystemIco name="refresh" :size="12" />
                        链接
                      </span>
                      <span class="action-link act-del" @click="handleDelete(row.id)">
                        <SystemIco name="trash" :size="12" />
                        删除
                      </span>
                    </span>
                  </td>
                </tr>
                <tr v-if="!loading && dataList.length === 0" class="empty-row">
                  <td colspan="7">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="fetchList"
          />
        </div>
      </section>
    </div>

    <WorkDocCategoryEdit
      v-model:visible="categoryVisible"
      :data="editingCategory"
      :default-parent-id="queryParams.categoryId"
      :category-options="categoryOptions"
      @done="fetchCategories"
    />
    <WorkDocEdit
      v-model:visible="docVisible"
      :data="editingDoc"
      :default-category-id="queryParams.categoryId"
      :category-options="categoryOptions"
      :source-options="sourceOptions"
      @done="fetchList"
    />

    <WorkDocPreview
      v-model:visible="previewVisible"
      :data="previewDoc"
    />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Button, Input, Select } from "animal-island-vue";
import AnimalTree from "@/components/AnimalTree/index.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import WorkDocAPI from "@/api/develop/work-doc";
import WorkDocCategoryAPI from "@/api/develop/work-doc-category";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkDocItem, WorkDocQueryParams } from "@/types/api/work-doc";
import type { WorkDocCategoryItem } from "@/types/api/work-doc-category";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import WorkDocCategoryEdit from "./work-doc-category-edit.vue";
import WorkDocEdit from "./work-doc-edit.vue";
import WorkDocPreview from "./work-doc-preview.vue";

defineOptions({ name: "WorkDoc", inheritAttrs: false });

const queryParams = reactive<WorkDocQueryParams>({
  pageNum: 1,
  pageSize: 10,
  keyword: "",
  categoryId: undefined,
  status: undefined,
  templateType: undefined,
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<WorkDocItem[]>([]);
const categoryTree = ref<WorkDocCategoryItem[]>([]);
const platforms = ref<WorkPlatformItem[]>([]);

const categoryVisible = ref(false);
const editingCategory = ref<WorkDocCategoryItem | null>(null);
const docVisible = ref(false);
const editingDoc = ref<WorkDocItem | null>(null);
const previewVisible = ref(false);
const previewDoc = ref<WorkDocItem | null>(null);

const statusOptions = [
  { key: "", label: "全部" },
  { key: "1", label: "启用" },
  { key: "0", label: "停用" },
];

const templateFilterOptions = [
  { key: "", label: "全部" },
  { key: "custom", label: "自定义" },
  { key: "troubleshooting", label: "故障排查" },
  { key: "design", label: "方案设计" },
  { key: "knowledge", label: "知识点" },
];

const statusModel = computed<string>({
  get: () => (queryParams.status == null ? "" : String(queryParams.status)),
  set: (value) => {
    queryParams.status = value === "" ? undefined : Number(value);
  },
});

const templateModel = computed<string>({
  get: () => queryParams.templateType ?? "",
  set: (value) => {
    queryParams.templateType = value === "" ? undefined : value;
  },
});

const categoryOptions = computed(() => {
  const out: Array<{ key: string; label: string }> = [];
  const walk = (list: WorkDocCategoryItem[], prefix: string) => {
    list.forEach((n) => {
      out.push({ key: String(n.id), label: prefix + n.name });
      if (n.children?.length) walk(n.children, prefix + "　");
    });
  };
  walk(categoryTree.value, "");
  return out;
});

const sourceOptions = computed(() => platforms.value.map((p) => ({ key: p.name, label: p.name })));

function priorityType(priority: number): "danger" | "warning" | "info" {
  if (priority >= 8) return "danger";
  if (priority >= 5) return "warning";
  return "info";
}

function listToTree(list: WorkDocCategoryItem[]): WorkDocCategoryItem[] {
  const map = new Map<number, WorkDocCategoryItem>();
  const roots: WorkDocCategoryItem[] = [];
  list.forEach((item) => map.set(item.id, { ...item, children: [] }));
  list.forEach((item) => {
    const node = map.get(item.id)!;
    const pid = item.parentId || 0;
    if (pid === 0 || !map.has(pid)) roots.push(node);
    else map.get(pid)!.children!.push(node);
  });
  return roots;
}

async function fetchCategories(): Promise<void> {
  const list = await WorkDocCategoryAPI.getList();
  categoryTree.value = listToTree(list);
}

async function fetchPlatforms(): Promise<void> {
  platforms.value = await WorkPlatformAPI.getList(1);
}

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await WorkDocAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchList();
}

function handleResetQuery(): void {
  queryParams.keyword = "";
  queryParams.status = undefined;
  queryParams.templateType = undefined;
  handleQuery();
}

function handleCategorySelect(node: WorkDocCategoryItem): void {
  queryParams.categoryId = node.id;
  handleQuery();
}

function handleShowAll(): void {
  queryParams.categoryId = undefined;
  handleQuery();
}

async function handleCategoryReorder(
  list: Array<{ id: number | string; parentId: number | string | null; sort: number }>
): Promise<void> {
  loading.value = true;
  try {
    await WorkDocCategoryAPI.reorder(
      list.map((it) => ({
        id: Number(it.id),
        parentId: it.parentId == null ? undefined : Number(it.parentId),
        sort: it.sort,
      }))
    );
    message.success("排序已保存");
  } finally {
    fetchCategories();
  }
}

/* 文档 */
function handleCreateClick(): void {
  editingDoc.value = null;
  docVisible.value = true;
}

function handleEditClick(row: WorkDocItem): void {
  editingDoc.value = row;
  docVisible.value = true;
}

function handlePreview(row: WorkDocItem): void {
  previewDoc.value = row;
  previewVisible.value = true;
}

function copyMarkdownLink(row: WorkDocItem): void {
  const link = `[${row.title}](/develop/work-doc?id=${row.id})`;
  navigator.clipboard.writeText(link).then(() => message.success("Markdown 链接已复制"));
}

function handleDelete(id: number): void {
  confirm("确认删除该文档吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      WorkDocAPI.deleteById(id)
        .then(() => {
          message.success("删除成功");
          fetchList();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => message.info("已取消删除")
  );
}

/* 分类 */
function handleCreateCategory(): void {
  editingCategory.value = null;
  categoryVisible.value = true;
}

function handleEditCategory(node: WorkDocCategoryItem): void {
  editingCategory.value = node;
  categoryVisible.value = true;
}

function handleDeleteCategory(id: number): void {
  confirm("确认删除该分类吗？分类下有文档或子分类时无法删除。", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      WorkDocCategoryAPI.deleteById(id).then(() => {
        message.success("删除成功");
        fetchCategories();
      });
    },
    () => message.info("已取消删除")
  );
}

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  await fetchCategories();
  await fetchPlatforms();
  handleQuery();
  if (route.query.action === "add") {
    handleCreateClick();
    const { action, ...rest } = route.query;
    void action;
    router.replace({ path: route.path, query: rest });
  }
});
</script>

<style lang="scss" scoped>
.wd-layout {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.wd-sidebar {
  width: 280px;
  flex-shrink: 0;
  padding: 14px;
  border-radius: 20px;
  border: 2px solid var(--ai-border, #e8e2d6);
  background: rgba(255, 255, 255, 0.5);
}

.wd-tree-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wd-tree-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ai-text, #794f27);
}

.wd-tree-tips {
  margin: 6px 0 12px;
  font-size: 11px;
  color: var(--ai-text-2, #9f927d);
  line-height: 1.5;
}

.wd-node-act {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  cursor: pointer;

  &.act-edit {
    color: var(--ai-info, #5b9eee);
  }
  &.act-del {
    color: var(--ai-red, #fc736d);
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.wd-show-all {
  margin-top: 10px;
  padding: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2, #9f927d);
  border-radius: 10px;
  cursor: pointer;

  &:hover,
  &.is-active {
    background: rgba(25, 200, 185, 0.12);
    color: var(--ai-primary-active, #11a89b);
  }
}

.wd-main {
  flex: 1;
  min-width: 0;
}

.wd-main .filter-bar {
  margin-bottom: 14px;
}

.doc-title {
  font-weight: 600;
}

.doc-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
